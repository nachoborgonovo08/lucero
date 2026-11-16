"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hasAccess, requireUser } from "@/lib/auth";
import { BIZ_COOKIE, isGoogleReviewUrl, listBusinesses, requireBusiness, uniqueSlug } from "@/lib/business";
import { COUNTRY_CODES, DEFAULT_WHATSAPP_TEMPLATE, limitsFor, TONES } from "@/lib/config";
import { sql } from "@/lib/db";
import type { FormState } from "./auth";

const base = z.object({
  name: z.string().trim().min(2, "Ingresá el nombre del negocio").max(80),
  google_review_url: z
    .string()
    .trim()
    .max(500)
    .refine(isGoogleReviewUrl, "Pegá el link de reseñas que te da Google (empieza con https://g.page/ o https://www.google.com/)"),
  category: z.string().trim().max(60).optional(),
  country_code: z.enum(COUNTRY_CODES.map((c) => c.code) as [string, ...string[]]),
});

export async function createBusiness(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!hasAccess(user)) return { error: "Tu prueba terminó. Elegí un plan para continuar." };
  const parsed = base.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const existing = await listBusinesses(user.id);
  if (existing.length >= limitsFor(user.plan).maxBusinesses) {
    return { error: "Llegaste al máximo de locales de tu plan. Pasate a Pro para sumar más." };
  }
  const d = parsed.data;
  const [biz] = await sql<{ id: string }[]>`
    insert into businesses (owner_id, name, slug, google_review_url, category, country_code, whatsapp_template)
    values (${user.id}, ${d.name}, ${await uniqueSlug(d.name)}, ${d.google_review_url},
            ${d.category || null}, ${d.country_code}, ${DEFAULT_WHATSAPP_TEMPLATE})
    returning id`;
  (await cookies()).set(BIZ_COOKIE, biz.id, { path: "/", sameSite: "lax", maxAge: 31536000 });
  redirect("/app?bienvenida=1");
}

const settings = base.extend({
  tone: z.enum(TONES.map((t) => t.id) as [string, ...string[]]),
  whatsapp_template: z
    .string()
    .trim()
    .min(10, "El mensaje es muy corto")
    .max(600)
    .refine((t) => t.includes("{link}"), "El mensaje tiene que incluir {link}"),
});

export async function updateBusiness(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const parsed = settings.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await sql`
    update businesses set name = ${d.name}, google_review_url = ${d.google_review_url},
      category = ${d.category || null}, country_code = ${d.country_code}, tone = ${d.tone},
      whatsapp_template = ${d.whatsapp_template}
    where id = ${biz.id} and owner_id = ${user.id}`;
  revalidatePath("/app", "layout");
  return { ok: "Cambios guardados." };
}

export async function switchBusiness(form: FormData) {
  const user = await requireUser();
  const id = String(form.get("id") ?? "");
  const all = await listBusinesses(user.id);
  if (all.some((b) => b.id === id)) {
    (await cookies()).set(BIZ_COOKIE, id, { path: "/", sameSite: "lax", maxAge: 31536000 });
  }
  redirect("/app");
}
