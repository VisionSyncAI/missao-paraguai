import { logError, logInfo } from "@/lib/logger";
import { processOutbox } from "@/modules/comms/email";

const INTERVAL_MS = 15_000;
const globalForWorker = globalThis as unknown as { outboxWorker?: NodeJS.Timeout };

/** Periodic outbox delivery inside the web process. Claims are atomic, so extra replicas are safe. */
export function startOutboxWorker() {
  if (globalForWorker.outboxWorker) return;
  let warnedNoProvider = false;
  const tick = () => {
    processOutbox()
      .then((result) => {
        if (result.skipped === "NO_PROVIDER" && !warnedNoProvider) {
          warnedNoProvider = true;
          logError("outbox_provider_missing", { hint: "Defina RESEND_API_KEY e RESEND_FROM; mensagens ficam PENDING até lá." });
        }
      })
      .catch((error) => {
      logError("outbox_worker_failed", { code: error instanceof Error ? error.message : "UNKNOWN" });
    });
  };
  globalForWorker.outboxWorker = setInterval(tick, INTERVAL_MS);
  globalForWorker.outboxWorker.unref();
  setTimeout(tick, 2_000).unref();
  logInfo("outbox_worker_started", { intervalMs: INTERVAL_MS });
}
