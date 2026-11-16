import type { Metadata } from "next";
import Link from "next/link";
import { Calculator } from "@/components/calculator";
import { SiteFooter, SiteHeader } from "@/components/site";
import { BRAND, TRIAL_DAYS } from "@/lib/config";

export const metadata: Metadata = {
  title: "Calculadora de reseñas de Google: cuántas necesitás para subir tu puntaje",
  description:
    "Calculá gratis cuántas reseñas de 5 estrellas necesita tu negocio para llegar a 4,5 o más en Google Maps. Sin registrarte.",
  alternates: { canonical: "/calculadora" },
};

export default function CalculatorPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-14">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight">¿Cuántas reseñas de 5 estrellas necesitás para subir tu puntaje en Google?</h1>
        <p className="mt-4 text-lg text-muted">Poné los números de tu perfil y te decimos cuántas reseñas te separan del puntaje que querés.</p>
        <div className="mt-8"><Calculator /></div>

        <section className="mt-12 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-semibold">Cómo se calcula</h2>
          <p>
            El puntaje de Google es el promedio de todas tus reseñas. Si tenés <i>n</i> reseñas con promedio <i>p</i> y querés llegar a <i>o</i>, necesitás <b>n × (o − p) ÷ (5 − o)</b> reseñas nuevas de 5 estrellas. Es una estimación: Google redondea a un decimal y puede tardar en actualizar el puntaje.
          </p>
          <h2 className="pt-2 text-2xl font-semibold">Por qué cuesta tanto subir</h2>
          <p>
            Cuanto más cerca de 5 querés llegar, más reseñas hacen falta por cada décima. Por eso lo que funciona no es una campaña de una semana, sino pedirle la reseña a cada cliente, todos los días, de la forma más fácil posible.
          </p>
        </section>

        <div className="mt-10 rounded-3xl bg-ink px-6 py-10 text-center text-white">
          <h2 className="text-2xl font-semibold">Conseguí esas reseñas con {BRAND}</h2>
          <p className="mx-auto mt-2 max-w-md text-white/75">Un QR en tu mostrador y pedidos por WhatsApp con un toque. {TRIAL_DAYS} días gratis, sin tarjeta.</p>
          <Link href="/registro" className="btn btn-star mt-6">Probar gratis</Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
