import type { Metadata } from "next";
import { CopyButton } from "@/components/form";
import { requireUser } from "@/lib/auth";
import { APP_URL, BRAND, REFERRAL_REWARD_DAYS, REFERRED_TRIAL_DAYS } from "@/lib/config";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Invitá y ganá" };

const LABEL: Record<string, string> = {
  signed_up: "Probando gratis",
  pending_reward: "Ya paga · tu mes gratis está en camino",
  rewarded: "Ya paga · premio acreditado",
};

export default async function ReferralsPage() {
  const user = await requireUser();
  const link = `${APP_URL}/registro?ref=${user.referral_code}`;
  const rows = await sql<{ name: string; status: string }[]>`
    select u.name, r.status from referrals r join users u on u.id = r.referred_id
    where r.referrer_id = ${user.id} order by r.created_at desc`;
  const text = `Estoy usando ${BRAND} para conseguir más reseñas en Google para mi negocio. Con este link tenés ${REFERRED_TRIAL_DAYS} días gratis en vez de 14: ${link}`;

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="h1">Invitá a otro negocio y ganá un mes gratis</h1>
        <p className="mt-1 text-muted">
          Quien entre con tu link tiene {REFERRED_TRIAL_DAYS} días de prueba. Cuando haga su primer pago, vos ganás {REFERRAL_REWARD_DAYS} días gratis.
        </p>
      </header>
      <section className="card space-y-3">
        <p className="break-all rounded-xl bg-paper px-3 py-2.5 font-mono text-sm">{link}</p>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={link} label="Copiar link" className="btn btn-primary btn-sm" />
          <a className="btn btn-wa btn-sm" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener">Compartir por WhatsApp</a>
        </div>
        <p className="hint">
          Si todavía estás en la prueba, los días se suman solos. Si ya pagás, te acreditamos el mes dentro de las 72 hs hábiles del primer pago de tu invitado.
        </p>
      </section>
      <section className="card">
        <h2 className="font-semibold">Tus invitados</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Todavía nadie se registró con tu link. Los negocios vecinos y tus proveedores son el mejor lugar para empezar.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line text-sm">
            {rows.map((r, i) => (
              <li key={i} className="flex justify-between gap-3 py-2">
                <span>{r.name}</span>
                <span className="text-muted">{LABEL[r.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
