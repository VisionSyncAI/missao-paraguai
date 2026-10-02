"use client";

import { FormEvent, useState } from "react";
import { safeInternalPath } from "@/lib/safePath";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState("");
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Falha no login");
      return;
    }
    router.push(safeInternalPath(params.get("next"), "/admin/leads", ["/admin"]));
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-2 text-sm text-gray">
        E-mail
        <input name="email" type="email" required autoComplete="username" inputMode="email" className="rounded-lg border border-white/15 bg-black p-3 text-base text-white" />
      </label>
      <label className="grid gap-2 text-sm text-gray">
        Senha
        <input name="password" type="password" required autoComplete="current-password" className="rounded-lg border border-white/15 bg-black p-3 text-base text-white" />
      </label>
      {error && <p className="text-red" role="alert">{error}</p>}
      <button className="min-h-12 rounded-xl bg-red px-5 py-3 text-xs font-bold tracking-[0.14em] uppercase">Entrar</button>
    </form>
  );
}
