import type { Metadata } from "next";
import { Prose } from "@/components/site";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Privacy() {
  return (
    <Prose title="Política de privacidad">
      <p className="rounded-xl bg-star-soft px-4 py-3 text-sm text-star-deep">
        Texto base. Completá los datos del responsable y un email de contacto, y hacelo revisar por un profesional antes de vender.
      </p>
      <h2>Qué datos guardamos</h2>
      <li><b>De los negocios:</b> nombre, email, contraseña (cifrada con hash), datos del negocio y estado de la suscripción. No guardamos datos de tarjetas: los pagos los procesa Mercado Pago.</li>
      <li><b>De los clientes de cada negocio:</b> el nombre y teléfono que el negocio carga para pedir una reseña, la calificación que eligen y los comentarios privados que envían.</li>
      <h2>Para qué los usamos</h2>
      <p>Solo para prestar el servicio: armar los mensajes de pedido de reseña, mostrar estadísticas al negocio y entregarle los comentarios privados. No vendemos datos ni los usamos para publicidad.</p>
      <h2>Quién es responsable</h2>
      <p>Cada negocio es responsable de los datos de sus clientes que carga en {BRAND}, y {BRAND} actúa como encargado del tratamiento por cuenta del negocio.</p>
      <h2>Proveedores</h2>
      <p>Usamos proveedores de alojamiento y base de datos, envío de emails, pagos (Mercado Pago) e inteligencia artificial (Anthropic) para redactar respuestas. El texto de las reseñas que pegás se envía a ese proveedor solo para generar la respuesta.</p>
      <h2>Tus derechos</h2>
      <p>Podés pedir acceso, corrección o eliminación de tus datos escribiendo al email de contacto. Al eliminar una cuenta se borran sus negocios, clientes y comentarios.</p>
    </Prose>
  );
}
