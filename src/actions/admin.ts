"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function extendTrial(form: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const days = z.coerce.number().int().min(1).max(365).parse(form.get("days"));
  await sql`update users set trial_ends_at = greatest(trial_ends_at, now()) + make_interval(days => ${days}) where id = ${id}`;
  revalidatePath("/admin");
}

/** Plan manual (transferencia o cortesía): suma un mes pagado. 'trial' lo quita. */
export async function setManualPlan(form: FormData) {
  await requireAdmin();
  const id = z.string().uuid().parse(form.get("id"));
  const plan = z.enum(["trial", "esencial", "pro", "agencia"]).parse(form.get("plan"));
  const months = z.enum(["1", "12"]).catch("1").parse(form.get("months"));
  // Cada vez que se aplica un plan se suma un mes pagado (desde hoy o desde el vencimiento, lo que sea después).
  if (plan === "trial") {
    await sql`update users set plan = 'trial', plan_source = null, manual_until = null
              where id = ${id} and (plan_source is distinct from 'mp')`;
  } else {
    await sql`update users set plan = ${plan}, plan_source = 'manual',
                manual_until = greatest(coalesce(manual_until, now()), now()) + make_interval(months => ${Number(months)})
              where id = ${id} and (plan_source is distinct from 'mp')`;
  }
  revalidatePath("/admin");
}

export async function markReferralRewarded(form: FormData) {
  await requireAdmin();
  await sql`update referrals set status = 'rewarded' where id = ${z.string().uuid().parse(form.get("id"))}`;
  revalidatePath("/admin");
}
