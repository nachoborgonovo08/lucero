import type { Metadata } from "next";
import { createBusiness } from "@/actions/business";
import { ActionForm, Submit } from "@/components/form";
import { requireUser } from "@/lib/auth";
import { listBusinesses } from "@/lib/business";
import { COUNTRY_CODES } from "@/lib/config";

export const metadata: Metadata = { title: "Configurar negocio" };

export default async function OnboardingPage() {
  const user = await requireUser();
  const first = (await listBusinesses(user.id)).length === 0;
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="h1">{first ? "Contanos de tu negocio" : "Agregar otro local"}</h1>
      <p className="mt-1 text-muted">Con esto armamos tu página de reseñas y tu QR. Lleva 2 minutos.</p>
      <ActionForm action={createBusiness} className="card mt-6 space-y-5">
        <div>
          <label className="label" htmlFor="name">Nombre del negocio</label>
          <input className="input" id="name" name="name" placeholder="Ej: Barbería Don Julio" required maxLength={80} />
        </div>
        <div>
          <label className="label" htmlFor="category">Rubro <span className="font-normal text-muted">(opcional)</span></label>
          <input className="input" id="category" name="category" placeholder="Ej: barbería, odontología, restaurante" maxLength={60} />
          <p className="hint">Lo usa la IA para que las respuestas suenen a tu rubro.</p>
        </div>
        <div>
          <label className="label" htmlFor="google_review_url">Tu link de reseñas de Google</label>
          <input className="input" id="google_review_url" name="google_review_url" type="url" placeholder="https://g.page/r/…/review" required />
          <details className="hint">
            <summary className="cursor-pointer font-medium text-ink">¿Dónde lo encuentro?</summary>
            <ol className="mt-2 list-decimal space-y-1 pl-5">
              <li>Buscá el nombre de tu negocio en Google, con la cuenta que lo administra.</li>
              <li>En el panel de tu perfil tocá <b>“Pedir reseñas”</b> (o “Conseguir más reseñas”).</li>
              <li>Copiá el link que aparece y pegalo acá.</li>
            </ol>
          </details>
        </div>
        <div>
          <label className="label" htmlFor="country_code">País de tus clientes</label>
          <select className="input" id="country_code" name="country_code" defaultValue="54">
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <p className="hint">Para armar bien los números de WhatsApp.</p>
        </div>
        <Submit className="btn btn-star w-full">Crear mi página de reseñas</Submit>
      </ActionForm>
    </div>
  );
}
