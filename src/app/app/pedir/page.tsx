import type { Metadata } from "next";
import { addCustomers, deleteCustomer } from "@/actions/requests";
import { ActionForm, Submit } from "@/components/form";
import { SendButton } from "@/components/send-button";
import { hasAccess, requireUser } from "@/lib/auth";
import { listBusinesses, publicUrl, requireBusiness, usageThisMonth } from "@/lib/business";
import { limitsFor } from "@/lib/config";
import { sql } from "@/lib/db";
import { fillTemplate, waLink } from "@/lib/phone";

export const metadata: Metadata = { title: "Pedir reseñas" };

const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Sin enviar", cls: "bg-line text-muted" },
  sent: { label: "Enviado", cls: "bg-blue-50 text-blue-800" },
  opened: { label: "Abrió el link", cls: "bg-star-soft text-star-deep" },
  rated: { label: "Calificó", cls: "bg-star-soft text-star-deep" },
  google: { label: "Fue a Google ★", cls: "bg-emerald-50 text-ok" },
};

type Row = { id: string; name: string; phone: string; token: string; status: string };

export default async function RequestsPage() {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const access = hasAccess(user);
  const customers = await sql<Row[]>`
    select id, name, phone, token, status from customers
    where business_id = ${biz.id} order by (status = 'pending') desc, created_at desc limit 200`;
  const used = await usageThisMonth((await listBusinesses(user.id)).map((b) => b.id));
  const limit = limitsFor(user.plan).requestsPerMonth;
  const pending = customers.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Pedir reseñas por WhatsApp</h1>
        <p className="mt-1 text-muted">
          Cargá a quienes atendiste y mandales el pedido con un toque, desde tu propio WhatsApp. {used.requests} de {limit} pedidos usados este mes.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <ActionForm action={addCustomers} resetOnOk className="card space-y-3">
          <h2 className="font-semibold">Agregar un cliente</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="name">Nombre</label>
              <input className="input" id="name" name="name" placeholder="Carla" required maxLength={80} />
            </div>
            <div>
              <label className="label" htmlFor="phone">WhatsApp</label>
              <input className="input" id="phone" name="phone" type="tel" placeholder="11 5555 1234" required />
            </div>
          </div>
          <Submit>Agregar</Submit>
        </ActionForm>

        <ActionForm action={addCustomers} resetOnOk className="card space-y-3">
          <h2 className="font-semibold">Pegar una lista</h2>
          <textarea className="input min-h-24 font-mono text-sm" name="bulk" required placeholder={"Carla Gómez, 11 5555 1234\nJuan Pérez, 351 555 4321"} aria-label="Lista de clientes, uno por línea" />
          <p className="hint">Uno por línea: nombre, teléfono con código de área.</p>
          <Submit className="btn btn-ghost">Agregar lista</Submit>
        </ActionForm>
      </div>

      <section className="card !p-0">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-semibold">Tus pedidos</h2>
          {pending > 0 && <span className="text-sm text-muted">{pending} sin enviar</span>}
        </div>
        {customers.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            Todavía no cargaste clientes. Empezá por los 5 que mejor atendiste esta semana.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {customers.map((c) => {
              const link = `${publicUrl(biz.slug)}?c=${c.token}`;
              const text = fillTemplate(biz.whatsapp_template, { nombre: c.name, negocio: biz.name, link });
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-xs text-muted">+{c.phone}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[c.status].cls}`}>{STATUS[c.status].label}</span>
                  {access && (c.status === "pending" || c.status === "sent") && (
                    <SendButton id={c.id} href={waLink(c.phone, text)} again={c.status === "sent"} />
                  )}
                  <form action={deleteCustomer}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="cursor-pointer text-xs text-muted hover:text-bad" aria-label={`Quitar a ${c.name}`}>Quitar</button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
