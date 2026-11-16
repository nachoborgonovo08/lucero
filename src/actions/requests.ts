"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { hasAccess, newToken, requireUser } from "@/lib/auth";
import { listBusinesses, requireBusiness, usageThisMonth } from "@/lib/business";
import { limitsFor } from "@/lib/config";
import { sql } from "@/lib/db";
import { normalizePhone } from "@/lib/phone";
import type { FormState } from "./auth";

/** Alta de clientes: uno por línea, "Nombre, teléfono" (o un solo cliente con los dos campos). */
export async function addCustomers(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!hasAccess(user)) return { error: "Tu prueba terminó. Elegí un plan para seguir pidiendo reseñas." };
  const biz = await requireBusiness(user);

  const single = { name: String(form.get("name") ?? "").trim(), phone: String(form.get("phone") ?? "").trim() };
  const bulk = String(form.get("bulk") ?? "").trim();
  const lines = bulk
    ? bulk.split("\n").map((l) => {
        const m = l.trim().match(/^(.*?)[,;\t]\s*([+\d][\d\s().-]{6,})$/);
        return m ? { name: m[1].trim(), phone: m[2] } : { name: "", phone: l };
      })
    : [single];

  const valid: { name: string; phone: string }[] = [];
  const bad: string[] = [];
  for (const l of lines.slice(0, 200)) {
    if (!l.name && !l.phone.trim()) continue;
    const phone = normalizePhone(l.phone, biz.country_code);
    const name = z.string().min(1).max(80).safeParse(l.name);
    if (!phone || !name.success) bad.push(l.name || l.phone);
    else valid.push({ name: name.data, phone });
  }
  if (!valid.length) {
    return { error: bulk ? "No encontramos líneas válidas. Formato: Nombre, teléfono" : "Revisá el nombre y el teléfono (con código de área)." };
  }

  const limits = limitsFor(user.plan);
  const used = await usageThisMonth((await listBusinesses(user.id)).map((b) => b.id));
  if (used.requests + valid.length > limits.requestsPerMonth) {
    return { error: `Te quedan ${Math.max(0, limits.requestsPerMonth - used.requests)} pedidos este mes en tu plan.` };
  }

  await sql`insert into customers ${sql(
    valid.map((v) => ({ business_id: biz.id, name: v.name, phone: v.phone, token: newToken(9) })),
  )}`;
  revalidatePath("/app/pedir");
  return {
    ok: `${valid.length === 1 ? "Cliente agregado" : `${valid.length} clientes agregados`}.${bad.length ? ` No pudimos leer: ${bad.slice(0, 5).join(", ")}.` : ""}`,
  };
}

export async function markSent(customerId: string) {
  const user = await requireUser();
  await sql`
    update customers c set status = 'sent', sent_at = now()
    from businesses b
    where c.id = ${customerId} and b.id = c.business_id and b.owner_id = ${user.id} and c.status = 'pending'`;
  revalidatePath("/app/pedir");
}

export async function deleteCustomer(form: FormData) {
  const user = await requireUser();
  await sql`
    delete from customers c using businesses b
    where c.id = ${String(form.get("id"))} and b.id = c.business_id and b.owner_id = ${user.id}`;
  revalidatePath("/app/pedir");
}

export async function markFeedbackRead(form: FormData) {
  const user = await requireUser();
  await sql`
    update feedback f set read_at = now() from businesses b
    where f.id = ${String(form.get("id"))} and b.id = f.business_id and b.owner_id = ${user.id}`;
  revalidatePath("/app", "layout");
}
