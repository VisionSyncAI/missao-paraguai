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
      <input name="email" type="email" required placeholder="E-mail" className="rounded-lg border border-white/15 bg-black p-3" />
      <input name="password" type="password" required placeholder="Senha" className="rounded-lg border border-white/15 bg-black p-3" />
      {error && <p className="text-red">{error}</p>}
      <button className="rounded-xl bg-red px-5 py-3 text-xs font-bold tracking-[0.14em] uppercase">Entrar</button>
    </form>
  );
}
