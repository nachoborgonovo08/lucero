import Link from "next/link";
import { BRAND } from "@/lib/config";
import { Logo } from "./brand";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link className="hover:text-ink" href="/#como-funciona">Cómo funciona</Link>
          <Link className="hover:text-ink" href="/#precios">Precios</Link>
          <Link className="hover:text-ink" href="/calculadora">Calculadora de reseñas</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link className="btn btn-sm text-ink hover:bg-white" href="/login">Entrar</Link>
          <Link className="btn btn-primary btn-sm" href="/registro">Probar gratis</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 text-sm text-muted">
        <p>© {new Date().getFullYear()} {BRAND}. Hecho para negocios locales.</p>
        <nav className="flex gap-5">
          <Link className="hover:text-ink" href="/calculadora">Calculadora</Link>
          <Link className="hover:text-ink" href="/terminos">Términos</Link>
          <Link className="hover:text-ink" href="/privacidad">Privacidad</Link>
        </nav>
      </div>
    </footer>
  );
}

export function Prose({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-12 leading-relaxed [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
