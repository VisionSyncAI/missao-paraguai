import { PrismaClient } from "@prisma/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MAX_ATTEMPTS, backoffMs, claimMessage, enqueueEmail, processOutbox } from "../src/modules/comms/email";

const prisma = new PrismaClient();
const env = process.env as Record<string, string | undefined>;
const HOUR = 60 * 60 * 1000;

function key(tag: string) {
  return `TEST_${tag}:${Date.now()}:${Math.random().toString(36).slice(2)}:email`;
}

async function queue(tag: string) {
  return enqueueEmail({ eventType: "TEST", uniqueKey: key(tag), to: "dest@exemplo.com", subject: `Assunto ${tag}`, body: "Corpo" });
}

function resend(...responses: Array<number | Error>) {
  const fetchMock = vi.fn();
  for (const r of responses) {
    if (r instanceof Error) fetchMock.mockRejectedValueOnce(r);
    else fetchMock.mockResolvedValueOnce(new Response(r < 300 ? '{"id":"x"}' : "erro do provedor", { status: r }));
  }
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const later = (ms: number) => new Date(Date.now() + ms);
const row = (id: string) => prisma.messageOutbox.findUniqueOrThrow({ where: { id } });

beforeEach(() => {
  env.RESEND_API_KEY = "re_test_key";
  env.RESEND_FROM = "Imersão Paraguai <contato@exemplo.com>";
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete env.RESEND_API_KEY;
  delete env.RESEND_FROM;
  env.NODE_ENV = "test";
});

describe("outbox: enfileirar", () => {
  it("só grava PENDING, sem enviar na requisição", async () => {
    const fetchMock = resend();
    const queued = await queue("enqueue");
    expect(queued.status).toBe("PENDING");
    expect(queued.attempts).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mesma chave enfileirada em paralelo vira uma única mensagem, sem erro", async () => {
    const uniqueKey = key("race");
    const input = { eventType: "TEST", uniqueKey, to: "dest@exemplo.com", subject: "x", body: "y" };
    const rows = await Promise.all(Array.from({ length: 6 }, () => enqueueEmail(input)));
    expect(new Set(rows.map((r) => r.id)).size).toBe(1);
    expect(await prisma.messageOutbox.count({ where: { uniqueKey } })).toBe(1);
  });
});

describe("outbox: processamento", () => {
  it("envia, registra tentativa/horário e usa a chave única como Idempotency-Key", async () => {
    const queued = await queue("ok");
    const fetchMock = resend(200);
    await processOutbox({ ids: [queued.id] });
    const sent = await row(queued.id);
    expect(sent.status).toBe("SENT");
    expect(sent.attempts).toBe(1);
    expect(sent.sentAt).toBeTruthy();
    expect(sent.lastAttemptAt).toBeTruthy();
    expect(sent.error).toBeNull();
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["Idempotency-Key"]).toBe(queued.uniqueKey);
    expect(JSON.parse(String(init.body)).from).toBe("Imersão Paraguai <contato@exemplo.com>");
  });

  it("nunca envia duas vezes: mensagem SENT não é reprocessada nem reenfileirada", async () => {
    const queued = await queue("once");
    resend(200);
    await processOutbox({ ids: [queued.id] });
    const fetchMock = resend(200);
    await processOutbox({ ids: [queued.id], now: later(HOUR) });
    const again = await enqueueEmail({ eventType: "TEST", uniqueKey: queued.uniqueKey, to: "dest@exemplo.com", subject: "x", body: "y" });
    expect(again.status).toBe("SENT");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falha temporária (500) agenda retry com backoff e registra o erro", async () => {
    const queued = await queue("retry");
    resend(500);
    await processOutbox({ ids: [queued.id] });
    const failed = await row(queued.id);
    expect(failed.status).toBe("PENDING");
    expect(failed.attempts).toBe(1);
    expect(failed.error).toContain("resend 500");
    expect(failed.nextAttemptAt!.getTime()).toBeGreaterThan(Date.now() + 20_000);

    const notYet = resend(200);
    await processOutbox({ ids: [queued.id] });
    expect(notYet).not.toHaveBeenCalled();

    resend(200);
    await processOutbox({ ids: [queued.id], now: later(HOUR) });
    const sent = await row(queued.id);
    expect(sent.status).toBe("SENT");
    expect(sent.attempts).toBe(2);
  });

  it("timeout/erro de rede também é temporário", async () => {
    const queued = await queue("network");
    resend(new Error("The operation was aborted due to timeout"));
    await processOutbox({ ids: [queued.id] });
    const r = await row(queued.id);
    expect(r.status).toBe("PENDING");
    expect(r.error).toContain("timeout");
  });

  it("erro definitivo do provedor (422) marca FAILED sem retry", async () => {
    const queued = await queue("permanent");
    resend(422);
    await processOutbox({ ids: [queued.id] });
    const r = await row(queued.id);
    expect(r.status).toBe("FAILED");
    expect(r.nextAttemptAt).toBeNull();
    const fetchMock = resend(200);
    await processOutbox({ ids: [queued.id], now: later(HOUR) });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it(`após ${MAX_ATTEMPTS} tentativas vira FAILED permanente`, async () => {
    const queued = await queue("max");
    for (let i = 0; i < MAX_ATTEMPTS; i += 1) {
      resend(503);
      await processOutbox({ ids: [queued.id], now: later(2 * HOUR * (i + 1)) });
    }
    const r = await row(queued.id);
    expect(r.attempts).toBe(MAX_ATTEMPTS);
    expect(r.status).toBe("FAILED");
    const fetchMock = resend(200);
    await processOutbox({ ids: [queued.id], now: later(100 * HOUR) });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("FAILED antigo (sem tentativas) volta a ser processado", async () => {
    const queued = await queue("legacy");
    await prisma.messageOutbox.update({ where: { id: queued.id }, data: { status: "FAILED", attempts: 0, error: "resend 500" } });
    resend(200);
    await processOutbox({ ids: [queued.id] });
    expect((await row(queued.id)).status).toBe("SENT");
  });

  it("SENDING travado por worker que caiu é retomado após expirar a trava", async () => {
    const queued = await queue("stuck");
    await prisma.messageOutbox.update({ where: { id: queued.id }, data: { status: "SENDING", attempts: 1, lockedUntil: new Date(Date.now() - 1000) } });
    resend(200);
    await processOutbox({ ids: [queued.id] });
    const r = await row(queued.id);
    expect(r.status).toBe("SENT");
    expect(r.attempts).toBe(2);
  });

  it("dois workers disputando a mesma mensagem: só um vence", async () => {
    const queued = await queue("claim");
    const wins = await Promise.all(Array.from({ length: 5 }, () => claimMessage(queued.id)));
    expect(wins.filter(Boolean)).toHaveLength(1);
    expect((await row(queued.id)).attempts).toBe(1);
  });

  it("desenvolvimento sem RESEND_API_KEY: grava cópia local (DEV_LOGGED) sem chamar o provedor", async () => {
    delete env.RESEND_API_KEY;
    const queued = await queue("dev");
    const fetchMock = resend();
    await processOutbox({ ids: [queued.id] });
    expect((await row(queued.id)).status).toBe("DEV_LOGGED");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("produção sem RESEND_API_KEY: não consome tentativas; envia quando a chave aparece", async () => {
    delete env.RESEND_API_KEY;
    env.NODE_ENV = "production";
    const queued = await queue("noprovider");
    expect(queued.error).toContain("RESEND_API_KEY ausente");
    const fetchMock = resend();
    const skipped = await processOutbox({ ids: [queued.id] });
    expect(skipped.skipped).toBe("NO_PROVIDER");
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await row(queued.id)).attempts).toBe(0);

    env.RESEND_API_KEY = "re_test_key";
    resend(200);
    await processOutbox({ ids: [queued.id] });
    expect((await row(queued.id)).status).toBe("SENT");
  });
});

describe("outbox: backoff", () => {
  it("cresce exponencialmente e satura em 1h", () => {
    const mid = () => 0.5;
    expect(backoffMs(1, mid)).toBe(30_000);
    expect(backoffMs(2, mid)).toBe(60_000);
    expect(backoffMs(3, mid)).toBe(120_000);
    expect(backoffMs(20, mid)).toBe(HOUR);
  });
});
