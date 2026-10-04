import { InterestForm } from "@/components/commercial/InterestForm";

export const metadata = {
  title: "Interesse | PROVISION — Imersão Sem Fronteiras",
  description: "Conte seu objetivo e fale com um consultor da PROVISION: imersão executiva para 20 empresas brasileiras em Asunción, de 16 a 21 de novembro de 2026.",
  alternates: { canonical: "/interesse" },
};

export default function InteressePage() {
  return (
    <main className="min-h-dvh bg-black px-5 text-white">
      <div className="mx-auto max-w-3xl pb-20 pt-10 md:pt-16">
        <InterestForm />
      </div>
    </main>
  );
}
