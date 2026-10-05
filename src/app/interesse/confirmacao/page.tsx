import { Suspense } from "react";
import { ConfirmationView } from "@/components/commercial/ConfirmationView";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata = { title: "Pré-inscrição recebida | PROVISION — Imersão Sem Fronteiras", robots: { index: false, follow: false } };

export default function ConfirmacaoPage() {
  return (
    <SiteFrame showCta={false}>
      <main className="px-5 py-16">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<p className="text-[#9a9a94]">Carregando…</p>}>
            <ConfirmationView />
          </Suspense>
        </div>
      </main>
    </SiteFrame>
  );
}
