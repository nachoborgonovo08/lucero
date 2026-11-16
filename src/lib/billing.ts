import { REFERRAL_REWARD_DAYS } from "./config";
import { sql } from "./db";
import { type AuthorizedPayment, type Preapproval, parseExternalRef } from "./mp";

/**
 * Sincroniza el estado de una suscripción de Mercado Pago con la base.
 * La fuente de verdad es siempre la API de MP (nunca el cuerpo del webhook).
 */
export async function syncPreapproval(pre: Preapproval) {
  const ref = parseExternalRef(pre.external_reference);
  if (!ref) return null;
  const [user] = await sql<{ id: string }[]>`select id from users where id = ${ref.userId}`;
  if (!user) return null;

  await sql`
    insert into subscriptions (user_id, provider_id, plan, status, amount, currency, payer_email)
    values (${ref.userId}, ${pre.id}, ${ref.plan}, ${pre.status},
            ${pre.auto_recurring.transaction_amount}, ${pre.auto_recurring.currency_id}, ${pre.payer_email ?? null})
    on conflict (provider_id) do update
      set status = excluded.status, amount = excluded.amount, updated_at = now()`;

  if (pre.status === "authorized") {
    await sql`update users set plan = ${ref.plan}, plan_source = 'mp' where id = ${ref.userId}`;
  } else if (pre.status === "cancelled" || pre.status === "paused") {
    // Solo se baja el plan si no queda otra suscripción activa (p. ej. tras un cambio de plan).
    await sql`
      update users set plan = 'trial', plan_source = null
      where id = ${ref.userId} and plan_source = 'mp'
        and not exists (select 1 from subscriptions
                        where user_id = ${ref.userId} and status = 'authorized')`;
  }
  return ref;
}

export async function recordPayment(p: AuthorizedPayment) {
  const [sub] = await sql<{ user_id: string }[]>`
    select user_id from subscriptions where provider_id = ${p.preapproval_id}`;
  if (!sub) return;
  const status = p.payment?.status ?? p.status;
  await sql`
    insert into payments (user_id, provider_id, subscription_provider_id, amount, currency, status)
    values (${sub.user_id}, ${String(p.id)}, ${p.preapproval_id}, ${p.transaction_amount ?? null},
            ${p.currency_id ?? null}, ${status})
    on conflict (provider_id) do update set status = excluded.status`;
  if (status === "approved") await rewardReferrer(sub.user_id);
}

/** Primer pago aprobado de un referido: premia a quien lo invitó (una sola vez). */
async function rewardReferrer(referredId: string) {
  const [ref] = await sql<{ id: string; referrer_id: string }[]>`
    update referrals set status = 'pending_reward', converted_at = now()
    where referred_id = ${referredId} and status = 'signed_up'
    returning id, referrer_id`;
  if (!ref) return;
  // Si quien invitó sigue en prueba, el premio se aplica solo (más días de prueba).
  // Si ya paga, queda pendiente para acreditarle un mes desde el panel de admin.
  const applied = await sql`
    update users set trial_ends_at = greatest(trial_ends_at, now()) + make_interval(days => ${REFERRAL_REWARD_DAYS})
    where id = ${ref.referrer_id} and plan = 'trial' returning id`;
  if (applied.length) await sql`update referrals set status = 'rewarded' where id = ${ref.id}`;
}
