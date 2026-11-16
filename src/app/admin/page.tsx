import type { Metadata } from "next";
import Link from "next/link";
import { extendTrial, markReferralRewarded, setManualPlan } from "@/actions/admin";
import { requireAdmin } from "@/lib/auth";
import { CURRENCY, formatPrice, PLANS } from "@/lib/config";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminPage() {
  await requireAdmin();
  const [m] = await sql<{ users: number; trials: number; expired: number; esencial: number; pro: number; week: number; events: number }[]>`
    select count(*)::int as users,
      count(*) filter (where plan = 'trial' and trial_ends_at > now())::int as trials,
      count(*) filter (where plan = 'trial' and trial_ends_at <= now())::int as expired,
      count(*) filter (where plan = 'esencial')::int as esencial,
      count(*) filter (where plan = 'pro')::int as pro,
      count(*) filter (where created_at > now() - interval '7 days')::int as week,
      (select count(*)::int from events where created_at > now() - interval '7 days') as events
    from users`;
  const [{ mrr }] = await sql<{ mrr: string }[]>`
    select coalesce(sum(amount), 0)::text as mrr from subscriptions where status = 'authorized'`;
  const manualMrr = await sql<{ plan: "esencial" | "pro"; n: number }[]>`
    select plan, count(*)::int as n from users where plan_source = 'manual' group by plan`;
  const users = await sql<
    { id: string; email: string; name: string; plan: string; plan_source: string | null; trial_ends_at: Date; created_at: Date; biz: string | null; events30: number }[]
  >`
    select u.id, u.email, u.name, u.plan, u.plan_source, u.trial_ends_at, u.created_at,
      (select string_agg(name, ', ') from businesses where owner_id = u.id) as biz,
      (select count(*)::int from events e join businesses b on b.id = e.business_id
         where b.owner_id = u.id and e.created_at > now() - interval '30 days') as events30
    from users u order by u.created_at desc limit 200`;
  const rewards = await sql<{ id: string; referrer: string; referred: string }[]>`
    select r.id, a.email as referrer, b.email as referred from referrals r
    join users a on a.id = r.referrer_id join users b on b.id = r.referred_id
    where r.status = 'pending_reward'`;
  const fmt = new Intl.DateTimeFormat("es-AR", { dateStyle: "short" });
  const paying = m.esencial + m.pro;
  const decided = paying + m.expired;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="h1">Admin</h1>
        <Link href="/app" className="btn btn-ghost btn-sm">Volver al panel</Link>
      </header>
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["MRR por Mercado Pago", `${formatPrice(Number(mrr))}`],
          ["Clientes que pagan", `${paying} (${m.esencial} Esencial · ${m.pro} Pro)`],
          ["En prueba / vencidas", `${m.trials} / ${m.expired}`],
          ["Prueba → pago", decided ? `${Math.round((paying / decided) * 100)}%` : "—"],
          ["Cuentas totales", m.users],
          ["Altas últimos 7 días", m.week],
          ["Eventos últimos 7 días", m.events],
          ["Planes manuales", manualMrr.map((x) => `${x.n} ${PLANS[x.plan].name}`).join(" · ") || "0"],
        ].map(([k, v]) => (
          <div key={k} className="card !p-4">
            <p className="text-xs text-muted">{k}</p>
            <p className="mt-1 text-xl font-semibold">{v}</p>
          </div>
        ))}
      </section>
      <p className="text-xs text-muted">MRR en {CURRENCY}, suma de suscripciones autorizadas en Mercado Pago.</p>

      {rewards.length > 0 && (
        <section className="card">
          <h2 className="font-semibold">Premios de referidos por acreditar</h2>
          <p className="hint">Devolvé un mes al referente desde Mercado Pago y marcá el premio como acreditado.</p>
          <ul className="mt-3 divide-y divide-line text-sm">
            {rewards.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2">
                <span>{r.referrer} invitó a {r.referred}</span>
                <form action={markReferralRewarded}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="btn btn-ghost btn-sm">Marcar acreditado</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              {["Cuenta", "Negocio", "Plan", "Fin de prueba", "Uso 30 d", "Alta", "Acciones"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3"><b>{u.name}</b><br /><span className="text-muted">{u.email}</span></td>
                <td className="px-4 py-3">{u.biz ?? "—"}</td>
                <td className="px-4 py-3">{u.plan}{u.plan_source ? ` (${u.plan_source})` : ""}</td>
                <td className="px-4 py-3">{fmt.format(u.trial_ends_at)}</td>
                <td className="px-4 py-3 tabular-nums">{u.events30}</td>
                <td className="px-4 py-3">{fmt.format(u.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <form action={extendTrial}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="days" value="14" />
                      <button className="btn btn-ghost btn-sm">+14 días</button>
                    </form>
                    {u.plan_source !== "mp" && (
                      <form action={setManualPlan} className="flex gap-1">
                        <input type="hidden" name="id" value={u.id} />
                        <select name="plan" defaultValue={u.plan} className="input !w-auto !py-1 text-xs" aria-label="Plan manual">
                          <option value="trial">trial</option>
                          <option value="esencial">esencial</option>
                          <option value="pro">pro</option>
                        </select>
                        <button className="btn btn-ghost btn-sm">Fijar</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
