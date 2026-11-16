import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site";
import { BRAND, formatPrice, PLANS, TRIAL_DAYS } from "@/lib/config";
import { NICHES } from "@/lib/content";

export const dynamicParams = false;
export const generateStaticParams = () => NICHES.map((n) => ({ rubro: n.slug }));

export async function generateMetadata({ params }: { params: Promise<{ rubro: string }> }): Promise<Metadata> {
  const { rubro } = await params;
  const n = NICHES.find((x) => x.slug === rubro);
  if (!n) return {};
  return { title: n.title, description: n.intro, alternates: { canonical: `/para/${n.slug}` } };
}

export default async function NichePage({ params }: { params: Promise<{ rubro: string }> }) {
  const { rubro } = await params;
  const n = NICHES.find((x) => x.slug === rubro);
  if (!n) notFound();
  const sample = n.whatsapp.replace("{nombre}", "Carla").replace("{negocio}", "tu negocio").replace("{link}", "(tu link)");

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pb-14 pt-14 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-star-deep">{BRAND} para {n.name}</p>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">{n.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">{n.intro}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/registro" className="btn btn-star !px-6 !py-3.5 text-base">Probar gratis {TRIAL_DAYS} días</Link>
            <Link href="/calculadora" className="btn btn-ghost !py-3.5">¿Cuántas reseñas necesito?</Link>
          </div>
          <p className="mt-3 text-sm text-muted">Sin tarjeta · Desde {formatPrice(PLANS.esencial.price)} por mes</p>
        </section>

        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
            {n.pains.map((p) => (
              <div key={p.t}>
                <h2 className="text-lg font-semibold">{p.t}</h2>
                <p className="mt-2 text-muted">{p.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-2">
          <div className="card">
            <h2 className="text-xl font-semibold">Dónde poner tu QR</h2>
            <ul className="mt-4 space-y-2.5">
              {n.qrSpots.map((s) => (
                <li key={s} className="flex gap-2.5"><span className="text-ok">✓</span>{s}</li>
              ))}
            </ul>
            <p className="mt-5 rounded-xl bg-star-soft p-4 text-star-deep">
              <span className="block text-xs font-semibold uppercase tracking-wider">La frase que funciona</span>
              {n.askLine}
            </p>
          </div>
          <div className="card">
            <h2 className="text-xl font-semibold">El WhatsApp que mandás con un toque</h2>
            <p className="mt-2 text-muted">Sale de tu propio número, con el nombre de cada cliente. Lo podés cambiar cuando quieras.</p>
            <p className="mt-5 max-w-sm rounded-2xl rounded-bl-sm bg-[#dcf8c6] p-4 leading-snug shadow-sm">{sample}</p>
            <p className="mt-5 text-sm text-muted">Después ves quién lo abrió, quién calificó y quién fue a Google.</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16">
          <h2 className="text-2xl font-semibold tracking-tight">Preguntas de {n.name}</h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {n.faq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="text-muted transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-2 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl rounded-3xl bg-ink px-6 py-12 text-center text-white">
            <h2 className="text-3xl font-semibold tracking-tight">Empezá con los clientes de esta semana</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/75">Creá tu cuenta, imprimí tu QR y mandá tus primeros 5 pedidos. {TRIAL_DAYS} días gratis, sin tarjeta.</p>
            <Link href="/registro" className="btn btn-star mt-7 !px-7 !py-3.5 text-base">Probar gratis</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: n.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
    </>
  );
}
