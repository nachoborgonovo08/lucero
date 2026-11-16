import type { Metadata } from "next";
import Link from "next/link";
import { switchBusiness } from "@/actions/business";
import { requireUser } from "@/lib/auth";
import { listBusinesses } from "@/lib/business";
import { limitsFor } from "@/lib/config";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Mis negocios" };

type Row = { id: string; name: string; views: number; clicks: number; avg: string | null; unread: number; last: Date | null };

/** Vista general para quien maneja varios negocios (plan Pro o Agencia). */
export default async function BusinessesPage() {
  const user = await requireUser();
  const all = await listBusinesses(user.id);
  const max = limitsFor(user.plan).maxBusinesses;
  const rows = all.length
    ? await sql<Row[]>`
        select b.id, b.name,
          count(e.*) filter (where e.type = 'view')::int as views,
          count(e.*) filter (where e.type = 'google_click')::int as clicks,
          round(avg(e.rating) filter (where e.type = 'rating'), 1)::text as avg,
          (select count(*)::int from feedback f where f.business_id = b.id and f.read_at is null) as unread,
          max(e.created_at) as last
        from businesses b
        left join events e on e.business_id = b.id and e.created_at > now() - interval '30 days'
        where b.owner_id = ${user.id}
        group by b.id order by clicks desc, b.name`
    : [];
  const fmt = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">Mis negocios</h1>
          <p className="mt-1 text-muted">{all.length} de {max} en tu plan · últimos 30 días</p>
        </div>
        {all.length < max ? (
          <Link href="/app/alta" className="btn btn-primary">Agregar negocio</Link>
        ) : (
          <Link href="/app/plan" className="btn btn-ghost">Ampliar plan</Link>
        )}
      </header>
      <section className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              {["Negocio", "Visitas", "A Google", "Calificación", "Sin leer", "Última actividad", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3 tabular-nums">{r.views}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">{r.clicks}</td>
                <td className="px-4 py-3">{r.avg ? `${r.avg} ★` : "—"}</td>
                <td className="px-4 py-3">{r.unread || "—"}</td>
                <td className="px-4 py-3 text-muted">{r.last ? fmt.format(r.last) : "Sin actividad"}</td>
                <td className="px-4 py-3 text-right">
                  <form action={switchBusiness}>
                    <input type="hidden" name="id" value={r.id} />
                    <button className="btn btn-ghost btn-sm">Abrir</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="text-sm text-muted">Los negocios sin actividad en 30 días son los que conviene llamar primero.</p>
    </div>
  );
}
