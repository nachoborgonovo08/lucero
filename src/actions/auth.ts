"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession, newToken, sha256 } from "@/lib/auth";
import { APP_URL, BRAND, REFERRED_TRIAL_DAYS, TRIAL_DAYS } from "@/lib/config";
import { sql } from "@/lib/db";
import { esc, layout, sendEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/ratelimit";

export type FormState = { error?: string; ok?: string } | undefined;

const email = z.string().trim().toLowerCase().email("Ingresá un email válido").max(200);
const password = z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200);

let dummy: Promise<string> | undefined;
const dummyHash = () => (dummy ??= bcrypt.hash("sin-usuario", 12));

const signupSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre").max(80),
  email,
  password,
  ref: z.string().trim().max(20).optional(),
});

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  if (!(await rateLimit(`signup:${await clientIp()}`, 10, 3600))) {
    return { error: "Demasiados intentos. Probá de nuevo más tarde." };
  }
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, ref } = parsed.data;

  const [referrer] = ref
    ? await sql<{ id: string }[]>`select id from users where referral_code = ${ref.toUpperCase()}`
    : [];
  const trialDays = referrer ? REFERRED_TRIAL_DAYS : TRIAL_DAYS;
  const hash = await bcrypt.hash(password, 12);

  const [user] = await sql<{ id: string }[]>`
    insert into users (email, password_hash, name, trial_ends_at, referral_code, referred_by)
    values (${email}, ${hash}, ${name}, now() + make_interval(days => ${trialDays}),
            ${newToken(5).replace(/[-_]/g, "X").toUpperCase().slice(0, 7)}, ${referrer?.id ?? null})
    on conflict (email) do nothing
    returning id`;
  if (!user) return { error: "Ya existe una cuenta con ese email. Iniciá sesión." };

  if (referrer) {
    await sql`insert into referrals (referrer_id, referred_id) values (${referrer.id}, ${user.id})`;
  }
  await createSession(user.id);
  await sendEmail(
    email,
    `Bienvenido a ${BRAND}`,
    layout(
      `¡Hola ${esc(name.split(" ")[0])}!`,
      `<p>Tu prueba gratis de ${trialDays} días ya está activa. En 5 minutos podés tener tu QR impreso y pedir tus primeras reseñas por WhatsApp.</p>
       <p><a href="${APP_URL}/app">Entrar a mi panel</a></p>`,
    ),
  );
  redirect("/app/alta");
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ email, password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Email o contraseña incorrectos." };
  const ip = await clientIp();
  if (!(await rateLimit(`login:${ip}`, 20, 900)) || !(await rateLimit(`login:${parsed.data.email}`, 8, 900))) {
    return { error: "Demasiados intentos. Esperá 15 minutos y probá de nuevo." };
  }
  const [user] = await sql<{ id: string; password_hash: string }[]>`
    select id, password_hash from users where email = ${parsed.data.email}`;
  // Se compara siempre contra un hash para no revelar por tiempos si el email existe.
  const ok = await bcrypt.compare(parsed.data.password, user?.password_hash ?? (await dummyHash()));
  if (!user || !ok) return { error: "Email o contraseña incorrectos." };
  await createSession(user.id);
  redirect("/app");
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(form.get("email"));
  const done = { ok: "Si existe una cuenta con ese email, te enviamos un link para restablecer la contraseña." };
  if (!parsed.success) return { error: "Ingresá un email válido" };
  if (!(await rateLimit(`reset:${await clientIp()}`, 5, 3600))) return done;
  const [user] = await sql<{ id: string }[]>`select id from users where email = ${parsed.data}`;
  if (user) {
    const token = newToken();
    await sql`insert into password_resets (token_hash, user_id, expires_at)
              values (${sha256(token)}, ${user.id}, now() + interval '1 hour')`;
    await sendEmail(
      parsed.data,
      `Restablecer tu contraseña de ${BRAND}`,
      layout(
        "Restablecer contraseña",
        `<p>Usá este link para elegir una contraseña nueva. Vence en 1 hora.</p>
         <p><a href="${APP_URL}/restablecer/${token}">Elegir contraseña nueva</a></p>
         <p>Si no lo pediste, ignorá este email.</p>`,
      ),
    );
  }
  return done;
}

export async function resetPassword(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z.object({ token: z.string().min(20).max(100), password }).safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const [row] = await sql<{ user_id: string }[]>`
    update password_resets set used_at = now()
    where token_hash = ${sha256(parsed.data.token)} and used_at is null and expires_at > now()
    returning user_id`;
  if (!row) return { error: "El link venció o ya fue usado. Pedí uno nuevo." };
  await sql`update users set password_hash = ${await bcrypt.hash(parsed.data.password, 12)} where id = ${row.user_id}`;
  await sql`delete from sessions where user_id = ${row.user_id}`;
  await createSession(row.user_id);
  redirect("/app");
}
