import type { Metadata } from "next";
import { Prose } from "@/components/site";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Terms() {
  return (
    <Prose title="Términos y condiciones">
      <p className="rounded-xl bg-star-soft px-4 py-3 text-sm text-star-deep">
        Texto base. Antes de vender, completá los datos del titular (nombre o razón social, CUIT, domicilio y email de contacto) y hacelo revisar por un profesional.
      </p>
      <h2>1. El servicio</h2>
      <p>{BRAND} es una herramienta para que negocios pidan reseñas a sus propios clientes, reciban comentarios privados y redacten respuestas. {BRAND} no publica reseñas, no garantiza una cantidad de reseñas ni un puntaje, y no tiene relación con Google.</p>
      <h2>2. Uso permitido</h2>
      <li>Solo podés pedir reseñas a personas que fueron clientes reales de tu negocio.</li>
      <li>No podés ofrecer premios, descuentos ni dinero a cambio de reseñas.</li>
      <li>No podés usar el servicio para enviar mensajes no solicitados a personas que no son tus clientes.</li>
      <li>Sos responsable de cumplir las políticas de Google y la normativa de protección de datos y defensa del consumidor que te corresponda.</li>
      <h2>3. Prueba, precio y pago</h2>
      <p>La prueba gratis no requiere medio de pago. Las suscripciones son mensuales, se cobran por adelantado a través de Mercado Pago y se renuevan automáticamente hasta que las canceles. Los precios pueden actualizarse con aviso previo de 15 días por email.</p>
      <h2>4. Cancelación</h2>
      <p>Podés cancelar en cualquier momento desde tu panel. Al cancelar o no pagar, tu página de reseñas y tu QR dejan de funcionar. No hay reembolsos por períodos parciales, salvo los que exija la ley.</p>
      <h2>5. Responsabilidad</h2>
      <p>El servicio se presta “como está”. En la medida que la ley lo permita, la responsabilidad total de {BRAND} se limita a lo que pagaste en los últimos tres meses.</p>
    </Prose>
  );
}
