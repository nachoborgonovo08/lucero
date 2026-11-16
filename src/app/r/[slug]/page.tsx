import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReviewFlow } from "@/components/review-flow";
import { hasAccess } from "@/lib/auth";
import { BRAND, type PlanState } from "@/lib/config";
import { sql } from "@/lib/db";

type Row = { name: string; google_review_url: string; plan: PlanState; trial_ends_at: Date };

async function load(slug: string) {
  const [row] = await sql<Row[]>`
    select b.name, b.google_review_url, u.plan, u.trial_ends_at
    from businesses b join users u on u.id = b.owner_id where b.slug = ${slug}`;
  return row;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const biz = await load((await params).slug);
  return { title: biz ? `Tu opinión sobre ${biz.name}` : "No encontrado", robots: { index: false } };
}

export default async function PublicReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ c?: string; s?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { c, s, q } = await searchParams;
  const biz = await load(slug);
  if (!biz) notFound();
  const active = hasAccess(biz);

  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="card !p-7 shadow-sm">
          {active ? (
            <ReviewFlow slug={slug} name={biz.name} googleUrl={biz.google_review_url} token={c?.slice(0, 40)} qr={q?.slice(0, 20)} source={c ? "whatsapp" : s === "qr" || q ? "qr" : "link"} />
          ) : (
            <div className="text-center">
              <h1 className="text-xl font-semibold">{biz.name}</h1>
              <p className="mt-2 text-muted">Esta página está en pausa por el momento. ¡Gracias por tu visita!</p>
            </div>
          )}
        </div>
        <p className="mt-5 text-center text-xs text-muted">
          Hecho con <a className="underline" href="/?utm_source=pagina-resenas">{BRAND}</a> · Más reseñas para negocios locales
        </p>
      </div>
    </main>
  );
}
