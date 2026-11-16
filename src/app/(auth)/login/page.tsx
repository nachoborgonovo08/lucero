import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { login } from "@/actions/auth";
import { ActionForm, Submit } from "@/components/form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  if (await getUser()) redirect("/app");
  return (
    <>
      <h1 className="h1">Iniciar sesión</h1>
      <ActionForm action={login} className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <label className="label" htmlFor="password">Contraseña</label>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <Submit className="btn btn-primary w-full">Entrar</Submit>
      </ActionForm>
      <p className="mt-5 text-center text-sm text-muted">
        <Link className="underline" href="/recuperar">Olvidé mi contraseña</Link>
        {" · "}
        <Link className="underline" href="/registro">Crear cuenta</Link>
      </p>
    </>
  );
}
