import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site";
import { APP_URL, BRAND, TRIAL_DAYS } from "@/lib/config";
import { GUIDES } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((g) => ({ slug: g.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return {};
  return { title: g.title, description: g.description, alternates: { canonical: `/guias/${g.slug}` }, openGraph: { type: "article" } };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  const others = GUIDES.filter((x) => x.slug !== g.slug);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-14">
        <p className="text-sm text-muted"><Link className="underline" href="/guias">Guías</Link> · Lectura de {g.minutes} minutos</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">{g.title}</h1>
        <p className="mt-5 text-lg text-muted">{g.intro}</p>

        <article className="mt-10 space-y-9 leading-relaxed">
          {g.sections.map((s) => {
            const List = s.ordered ? "ol" : "ul";
            return (
              <section key={s.h} className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight">{s.h}</h2>
                {s.p?.slice(0, s.list ? 1 : undefined).map((t) => <p key={t}>{t}</p>)}
                {s.quote && <blockquote className="rounded-xl border-l-4 border-star bg-star-soft px-5 py-4">{s.quote}</blockquote>}
                {s.list && (
                  <List className={`space-y-2 pl-6 ${s.ordered ? "list-decimal" : "list-disc"}`}>
                    {s.list.map((i) => <li key={i}>{i}</li>)}
                  </List>
                )}
                {s.list && s.p?.slice(1).map((t) => <p key={t}>{t}</p>)}
              </section>
            );
          })}
        </article>

        <div className="mt-12 rounded-3xl bg-ink px-6 py-10 text-center text-white">
          <h2 className="text-2xl font-semibold">Hacelo fácil con {BRAND}</h2>
          <p className="mx-auto mt-2 max-w-md text-white/75">QR con estadísticas, pedidos por WhatsApp con un toque y respuestas con IA. {TRIAL_DAYS} días gratis, sin tarjeta.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/registro" className="btn btn-star">Probar gratis</Link>
            <Link href="/calculadora" className="btn border border-white/30 text-white hover:bg-white/10">Calculadora de reseñas</Link>
          </div>
        </div>

        <h2 className="mt-12 text-xl font-semibold">Seguí leyendo</h2>
        <ul className="mt-3 space-y-2">
          {others.map((o) => (
            <li key={o.slug}><Link className="underline" href={`/guias/${o.slug}`}>{o.title}</Link></li>
          ))}
        </ul>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.title,
            description: g.description,
            inLanguage: "es",
            mainEntityOfPage: `${APP_URL}/guias/${g.slug}`,
            publisher: { "@type": "Organization", name: BRAND },
          }),
        }}
      />
    </>
  );
}
