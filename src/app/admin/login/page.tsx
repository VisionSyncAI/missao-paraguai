import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "CRM | PROVISION Paraguai 2026" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-black px-5 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0c0c0c] p-8">
        <p className="text-[11px] tracking-[0.2em] uppercase text-red">Backoffice</p>
        <h1 className="mt-3 text-3xl">CRM PROVISION Paraguai 2026</h1>
        <div className="mt-8">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
