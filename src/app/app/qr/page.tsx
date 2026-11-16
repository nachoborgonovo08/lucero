import type { Metadata } from "next";
import Link from "next/link";
import QRCode from "qrcode";
import { createQrPoint, deleteQrPoint } from "@/actions/business";
import { StarIcon } from "@/components/brand";
import { ActionForm, PrintButton, Submit } from "@/components/form";
import { requireUser } from "@/lib/auth";
import { publicUrl, requireBusiness } from "@/lib/business";
import { BRAND, limitsFor } from "@/lib/config";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Tus QR" };

type Point = { id: string; label: string; code: string; views: number; ratings: number; clicks: number };

export default async function QrPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const { q } = await searchParams;
  const points = await sql<Point[]>`
    select p.id, p.label, p.code,
      count(e.*) filter (where e.type = 'view')::int as views,
      count(e.*) filter (where e.type = 'rating')::int as ratings,
      count(e.*) filter (where e.type = 'google_click')::int as clicks
    from qr_points p
    left join events e on e.qr_id = p.id and e.created_at > now() - interval '30 days'
    where p.business_id = ${biz.id}
    group by p.id order by p.created_at`;
  const [general] = await sql<{ views: number; clicks: number }[]>`
    select count(*) filter (where type = 'view')::int as views,
           count(*) filter (where type = 'google_click')::int as clicks
    from events where business_id = ${biz.id} and source = 'qr' and qr_id is null
      and created_at > now() - interval '30 days'`;

  const selected = points.find((p) => p.code === q);
  const target = selected ? `${publicUrl(biz.slug)}?q=${selected.code}` : `${publicUrl(biz.slug)}?s=qr`;
  const svg = await QRCode.toString(target, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#14171f", light: "#ffffff" },
  });
  const max = limitsFor(user.plan).qrPerBusiness;

  return (
    <div className="space-y-6">
      <header className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">Tus QR</h1>
          <p className="mt-1 text-muted">Creá un QR para cada mesa, caja o persona del equipo y mirá cuál consigue más reseñas.</p>
        </div>
        <div className="flex gap-2">
          <a className="btn btn-ghost" href={`/api/qr/${biz.slug}?format=png${selected ? `&q=${selected.code}` : ""}`}>Descargar solo el QR</a>
          <PrintButton>Imprimir cartel</PrintButton>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <section className="no-print space-y-4">
          <div className="card !p-0">
            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-line px-5 py-3 text-xs text-muted">
              <span>QR · últimos 30 días</span><span>Escaneos</span><span>A Google</span><span className="w-12" />
            </div>
            <Row label="General" href="/app/qr" active={!selected} views={general.views} clicks={general.clicks} />
            {points.map((p) => (
              <Row key={p.id} label={p.label} href={`/app/qr?q=${p.code}`} active={selected?.id === p.id} views={p.views} clicks={p.clicks}>
                <form action={deleteQrPoint}>
                  <input type="hidden" name="id" value={p.id} />
                  <button className="cursor-pointer text-xs text-muted hover:text-bad" aria-label={`Borrar el QR ${p.label}`}>Borrar</button>
                </form>
              </Row>
            ))}
          </div>
          <ActionForm action={createQrPoint} resetOnOk className="card">
            <label className="label" htmlFor="label">Nuevo QR</label>
            <div className="flex gap-2">
              <input className="input" id="label" name="label" placeholder="Ej: Mesa 4, Caja, Sofi" maxLength={40} required />
              <Submit>Crear</Submit>
            </div>
            <p className="hint">{points.length} de {max} en tu plan. Si borrás un QR, el cartel impreso sigue funcionando pero deja de contarse aparte.</p>
          </ActionForm>
        </section>

        <div>
          <div className="mx-auto w-full max-w-sm rounded-3xl border border-line bg-white p-8 text-center shadow-sm print:mt-16 print:border-2 print:shadow-none">
            <div className="flex justify-center gap-1 text-star">
              {[1, 2, 3, 4, 5].map((n) => (
                <StarIcon key={n} className="size-8" />
              ))}
            </div>
            <p className="mt-5 text-3xl font-semibold leading-tight tracking-tight">¿Cómo te atendimos?</p>
            <p className="mt-2 text-muted">Contanos en 30 segundos. Escaneá con la cámara de tu celular.</p>
            <div className="mx-auto mt-6 w-56 rounded-2xl border border-line p-4" dangerouslySetInnerHTML={{ __html: svg }} />
            <p className="mt-6 text-xl font-semibold">{biz.name}</p>
            <p className="mt-1 text-xs text-muted">{selected ? `${selected.label} · ` : ""}Tu opinión nos ayuda a mejorar · {BRAND}</p>
          </div>
          <p className="no-print mt-3 text-center text-sm text-muted">Cartel de: <b>{selected?.label ?? "General"}</b>. Tamaño recomendado A5 o A6.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, href, active, views, clicks, children }: { label: string; href: string; active: boolean; views: number; clicks: number; children?: React.ReactNode }) {
  return (
    <div className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-4 border-b border-line px-5 py-3 last:border-0 ${active ? "bg-star-soft" : ""}`}>
      <Link href={href} className="truncate font-medium underline-offset-2 hover:underline">{label}</Link>
      <span className="w-14 text-right tabular-nums">{views}</span>
      <span className="w-14 text-right tabular-nums">{clicks}</span>
      <span className="w-12 text-right">{children}</span>
    </div>
  );
}
