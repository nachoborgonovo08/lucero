import type { Metadata } from "next";
import Link from "next/link";
import { Stars } from "@/components/brand";
import { CopyButton } from "@/components/form";
import { requireUser } from "@/lib/auth";
import { publicUrl, requireBusiness } from "@/lib/business";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Inicio" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ bienvenida?: string }> }) {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const welcome = (await searchParams).bienvenida;

  const [s] = await sql<
    { views: number; ratings: number; clicks: number; avg: string | null; fb: number; sent: number }[]
  >`
    select
      count(*) filter (where type = 'view')::int as views,
      count(*) filter (where type = 'rating')::int as ratings,
      count(*) filter (where type = 'google_click')::int as clicks,
      round(avg(rating) filter (where type = 'rating'), 1)::text as avg,
      count(*) filter (where type = 'feedback')::int as fb,
      (select count(*)::int from customers where business_id = ${biz.id}
         and sent_at > now() - interval '30 days') as sent
    from events where business_id = ${biz.id} and created_at > now() - interval '30 days'`;

  const daily = await sql<{ day: string; views: number; clicks: number }[]>`
    select to_char(d, 'DD/MM') as day,
      count(e.*) filter (where e.type = 'view')::int as views,
      count(e.*) filter (where e.type = 'google_click')::int as clicks
    from generate_series(current_date - 13, current_date, interval '1 day') d
    left join events e on e.business_id = ${biz.id} and e.created_at::date = d::date
    group by d order by d`;
  const max = Math.max(1, ...daily.map((d) => d.views));

  const dist = await sql<{ rating: number; n: number }[]>`
    select rating, count(*)::int as n from events
    where business_id = ${biz.id} and type = 'rating' and created_at > now() - interval '30 days'
    group by rating`;
  const total = dist.reduce((a, d) => a + d.n, 0);

  const channels = await sql<{ source: string; views: number; clicks: number }[]>`
    select source, count(*) filter (where type = 'view')::int as views,
           count(*) filter (where type = 'google_click')::int as clicks
    from events where business_id = ${biz.id} and created_at > now() - interval '30 days'
    group by source`;
  const CHANNELS = [["qr", "QR"], ["whatsapp", "WhatsApp"], ["link", "Link directo"]] as const;
  const maxCh = Math.max(1, ...channels.map((c) => c.views));

  const url = publicUrl(biz.slug);
  const rate = s.views ? Math.round((s.clicks / s.views) * 100) : 0;
  const empty = s.views === 0 && s.sent === 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Últimos 30 días</p>
          <h1 className="h1">{biz.name}</h1>
        </div>
        <Link href="/app/pedir" className="btn btn-wa">Pedir reseñas por WhatsApp</Link>
      </header>

      {(welcome || empty) && (
        <section className="card border-star/50 bg-star-soft">
          <h2 className="font-semibold">Tus primeros 3 pasos</h2>
          <ol className="mt-3 space-y-2 text-sm">
            <li><b>1.</b> <Link className="underline" href="/app/qr">Imprimí tu cartel con QR</Link> y ponelo en el mostrador o la caja.</li>
            <li><b>2.</b> <Link className="underline" href="/app/pedir">Mandá 5 pedidos por WhatsApp</Link> a clientes de esta semana.</li>
            <li><b>3.</b> Probá vos mismo tu página: <a className="underline" href={url} target="_blank">{url.replace(/^https?:\/\//, "")}</a></li>
          </ol>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Visitas a tu página" value={s.views} />
        <Stat label="Pedidos enviados" value={s.sent} />
        <Stat label="Fueron a Google a reseñar" value={s.clicks} sub={s.views ? `${rate}% de las visitas` : undefined} highlight />
        <Stat label="Comentarios privados" value={s.fb} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold">Actividad de los últimos 14 días</h2>
          <div className="mt-5 flex h-36 items-end gap-1.5" role="img" aria-label="Visitas por día">
            {daily.map((d) => (
              <div key={d.day} className="group relative flex h-full flex-1 flex-col justify-end" title={`${d.day}: ${d.views} visitas, ${d.clicks} a Google`}>
                <div className="relative w-full rounded-t-md bg-line" style={{ height: `${Math.max(3, (d.views / max) * 100)}%` }}>
                  <div className="absolute inset-x-0 bottom-0 rounded-t-md bg-star" style={{ height: d.views ? `${(d.clicks / d.views) * 100}%` : 0 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>{daily[0]?.day}</span>
            <span>{daily.at(-1)?.day}</span>
          </div>
          <p className="mt-3 flex gap-4 text-xs text-muted">
            <span><i className="mr-1 inline-block size-2.5 rounded-sm bg-line" />Visitas</span>
            <span><i className="mr-1 inline-block size-2.5 rounded-sm bg-star" />Fueron a Google</span>
          </p>
        </div>

        <div className="card">
          <h2 className="font-semibold">Cómo te califican</h2>
          {total === 0 ? (
            <p className="mt-3 text-sm text-muted">Todavía no hay calificaciones. Aparecen cuando tus clientes abren tu página.</p>
          ) : (
            <>
              <p className="mt-3 flex items-center gap-2">
                <span className="text-3xl font-semibold">{s.avg}</span>
                <Stars value={Number(s.avg)} />
                <span className="text-sm text-muted">({total})</span>
              </p>
              <div className="mt-3 space-y-1.5">
                {[5, 4, 3, 2, 1].map((r) => {
                  const n = dist.find((d) => d.rating === r)?.n ?? 0;
                  return (
                    <div key={r} className="flex items-center gap-2 text-xs text-muted">
                      <span className="w-3">{r}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                        <div className="h-full rounded-full bg-star" style={{ width: `${(n / total) * 100}%` }} />
                      </div>
                      <span className="w-5 text-right">{n}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="card">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Qué canal te trae más reseñas</h2>
          <Link href="/app/qr" className="text-sm text-muted underline">Ver por QR</Link>
        </div>
        <div className="mt-4 space-y-3">
          {CHANNELS.map(([id, label]) => {
            const c = channels.find((x) => x.source === id) ?? { views: 0, clicks: 0 };
            return (
              <div key={id} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm">
                <span>{label}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${(c.views / maxCh) * 100}%` }} />
                </div>
                <span className="text-muted tabular-nums">{c.views} visitas · <b className="text-ink">{c.clicks}</b> a Google</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold">Tu link de reseñas</h2>
          <p className="truncate text-sm text-muted">{url}</p>
        </div>
        <div className="flex gap-2">
          <CopyButton text={url} label="Copiar link" />
          <a className="btn btn-ghost btn-sm" href={url} target="_blank">Abrir</a>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`card !p-4 ${highlight ? "!border-ink !bg-ink text-white" : ""}`}>
      <p className={`text-xs ${highlight ? "text-white/70" : "text-muted"}`}>{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {sub && <p className={`text-xs ${highlight ? "text-star" : "text-muted"}`}>{sub}</p>}
    </div>
  );
}
