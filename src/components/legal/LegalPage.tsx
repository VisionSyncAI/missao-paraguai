import type { ReactNode } from "react";

/** Shared shell for /privacidade and /termos: readable, dark, same brand as the landing. */
export function LegalPage({
  kicker,
  title,
  version,
  pending,
  children,
}: {
  kicker: string;
  title: string;
  version: string;
  pending: string[];
  children: ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-black px-5 py-16 text-white">
      <article className="mx-auto max-w-3xl">
        <a href="/" className="text-sm text-gray underline underline-offset-4">← PROVISION · Imersão Sem Fronteiras</a>
        <p className="mt-10 text-[12px] uppercase tracking-[0.2em] text-[#c9a96a]">{kicker}</p>
        <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{title}</h1>
        <p className="mt-3 text-sm text-gray">Versão {version}</p>
        <div className="legal mt-10 space-y-8 text-[15px] leading-relaxed text-[#e8e6e1]">{children}</div>
        <section className="mt-12 rounded-xl border border-[#c9a96a]/40 p-6">
          <h2 className="font-display text-xl">Em validação jurídica</h2>
          <p className="mt-2 text-sm text-gray">Os pontos abaixo ainda estão sendo definidos pelo responsável jurídico da organização. Esta página será atualizada, com nova versão, quando forem aprovados.</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray">
            {pending.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
        <p className="mt-10 text-sm text-gray">
          Dúvidas: fale com a equipe PROVISION pelo WhatsApp{" "}
          <a className="text-white underline underline-offset-4" href="https://wa.me/5551997164254" target="_blank" rel="noopener noreferrer">+55 51 99716-4254</a>.
        </p>
      </article>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
