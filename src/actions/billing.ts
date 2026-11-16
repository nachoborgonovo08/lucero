"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { syncPreapproval } from "@/lib/billing";
import { PLAN_IDS } from "@/lib/config";
import { sql } from "@/lib/db";
import { cancelPreapproval, createSubscription, MpError, mpConfigured } from "@/lib/mp";
import type { FormState } from "./auth";

const schema = z.object({
  plan: z.enum(PLAN_IDS),
  payer_email: z.string().trim().toLowerCase().email("Ingresá el email de tu cuenta de Mercado Pago"),
});

export async function subscribe(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!mpConfigured()) return { error: "Los pagos todavía no están habilitados en este sitio." };
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let initPoint: string | undefined;
  try {
    const pre = await createSubscription({
      userId: user.id,
      plan: parsed.data.plan,
      payerEmail: parsed.data.payer_email,
    });
    await syncPreapproval(pre);
    initPoint = pre.init_point;
  } catch (err) {
    if (err instanceof MpError) {
      return { error: "Mercado Pago rechazó la solicitud. Verificá que el email sea el de tu cuenta de Mercado Pago." };
    }
    throw err;
  }
  if (!initPoint) return { error: "Mercado Pago no devolvió el link de pago. Probá de nuevo." };
  redirect(initPoint);
}

export async function cancelSubscription(): Promise<void> {
  const user = await requireUser();
  const subs = await sql<{ provider_id: string }[]>`
    select provider_id from subscriptions where user_id = ${user.id} and status = 'authorized'`;
  for (const s of subs) await syncPreapproval(await cancelPreapproval(s.provider_id));
  revalidatePath("/app", "layout");
}
