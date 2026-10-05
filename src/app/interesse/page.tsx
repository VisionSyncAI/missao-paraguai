import { InterestForm } from "@/components/commercial/InterestForm";
import { SiteFrame } from "@/components/SiteFrame";

export const metadata = {
  title: "Interesse | PROVISION — Imersão Sem Fronteiras",
  description: "Conte seu objetivo e fale com um consultor da PROVISION: imersão executiva para 20 empresas brasileiras em Asunción, de 16 a 21 de novembro de 2026.",
  alternates: { canonical: "/interesse" },
};

export default function InteressePage() {
  return (
    <SiteFrame showCta={false}>
      <main className="px-5">
        <div className="mx-auto max-w-3xl pb-20 pt-10 md:pt-16">
          <InterestForm />
        </div>
      </main>
    </SiteFrame>
  );
}
