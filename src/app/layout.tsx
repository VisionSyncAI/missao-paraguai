import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Imersão Paraguai 2026 | Vision Cybero AI × PROCEIT",
  description:
    "Uma experiência para conhecer o Paraguai por dentro, com quem entende de tecnologia, negócios e oportunidades.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="m-0 bg-[#050505]">{children}</body>
    </html>
  );
}
