import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site";
import { GUIDES, NICHES } from "@/lib/content";

export const metadata: Metadata = {
  title: "Guías para conseguir y responder reseñas de Google",
  description: "Guías prácticas y gratuitas para negocios locales: cómo conseguir reseñas en Google, cómo responder las negativas y cómo encontrar tu link de reseñas.",
  alternates: { canonical: "/guias" },
};

export default function GuidesIndex() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <h1 className="text-4xl font-semibold tracking-tight">Guías</h1>
        <p className="mt-3 text-lg text-muted">Lo que funciona para conseguir y responder reseñas en Google, sin trucos.</p>
        <ul className="mt-8 space-y-4">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link href={`/guias/${g.slug}`} className="card block transition hover:border-ink">
                <h2 className="text-xl font-semibold">{g.title}</h2>
                <p className="mt-2 text-muted">{g.description}</p>
                <p className="mt-3 text-sm text-star-deep">Lectura de {g.minutes} minutos →</p>
              </Link>
            </li>
          ))}
        </ul>
        <h2 className="mt-14 text-2xl font-semibold tracking-tight">Por rubro</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {NICHES.map((n) => (
            <li key={n.slug}>
              <Link href={`/para/${n.slug}`} className="card block !p-4 first-letter:uppercase transition hover:border-ink">{n.name} →</Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
