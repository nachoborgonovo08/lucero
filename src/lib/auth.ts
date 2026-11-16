import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ADMIN_EMAILS, type PlanState } from "./config";
import { sql } from "./db";

const COOKIE = "lucero_session";
const SESSION_DAYS = 30;

export type User = {
  id: string;
  email: string;
  name: string;
  plan: PlanState;
  plan_source: "mp" | "manual" | null;
  trial_ends_at: Date;
  referral_code: string;
  created_at: Date;
};

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
export const newToken = (bytes = 32) => randomBytes(bytes).toString("base64url");

export async function createSession(userId: string) {
  const token = newToken();
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await sql`insert into sessions (token_hash, user_id, expires_at) values (${sha256(token)}, ${userId}, ${expires})`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await sql`delete from sessions where token_hash = ${sha256(token)}`;
  jar.delete(COOKIE);
}

export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await sql<User[]>`
    select u.id, u.email, u.name, u.plan, u.plan_source, u.trial_ends_at, u.referral_code, u.created_at
    from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${sha256(token)} and s.expires_at > now()`;
  return rows[0] ?? null;
});

export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

export const isAdmin = (user: Pick<User, "email">) => ADMIN_EMAILS.includes(user.email);

export async function requireAdmin() {
  const user = await requireUser();
  if (!isAdmin(user)) redirect("/app");
  return user;
}

/** Acceso completo: suscripción activa o prueba vigente. */
export function hasAccess(user: Pick<User, "plan" | "trial_ends_at">) {
  return user.plan !== "trial" || new Date(user.trial_ends_at).getTime() > Date.now();
}

export function trialDaysLeft(user: Pick<User, "trial_ends_at">) {
  return Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / 864e5));
}
