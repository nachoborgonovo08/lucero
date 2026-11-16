import Link from "next/link";
import { StarIcon, Stars } from "@/components/brand";
import { SiteFooter, SiteHeader } from "@/components/site";
import { BRAND, formatPrice, PLANS, TRIAL_DAYS, transferEnabled } from "@/lib/config";
import { mpConfigured } from "@/lib/mp";

const STEPS = [
  { t: "Cargá tu link de Google", d: "Pegás el link de reseñas de tu perfil y en dos minutos tenés tu página y tu cartel con QR listos para imprimir." },
  { t: "Pedí la reseña en el momento justo", d: "El QR en el mostrador para quien está en el local, y un WhatsApp con un toque para quien ya se fue. Desde tu propio número." },
  { t: "Mirá cómo sube tu perfil", d: "Ves quién abrió, quién calificó y quién fue a Google. Los lunes te llega el resumen de la semana por email." },
];

const FEATURES = [
  { t: "Un QR para cada mesa, caja o empleado", d: "Creás los QR que necesites y cada uno tiene sus propios números. Sabés qué lugar y qué persona consigue más reseñas." },
  { t: "Pedidos por WhatsApp con un toque", d: "Cargás nombre y teléfono, o pegás la lista del día, y cada mensaje sale personalizado desde tu WhatsApp. Sin bots ni riesgo de bloqueo." },
  { t: "Buzón privado", d: "El cliente también puede escribirte a vos directamente. Te enterás del problema al instante y lo resolvés antes de perderlo." },
  { t: "IA que responde y detecta problemas", d: "Te sugiere la respuesta a cada reseña con el tono de tu negocio, y resume qué se repite en los comentarios que recibís." },
  { t: "Seguimiento de cada pedido", d: "Sabés quién abrió el link, quién calificó y quién llegó a Google, para insistir solo donde hace falta." },
  { t: "Resumen semanal automático", d: "Un email por semana con tus números y qué hacer. No tenés que acordarte de entrar al panel." },
];

const FAQ = [
  { q: "¿Necesito saber de tecnología?", a: "No. Pegás un link, imprimís una hoja y mandás mensajes de WhatsApp como hacés siempre. Si te trabás, te ayudamos por WhatsApp." },
  { q: "¿Filtran las reseñas negativas?", a: "No, y eso te protege. Google prohíbe pedir reseñas solo a los clientes contentos y puede borrar reseñas o restringir el perfil. En Lucero todos los clientes ven las mismas dos opciones: publicar en Google o escribirte en privado." },
  { q: "¿Los mensajes salen de mi WhatsApp?", a: "Sí. Lucero arma el mensaje personalizado y abre tu WhatsApp con todo listo: vos tocás enviar. Por eso no hace falta WhatsApp Business API ni hay costo por mensaje." },
  { q: "¿Qué diferencia hay con una placa NFC o un QR suelto?", a: "La placa solo abre el link. Lucero además te deja pedir por WhatsApp a quien ya se fue, medir qué funciona, recibir comentarios privados y responder reseñas con IA." },
  { q: "¿Puedo cancelar cuando quiera?", a: "Sí, desde tu panel, con un clic. No hay permanencia ni costo de alta." },
  { q: "¿Sirve para más de un local?", a: "El plan Pro incluye hasta 3 locales, cada uno con su página, sus QR y sus números." },
  { q: "Tengo una agencia, ¿puedo ofrecerlo a mis clientes?", a: "Sí. Con el plan Agencia manejás hasta 25 negocios desde una sola cuenta, con una vista general de todos, y lo sumás a tus propios servicios." },
];

export default function Landing() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 md:grid-cols-2 md:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-muted">
              <Stars value={5} className="size-3" /> Para comercios, consultorios y servicios locales
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Tus clientes contentos no dejan reseñas. <span className="text-star-deep">Hacé que las dejen.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              {BRAND} convierte cada venta en un pedido de reseña en Google: un QR en tu mostrador y un WhatsApp con un toque. Más reseñas recientes, mejor puntaje, más gente que te elige en Google Maps.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/registro" className="btn btn-star !px-6 !py-3.5 text-base">Probar gratis {TRIAL_DAYS} días</Link>
              <Link href="/calculadora" className="btn btn-ghost !py-3.5">¿Cuántas reseñas necesito?</Link>
            </div>
            <p className="mt-3 text-sm text-muted">Sin tarjeta · Listo en 5 minutos · Cancelás cuando quieras</p>
          </div>

          {/* Maqueta del producto */}
          <div className="relative mx-auto mb-20 w-full max-w-sm" aria-hidden>
            <div className="rounded-[2.2rem] border border-line bg-white p-6 shadow-xl shadow-ink/5">
              <p className="text-center text-xl font-semibold leading-tight">¿Cómo fue tu experiencia en Barbería Don Julio?</p>
              <div className="mt-5 flex justify-center gap-1.5 text-star">
                {[1, 2, 3, 4, 5].map((n) => (
                  <StarIcon key={n} className="size-10" />
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-ink py-3.5 text-center font-semibold text-white">Publicar mi reseña en Google</div>
              <div className="mt-2.5 rounded-xl border border-line py-3.5 text-center font-semibold">Escribirle en privado al equipo</div>
            </div>
            <div className="absolute -bottom-20 left-2 w-64 rounded-2xl rounded-bl-sm bg-[#dcf8c6] p-3.5 text-[13px] leading-snug shadow-lg sm:-left-12">
              ¡Hola Carla! Gracias por elegir Barbería Don Julio 🙌 ¿Nos contás cómo te fue? Te lleva 30 segundos…
              <span className="mt-1 block text-right text-[10px] text-ink/50">10:42 ✓✓</span>
            </div>
          </div>
        </section>

        {/* Problema */}
        <section className="border-y border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
            {[
              ["El que tuvo un problema, escribe.", "El que quedó contento se va sin decir nada. Tu perfil termina mostrando lo peor de tu negocio, no lo normal."],
              ["Tu competencia tiene más reseñas.", "Cuando alguien busca en Google Maps, compara estrellas y cantidad. Con pocas reseñas o viejas, ni te llaman."],
              ["Pedirlas a mano no se sostiene.", "Te acordás una semana y después te gana el día a día. Hace falta un sistema que no dependa de tu memoria."],
            ].map(([t, d]) => (
              <div key={t}>
                <h2 className="text-lg font-semibold">{t}</h2>
                <p className="mt-2 text-muted">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
          <h2 className="text-3xl font-semibold tracking-tight">Funcionando en 5 minutos</h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="card">
                <span className="grid size-9 place-items-center rounded-full bg-star-soft font-semibold text-star-deep">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-muted">{s.d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Funciones */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <h2 className="text-3xl font-semibold tracking-tight">Todo lo que necesitás, nada que no vayas a usar</h2>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.t} className="border-t-2 border-ink pt-4">
                <h3 className="font-semibold">{f.t}</h3>
                <p className="mt-1.5 text-muted">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Políticas de Google */}
        <section className="bg-ink text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Sin trucos que pongan en riesgo tu perfil</h2>
              <p className="mt-4 text-white/75">
                Muchas herramientas mandan a Google solo a los clientes contentos y esconden al resto. Google lo prohíbe y puede borrar reseñas o restringir el perfil del negocio.
              </p>
              <p className="mt-3 text-white/75">
                En {BRAND} todos tus clientes ven las mismas opciones. Ganás reseñas porque se las pedís a todos, en el momento justo y de la forma más fácil, que es lo que de verdad mueve el puntaje.
              </p>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                "Todos los clientes pueden publicar en Google, siempre",
                "Sin premios ni descuentos a cambio de reseñas",
                "Sin reseñas falsas ni escritas por robots",
                "Los mensajes salen de tu WhatsApp, uno por uno",
              ].map((x) => (
                <li key={x} className="flex items-center gap-3 rounded-xl bg-white/8 px-4 py-3">
                  <span className="text-star">✓</span> {x}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Precios */}
        <section id="precios" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
          <h2 className="text-center text-3xl font-semibold tracking-tight">Un precio simple, sin costo de alta</h2>
          <p className="mt-3 text-center text-muted">Menos de lo que te deja un cliente nuevo. {TRIAL_DAYS} días gratis para comprobarlo.</p>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {Object.values(PLANS).map((p) => (
              <div key={p.id} className={`card flex flex-col ${p.id === "esencial" ? "border-2 !border-ink" : ""}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                  {p.id === "esencial" && <span className="rounded-full bg-star px-2.5 py-1 text-xs font-semibold">Recomendado para empezar</span>}
                </div>
                <p className="mt-3">
                  <span className="text-4xl font-semibold tracking-tight">{formatPrice(p.price)}</span>
                  <span className="text-muted"> / mes</span>
                </p>
                <ul className="mt-5 flex-1 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5"><span className="text-ok">✓</span>{f}</li>
                  ))}
                </ul>
                <Link href="/registro" className={`btn mt-6 w-full ${p.id === "esencial" ? "btn-star" : "btn-ghost"}`}>{p.id === "agencia" ? "Probar con mis clientes" : "Empezar gratis"}</Link>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-muted">
            {[mpConfigured() && "Pagás con Mercado Pago", transferEnabled() && (mpConfigured() ? "o por transferencia" : "Pagás por transferencia")].filter(Boolean).join(" ")}
            {mpConfigured() || transferEnabled() ? ". " : ""}Sin permanencia.
          </p>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 pb-20">
          <h2 className="text-3xl font-semibold tracking-tight">Preguntas frecuentes</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="text-muted transition group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-2 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-4xl rounded-3xl bg-star px-6 py-14 text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Empezá hoy con los clientes de esta semana</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink/75">Creá tu cuenta, imprimí tu QR y mandá tus primeros 5 pedidos por WhatsApp. Si en {TRIAL_DAYS} días no ves reseñas nuevas, no pagás nada.</p>
            <Link href="/registro" className="btn btn-primary mt-7 !px-7 !py-3.5 text-base">Probar gratis {TRIAL_DAYS} días</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
    </>
  );
}
