import { InterestForm } from "@/components/commercial/InterestForm";

export const metadata = {
  title: "Interesse | Imersão Paraguai 2026",
};

export default function InteressePage() {
  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-[11px] tracking-[0.28em] uppercase text-red">Imersão Paraguai 2026</p>
        <h1 className="mt-4 font-display text-4xl md:text-6xl leading-[0.95]">Quero participar da imersão</h1>
        <p className="mt-6 max-w-xl text-gray">
          Preencha o interesse. Em seguida você baixa a apresentação executiva e conversa com um consultor.
          Esta etapa não realiza pagamento nem garante vaga.
        </p>
        <div className="mt-10">
          <InterestForm />
        </div>
      </div>
    </main>
  );
}
