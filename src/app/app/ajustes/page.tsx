import type { Metadata } from "next";
import Link from "next/link";
import { updateBusiness } from "@/actions/business";
import { ActionForm, Submit } from "@/components/form";
import { requireUser } from "@/lib/auth";
import { listBusinesses, requireBusiness } from "@/lib/business";
import { COUNTRY_CODES, limitsFor, TONES } from "@/lib/config";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const count = (await listBusinesses(user.id)).length;
  const canAdd = count < limitsFor(user.plan).maxBusinesses;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="h1">Ajustes de {biz.name}</h1>
      <ActionForm action={updateBusiness} className="card space-y-5">
        <div>
          <label className="label" htmlFor="name">Nombre del negocio</label>
          <input className="input" id="name" name="name" defaultValue={biz.name} required maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="category">Rubro</label>
          <input className="input" id="category" name="category" defaultValue={biz.category ?? ""} maxLength={60} />
        </div>
        <div>
          <label className="label" htmlFor="google_review_url">Link de reseñas de Google</label>
          <input className="input" id="google_review_url" name="google_review_url" type="url" defaultValue={biz.google_review_url} required />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="country_code">País de tus clientes</label>
            <select className="input" id="country_code" name="country_code" defaultValue={biz.country_code}>
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="tone">Tono de las respuestas con IA</label>
            <select className="input" id="tone" name="tone" defaultValue={biz.tone}>
              {TONES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="whatsapp_template">Mensaje de WhatsApp</label>
          <textarea className="input min-h-28" id="whatsapp_template" name="whatsapp_template" defaultValue={biz.whatsapp_template} maxLength={600} required />
          <p className="hint">Podés usar {"{nombre}"}, {"{negocio}"} y {"{link}"}. El {"{link}"} es obligatorio.</p>
        </div>
        <Submit>Guardar cambios</Submit>
      </ActionForm>

      <section className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Locales</h2>
          <p className="text-sm text-muted">Tenés {count} de {limitsFor(user.plan).maxBusinesses} en tu plan.</p>
        </div>
        {canAdd ? (
          <Link href="/app/alta" className="btn btn-ghost btn-sm">Agregar local</Link>
        ) : (
          <Link href="/app/plan" className="btn btn-ghost btn-sm">Pasar a Pro para sumar locales</Link>
        )}
      </section>
      <p className="text-sm text-muted">Cuenta: {user.email}</p>
    </div>
  );
}
