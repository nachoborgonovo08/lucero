import type { Metadata } from "next";
import { cancelSubscription, subscribe } from "@/actions/billing";
import { ActionForm, Submit } from "@/components/form";
import { hasAccess, requireUser, trialDaysLeft } from "@/lib/auth";
import { syncPreapproval } from "@/lib/billing";
import { formatPrice, PLANS } from "@/lib/config";
import { sql } from "@/lib/db";
import { getPreapproval, mpConfigured, parseExternalRef } from "@/lib/mp";

export const metadata: Metadata = { title: "Plan y pagos" };

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ preapproval_id?: string }> }) {
  let user = await requireUser();

  // Vuelta desde el checkout de Mercado Pago: sincroniza sin esperar al webhook.
  const returned = (await searchParams).preapproval_id;
  if (returned && mpConfigured()) {
    try {
      const pre = await getPreapproval(returned);
      if (parseExternalRef(pre.external_reference)?.userId === user.id) {
        await syncPreapproval(pre);
        const [fresh] = await sql<{ plan: typeof user.plan; plan_source: typeof user.plan_source }[]>`
          select plan, plan_source from users where id = ${user.id}`;
        user = { ...user, ...fresh };
      }
    } catch (err) {
      console.error("[plan] no se pudo sincronizar el preapproval", err);
    }
  }

  const payments = await sql<{ id: string; amount: string | null; currency: string | null; status: string; created_at: Date }[]>`
    select id, amount, currency, status, created_at from payments where user_id = ${user.id} order by created_at desc limit 12`;
  const paying = user.plan !== "trial";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Plan y pagos</h1>
        <p className="mt-1 text-muted">
          {paying
            ? `Tenés el plan ${PLANS[user.plan as "esencial" | "pro"].name} activo.`
            : hasAccess(user)
              ? `Estás en la prueba gratis: te quedan ${trialDaysLeft(user)} días.`
              : "Tu prueba gratis terminó. Elegí un plan para reactivar tu página y tu QR."}
        </p>
      </header>

      {!mpConfigured() && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-bad">
          Los pagos todavía no están habilitados en este sitio (falta configurar Mercado Pago).
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {Object.values(PLANS).map((p) => {
          const current = user.plan === p.id;
          return (
            <section key={p.id} className={`card flex flex-col ${p.id === "pro" ? "border-ink" : ""}`}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                {current && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-ok">Tu plan</span>}
              </div>
              <p className="mt-2">
                <span className="text-3xl font-semibold">{formatPrice(p.price)}</span>
                <span className="text-muted"> / mes</span>
              </p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><span className="text-ok">✓</span>{f}</li>
                ))}
              </ul>
              {!current && user.plan_source !== "manual" && (
                <ActionForm action={subscribe} className="mt-5 space-y-3">
                  <input type="hidden" name="plan" value={p.id} />
                  <div>
                    <label className="label" htmlFor={`payer-${p.id}`}>Email de tu cuenta de Mercado Pago</label>
                    <input className="input" id={`payer-${p.id}`} name="payer_email" type="email" defaultValue={user.email} required />
                    <p className="hint">Tiene que ser el email con el que entrás a Mercado Pago.</p>
                  </div>
                  <Submit className={`btn w-full ${p.id === "pro" ? "btn-primary" : "btn-ghost"}`}>
                    {paying ? `Cambiar a ${p.name}` : `Suscribirme a ${p.name}`}
                  </Submit>
                </ActionForm>
              )}
            </section>
          );
        })}
      </div>
      <p className="text-sm text-muted">
        Pago mensual con Mercado Pago. Sin permanencia: cancelás cuando quieras desde acá.
        {paying && user.plan_source === "mp" && " Si cambiás de plan, cancelá el anterior después de activar el nuevo."}
      </p>

      {user.plan_source === "mp" && (
        <form action={cancelSubscription} className="card flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">Al cancelar, tu página de reseñas y tu QR dejan de funcionar.</p>
          <button className="btn btn-ghost btn-sm text-bad">Cancelar suscripción</button>
        </form>
      )}

      {payments.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">Pagos</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex justify-between py-2">
                <span>{new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(p.created_at)}</span>
                <span className="text-muted">{p.amount ? `${p.currency} ${Number(p.amount).toLocaleString("es-AR")}` : ""} · {p.status === "approved" ? "Aprobado" : p.status}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
