import type { Metadata } from "next";
import { cancelSubscription, subscribe } from "@/actions/billing";
import { ActionForm, Submit } from "@/components/form";
import { hasAccess, planExpired, requireUser, trialDaysLeft } from "@/lib/auth";
import { syncPreapproval } from "@/lib/billing";
import { CopyButton } from "@/components/form";
import { ANNUAL_MONTHS_CHARGED, formatPrice, type PlanId, PLANS, TRANSFER, transferEnabled } from "@/lib/config";
import { sql } from "@/lib/db";
import { getPreapproval, mpConfigured, parseExternalRef } from "@/lib/mp";
import { waLink } from "@/lib/phone";

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
        const [fresh] = await sql<{ plan: typeof user.plan; plan_source: typeof user.plan_source; manual_until: Date | null }[]>`
          select plan, plan_source, manual_until from users where id = ${user.id}`;
        user = { ...user, ...fresh };
      }
    } catch (err) {
      console.error("[plan] no se pudo sincronizar el preapproval", err);
    }
  }

  const payments = await sql<{ id: string; amount: string | null; currency: string | null; status: string; created_at: Date }[]>`
    select id, amount, currency, status, created_at from payments where user_id = ${user.id} order by created_at desc limit 12`;
  const paying = user.plan !== "trial";
  const fmtDate = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Plan y pagos</h1>
        <p className="mt-1 text-muted">
          {planExpired(user)
            ? `Tu plan ${PLANS[user.plan as PlanId].name} venció el ${fmtDate.format(user.manual_until!)}. Renovalo para reactivar tu página y tus QR.`
            : paying
              ? `Tenés el plan ${PLANS[user.plan as PlanId].name} activo${user.manual_until ? ` hasta el ${fmtDate.format(user.manual_until)}` : ""}.`
              : hasAccess(user)
                ? `Estás en la prueba gratis: te quedan ${trialDaysLeft(user)} días.`
                : "Tu prueba gratis terminó. Elegí un plan para reactivar tu página y tus QR."}
        </p>
      </header>

      {!mpConfigured() && !transferEnabled() && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-bad">
          Los pagos todavía no están habilitados. Escribinos y te contamos cómo contratar.
        </p>
      )}

      {transferEnabled() && user.plan_source !== "mp" && (
        <section className="card border-star bg-star-soft">
          <h2 className="font-semibold">{user.plan_source === "manual" ? "Renovar por transferencia" : "Pagar por transferencia"}</h2>
          <p className="mt-1 text-sm">
            Transferí el monto del plan que elijas y mandanos el comprobante. Activamos tu plan en el día, por un mes.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-white px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted">Alias</p>
              <p className="break-all font-mono text-lg font-semibold">{TRANSFER.alias}</p>
              {TRANSFER.holder && <p className="text-xs text-muted">Titular: {TRANSFER.holder}</p>}
            </div>
            <CopyButton text={TRANSFER.alias} label="Copiar alias" />
          </div>
          <p className="mt-3 text-sm">
            <b>Pagando el año entero tenés 2 meses gratis:</b>{" "}
            {Object.values(PLANS).map((p) => `${p.name} ${formatPrice(p.price * ANNUAL_MONTHS_CHARGED)}`).join(" · ")}.
          </p>
          {!TRANSFER.whatsapp && <p className="hint">Respondé el email de bienvenida con el comprobante.</p>}
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
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
              {transferEnabled() && TRANSFER.whatsapp && user.plan_source !== "mp" && (
                <a
                  className={`btn mt-5 w-full ${p.id === "pro" ? "btn-primary" : "btn-ghost"}`}
                  target="_blank"
                  rel="noopener"
                  href={waLink(
                    TRANSFER.whatsapp,
                    `Hola! Transferí ${formatPrice(p.price)} por el plan ${p.name} de Lucero. Mi cuenta es ${user.email}. Te mando el comprobante.`,
                  )}
                >
                  {current ? "Ya transferí la renovación" : `Ya transferí: activar ${p.name}`}
                </a>
              )}
              {mpConfigured() && !current && user.plan_source !== "manual" && (
                <ActionForm action={subscribe} className="mt-5 space-y-3">
                  <input type="hidden" name="plan" value={p.id} />
                  <div>
                    <label className="label" htmlFor={`payer-${p.id}`}>Email de tu cuenta de Mercado Pago</label>
                    <input className="input" id={`payer-${p.id}`} name="payer_email" type="email" defaultValue={user.email} required />
                    <p className="hint">Tiene que ser el email con el que entrás a Mercado Pago.</p>
                  </div>
                  <Submit className={`btn w-full ${p.id === "pro" ? "btn-primary" : "btn-ghost"}`}>
                    {paying ? `Cambiar a ${p.name}` : `Elegir ${p.name}`}
                  </Submit>
                </ActionForm>
              )}
            </section>
          );
        })}
      </div>
      <p className="text-sm text-muted">
        {mpConfigured() && user.plan_source !== "manual"
          ? "Pago mensual con Mercado Pago. Sin permanencia: cancelás cuando quieras desde acá."
          : "Pago mensual por transferencia. Sin permanencia: si no renovás, el plan se pausa solo al vencer."}
        {paying && user.plan_source === "mp" && " Si cambiás de plan, el anterior se cancela solo al activarse el nuevo."}
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
