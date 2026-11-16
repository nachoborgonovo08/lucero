import type { Metadata } from "next";
import Link from "next/link";
import { requestPasswordReset } from "@/actions/auth";
import { ActionForm, Submit } from "@/components/form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function RecoverPage() {
  return (
    <>
      <h1 className="h1">Recuperar contraseña</h1>
      <p className="mt-1 text-sm text-muted">Te enviamos un link para elegir una nueva.</p>
      <ActionForm action={requestPasswordReset} className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <Submit className="btn btn-primary w-full">Enviar link</Submit>
      </ActionForm>
      <p className="mt-5 text-center text-sm text-muted">
        <Link className="underline" href="/login">Volver a iniciar sesión</Link>
      </p>
    </>
  );
}
