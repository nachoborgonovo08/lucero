import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import type { User } from "./auth";
import { APP_URL } from "./config";
import { sql } from "./db";

export type Business = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  google_review_url: string;
  category: string | null;
  tone: string;
  country_code: string;
  whatsapp_template: string;
  created_at: Date;
};

export const BIZ_COOKIE = "lucero_biz";

export const listBusinesses = cache(
  (userId: string) =>
    sql<Business[]>`select * from businesses where owner_id = ${userId} order by created_at`,
);

/** Local activo del usuario (elegido por cookie, o el primero). Redirige al alta si no tiene ninguno. */
export async function requireBusiness(user: User) {
  const all = await listBusinesses(user.id);
  if (!all.length) redirect("/app/alta");
  const chosen = (await cookies()).get(BIZ_COOKIE)?.value;
  return all.find((b) => b.id === chosen) ?? all[0];
}

export const publicUrl = (slug: string) => `${APP_URL}/r/${slug}`;

export function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "negocio"
  );
}

export async function uniqueSlug(name: string) {
  const base = slugify(name);
  for (let i = 0; i < 20; i++) {
    const slug = i === 0 ? base : `${base}-${Math.floor(Math.random() * 9000 + 1000)}`;
    const taken = await sql`select 1 from businesses where slug = ${slug}`;
    if (!taken.length) return slug;
  }
  throw new Error("No se pudo generar un identificador único");
}

const GOOGLE_HOSTS = /(^|\.)(google\.[a-z.]{2,6}|g\.page|goo\.gl|g\.co)$/;

/** Solo aceptamos links de Google: la página pública redirige ahí y no debe usarse para otra cosa. */
export function isGoogleReviewUrl(raw: string) {
  try {
    const u = new URL(raw);
    return u.protocol === "https:" && GOOGLE_HOSTS.test(u.hostname);
  } catch {
    return false;
  }
}

export async function usageThisMonth(businessIds: string[]) {
  if (!businessIds.length) return { requests: 0, aiReplies: 0 };
  const [r] = await sql<{ requests: number; ai: number }[]>`
    select
      (select count(*)::int from customers where business_id in ${sql(businessIds)}
         and created_at >= date_trunc('month', now())) as requests,
      (select count(*)::int from ai_replies where business_id in ${sql(businessIds)}
         and created_at >= date_trunc('month', now())) as ai`;
  return { requests: r.requests, aiReplies: r.ai };
}
