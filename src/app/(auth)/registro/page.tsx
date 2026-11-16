import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signup } from "@/actions/auth";
import { ActionForm, Submit } from "@/components/form";
import { getUser } from "@/lib/auth";
import { REFERRED_TRIAL_DAYS, TRIAL_DAYS } from "@/lib/config";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  if (await getUser()) redirect("/app");
  const ref = (await searchParams).ref?.slice(0, 20);
  return (
    <>
      <h1 className="h1">Probá gratis {ref ? REFERRED_TRIAL_DAYS : TRIAL_DAYS} días</h1>
      <p className="mt-1 text-sm text-muted">
        Sin tarjeta. {ref ? "Venís invitado: tenés el doble de prueba." : "En 5 minutos tenés tu QR listo."}
      </p>
      <ActionForm action={signup} className="mt-5 space-y-4">
        {ref && <input type="hidden" name="ref" value={ref} />}
        <div>
          <label className="label" htmlFor="name">Tu nombre</label>
          <input className="input" id="name" name="name" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <p className="hint">Mínimo 8 caracteres.</p>
        </div>
        <Submit className="btn btn-star w-full">Crear mi cuenta</Submit>
      </ActionForm>
      <p className="mt-4 text-center text-xs text-muted">
        Al crear la cuenta aceptás los <Link className="underline" href="/terminos">términos</Link> y la{" "}
        <Link className="underline" href="/privacidad">política de privacidad</Link>.
      </p>
      <p className="mt-4 text-center text-sm text-muted">
        ¿Ya tenés cuenta? <Link className="underline" href="/login">Iniciar sesión</Link>
      </p>
    </>
  );
}
