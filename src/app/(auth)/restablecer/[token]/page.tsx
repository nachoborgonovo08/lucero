import type { Metadata } from "next";
import { resetPassword } from "@/actions/auth";
import { ActionForm, Submit } from "@/components/form";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false } };

export default async function ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      <h1 className="h1">Elegí una contraseña nueva</h1>
      <ActionForm action={resetPassword} className="mt-5 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="label" htmlFor="password">Contraseña nueva</label>
          <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <Submit className="btn btn-primary w-full">Guardar y entrar</Submit>
      </ActionForm>
    </>
  );
}
