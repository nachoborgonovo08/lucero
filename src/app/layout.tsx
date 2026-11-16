import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { APP_URL, BRAND, TAGLINE } from "@/lib/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: `${BRAND} · ${TAGLINE}`, template: `%s · ${BRAND}` },
  description:
    "Conseguí más reseñas en Google con un QR en tu mostrador y pedidos por WhatsApp. Respondé con IA y enterate de los problemas antes de que se hagan públicos.",
  openGraph: { type: "website", locale: "es_AR", siteName: BRAND },
};

export const viewport: Viewport = { themeColor: "#faf8f4" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
