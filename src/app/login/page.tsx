"use client";

import { safeInternalPath } from "@/lib/safePath";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginInner() {
  const params = useSearchParams();
  const [token, setToken] = useState(params.get("t") || "");
  const [error, setError] = useState("");
  const next = safeInternalPath(params.get("next"), "/participante", ["/participante"]);

  return (
    <main className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-md">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">Participante</p>
        <h1 className="mt-2 text-4xl">Entrar</h1>
        <p className="mt-3 text-sm text-gray">Use o link enviado após a proposta aceita ou o pagamento confirmado.</p>
        <label className="mt-6 block text-sm text-gray" htmlFor="participant-token">Token de acesso</label>
        <input
          id="participant-token"
          autoComplete="one-time-code"
          className="mt-2 w-full rounded-lg border border-white/15 bg-black p-3 text-base"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Token de acesso"
        />
        <button
          className="mt-4 min-h-12 w-full rounded-xl bg-red px-5 py-3 text-xs font-bold uppercase tracking-widest"
          onClick={async () => {
            const res = await fetch("/api/auth/participant", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
            if (!res.ok) {
              const json = await res.json();
              setError(json.error || "Acesso negado");
              return;
            }
            window.location.href = next;
          }}
        >
          Entrar
        </button>
        {error && <p className="mt-3 text-sm text-red" role="alert">{error}</p>}
        <p className="mt-8 text-xs text-gray">
          Equipe: <a className="inline-flex min-h-11 items-center underline" href="/admin/login">acesso administrativo</a>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-black p-10 text-white">Carregando…</main>}>
      <LoginInner />
    </Suspense>
  );
}
