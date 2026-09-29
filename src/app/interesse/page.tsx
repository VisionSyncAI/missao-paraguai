import { InterestForm } from "@/components/commercial/InterestForm";

export const metadata = {
  title: "Interesse | Imersão Paraguai 2026",
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
