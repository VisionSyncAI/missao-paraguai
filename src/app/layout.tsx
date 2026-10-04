import type { Metadata } from "next";
import { Archivo, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";

// Same type system as the landing: Archivo for titles, IBM Plex Sans for text.
const archivo = Archivo({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-archivo", display: "swap" });
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://missaoparaguai.com"),
  openGraph: {
    siteName: "PROVISION",
    locale: "pt_BR",
    type: "website",
    images: [{ url: "/og/provision-paraguai-2026.jpg", width: 1200, height: 630, alt: "PROVISION — Imersão Sem Fronteiras | Paraguai 2026 · 16–21 nov · Asunción" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/provision-paraguai-2026.jpg"] },
  title: "PROVISION — Imersão Sem Fronteiras | Paraguai 2026",
  description:
    "Imersão executiva para 20 empresas brasileiras, uma vaga por empresa, em Asunción, de 16 a 21 de novembro de 2026.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${plexSans.variable}`}>
      <body className="m-0 bg-[#050505]">{children}</body>
    </html>
  );
}
