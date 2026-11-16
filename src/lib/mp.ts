import { createHmac, timingSafeEqual } from "node:crypto";
import { APP_URL, BRAND, CURRENCY, PLANS, type PlanId } from "./config";

const BASE = process.env.MP_API_BASE ?? "https://api.mercadopago.com";

export const mpConfigured = () => Boolean(process.env.MP_ACCESS_TOKEN);

async function mp<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("Mercado Pago no está configurado (falta MP_ACCESS_TOKEN)");
  const res = await fetch(BASE + path, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[mp] error", res.status, path, body);
    throw new MpError(res.status, body);
  }
  return res.json() as Promise<T>;
}

export class MpError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Mercado Pago respondió ${status}`);
  }
}

export type Preapproval = {
  id: string;
  status: "pending" | "authorized" | "paused" | "cancelled";
  external_reference: string | null;
  payer_email?: string;
  init_point?: string;
  auto_recurring: { transaction_amount: number; currency_id: string };
};

export type AuthorizedPayment = {
  id: number | string;
  preapproval_id: string;
  transaction_amount?: number;
  currency_id?: string;
  status: string;
  payment?: { id?: number; status?: string };
};

export const externalRef = (userId: string, plan: PlanId) => `${userId}:${plan}`;

export function parseExternalRef(ref: string | null | undefined) {
  const [userId, plan] = (ref ?? "").split(":");
  if (!/^[0-9a-f-]{36}$/.test(userId ?? "") || !(plan in PLANS)) return null;
  return { userId, plan: plan as PlanId };
}

/** Crea una suscripción mensual (preapproval sin plan asociado) y devuelve el link de pago. */
export function createSubscription(opts: { userId: string; plan: PlanId; payerEmail: string }) {
  const plan = PLANS[opts.plan];
  return mp<Preapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify({
      reason: `${BRAND} · Plan ${plan.name}`,
      external_reference: externalRef(opts.userId, opts.plan),
      payer_email: opts.payerEmail,
      back_url: `${APP_URL}/app/plan`,
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: plan.price,
        currency_id: CURRENCY,
      },
    }),
  });
}

export const getPreapproval = (id: string) => mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`);

export const cancelPreapproval = (id: string) =>
  mp<Preapproval>(`/preapproval/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status: "cancelled" }),
  });

export const getAuthorizedPayment = (id: string) =>
  mp<AuthorizedPayment>(`/authorized_payments/${encodeURIComponent(id)}`);

/**
 * Valida la cabecera x-signature de un webhook de Mercado Pago.
 * Manifiesto oficial: `id:{data.id};request-id:{x-request-id};ts:{ts};`
 */
export function verifyWebhookSignature(opts: {
  signature: string | null;
  requestId: string | null;
  dataId: string | null;
  secret: string;
}) {
  if (!opts.signature) return false;
  const parts = Object.fromEntries(
    opts.signature.split(",").map((p) => p.split("=").map((s) => s.trim()) as [string, string]),
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;
  let manifest = "";
  if (opts.dataId) manifest += `id:${opts.dataId.toLowerCase()};`;
  if (opts.requestId) manifest += `request-id:${opts.requestId};`;
  manifest += `ts:${ts};`;
  const expected = createHmac("sha256", opts.secret).update(manifest).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
