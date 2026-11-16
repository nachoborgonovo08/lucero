import type { Metadata } from "next";
import { markFeedbackRead } from "@/actions/requests";
import { Stars } from "@/components/brand";
import { Insights } from "@/components/insights";
import { requireUser } from "@/lib/auth";
import { requireBusiness } from "@/lib/business";
import { MIN_FEEDBACK_FOR_INSIGHTS } from "@/lib/config";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Buzón privado" };

export default async function FeedbackPage() {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const items = await sql<
    { id: string; rating: number | null; message: string; contact: string | null; read_at: Date | null; created_at: Date; name: string | null }[]
  >`
    select f.id, f.rating, f.message, f.contact, f.read_at, f.created_at, c.name
    from feedback f left join customers c on c.id = f.customer_id
    where f.business_id = ${biz.id} order by f.created_at desc limit 100`;

  const [{ recent }] = await sql<{ recent: number }[]>`
    select count(*)::int as recent from feedback
    where business_id = ${biz.id} and created_at > now() - interval '90 days'`;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Buzón privado</h1>
        <p className="mt-1 text-muted">Lo que tus clientes prefirieron decirte a vos directamente. Respondé rápido: un problema bien resuelto suele terminar en una buena reseña.</p>
      </header>
      <Insights count={recent} min={MIN_FEEDBACK_FOR_INSIGHTS} />
      {items.length === 0 ? (
        <div className="card text-center text-sm text-muted">Todavía no recibiste comentarios privados.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((f) => (
            <li key={f.id} className={`card ${f.read_at ? "" : "border-star"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {f.rating && <Stars value={f.rating} />}
                  <span className="text-sm font-medium">{f.name ?? "Cliente anónimo"}</span>
                </div>
                <time className="text-xs text-muted">{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(f.created_at)}</time>
              </div>
              <p className="mt-3 whitespace-pre-wrap">{f.message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted">{f.contact ? `Contacto: ${f.contact}` : "No dejó contacto"}</span>
                {!f.read_at && (
                  <form action={markFeedbackRead}>
                    <input type="hidden" name="id" value={f.id} />
                    <button className="btn btn-ghost btn-sm">Marcar como leído</button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
