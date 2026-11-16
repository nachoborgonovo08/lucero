import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/actions/auth";
import { switchBusiness } from "@/actions/business";
import { Logo } from "@/components/brand";
import { Nav } from "@/components/nav";
import { hasAccess, isAdmin, planExpired, requireUser, trialDaysLeft } from "@/lib/auth";
import { listBusinesses } from "@/lib/business";
import { supportLink } from "@/lib/config";
import { sql } from "@/lib/db";

export const metadata: Metadata = { robots: { index: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const businesses = await listBusinesses(user.id);
  const [{ unread }] = businesses.length
    ? await sql<{ unread: number }[]>`
        select count(*)::int as unread from feedback
        where read_at is null and business_id in ${sql(businesses.map((b) => b.id))}`
    : [{ unread: 0 }];
  const access = hasAccess(user);
  const days = trialDaysLeft(user);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col md:flex-row">
      <aside className="no-print flex items-center justify-between gap-3 px-4 py-3 md:w-56 md:shrink-0 md:flex-col md:items-stretch md:justify-start md:gap-6 md:py-6">
        <Logo href="/app" />
        <nav className="fixed inset-x-0 bottom-0 z-20 flex gap-1 border-t border-line bg-paper/95 px-2 py-1.5 backdrop-blur md:static md:flex-col md:border-0 md:bg-transparent md:p-0">
          <Nav unread={unread} />
        </nav>
        <div className="flex items-center gap-3 text-sm md:mt-auto md:flex-col md:items-stretch md:gap-1">
          {businesses.length > 1 && (
            <form action={switchBusiness} className="hidden md:block">
              <select name="id" className="input !py-2 text-sm" defaultValue="" aria-label="Cambiar de local">
                <option value="" disabled>Cambiar de local…</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
              <button className="btn btn-ghost btn-sm mt-1 w-full">Cambiar</button>
            </form>
          )}
          {businesses.length > 1 && <Link href="/app/locales" className="text-muted hover:text-ink md:px-3 md:py-1.5">Mis negocios</Link>}
          <Link href="/app/plan" className="text-muted hover:text-ink md:px-3 md:py-1.5">Plan</Link>
          <Link href="/app/referidos" className="hidden text-muted hover:text-ink md:block md:px-3 md:py-1.5">Invitá y ganá</Link>
          <Link href="/app/ajustes" className="text-muted hover:text-ink md:px-3 md:py-1.5">Ajustes</Link>
          {supportLink() && <a href={supportLink(`Hola! Necesito ayuda con Lucero. Mi cuenta es ${user.email}.`)!} target="_blank" rel="noopener" className="hidden text-muted hover:text-ink md:block md:px-3 md:py-1.5">Ayuda</a>}
          {isAdmin(user) && <Link href="/admin" className="hidden text-muted hover:text-ink md:block md:px-3 md:py-1.5">Admin</Link>}
          <form action={logout}>
            <button className="cursor-pointer text-muted hover:text-ink md:px-3 md:py-1.5">Salir</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-28 pt-2 md:px-8 md:py-8">
        {!access ? (
          <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink px-5 py-4 text-white">
            <p className="text-sm">
              <b>{planExpired(user) ? "Tu plan venció." : "Tu prueba gratis terminó."}</b> Tu página de reseñas y tus QR están en pausa hasta que {planExpired(user) ? "lo renueves" : "elijas un plan"}.
            </p>
            <Link href="/app/plan" className="btn btn-star btn-sm">{planExpired(user) ? "Renovar" : "Elegir plan"}</Link>
          </div>
        ) : (
          user.plan === "trial" &&
          days <= 7 && (
            <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-star-soft px-5 py-3">
              <p className="text-sm text-star-deep">
                Te {days === 1 ? "queda 1 día" : `quedan ${days} días`} de prueba gratis.
              </p>
              <Link href="/app/plan" className="btn btn-primary btn-sm">Ver planes</Link>
            </div>
          )
        )}
        {children}
      </main>
    </div>
  );
}
