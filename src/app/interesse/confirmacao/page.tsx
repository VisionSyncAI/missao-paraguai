import { Suspense } from "react";
import { ConfirmationView } from "@/components/commercial/ConfirmationView";

export const metadata = { title: "Pré-inscrição recebida | Imersão Paraguai" };

export default function ConfirmacaoPage() {
  return (
    <main className="min-h-dvh bg-black px-5 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<p className="text-gray">Carregando…</p>}>
          <ConfirmationView />
        </Suspense>
      </div>
    </main>
  );
}
