import type { Metadata } from "next";
import QRCode from "qrcode";
import { StarIcon } from "@/components/brand";
import { PrintButton } from "@/components/form";
import { requireUser } from "@/lib/auth";
import { publicUrl, requireBusiness } from "@/lib/business";
import { BRAND } from "@/lib/config";

export const metadata: Metadata = { title: "Tu QR" };

export default async function QrPage() {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const svg = await QRCode.toString(`${publicUrl(biz.slug)}?s=qr`, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#14171f", light: "#ffffff" },
  });

  return (
    <div className="space-y-6">
      <header className="no-print flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h1">Tu cartel con QR</h1>
          <p className="mt-1 text-muted">Imprimilo y ponelo donde el cliente paga o espera. Ese es el momento de pedir la reseña.</p>
        </div>
        <div className="flex gap-2">
          <a className="btn btn-ghost" href={`/api/qr/${biz.slug}?format=png`}>Descargar solo el QR</a>
          <PrintButton>Imprimir cartel</PrintButton>
        </div>
      </header>

      <div className="mx-auto w-full max-w-sm rounded-3xl border border-line bg-white p-8 text-center shadow-sm print:mt-16 print:border-2 print:shadow-none">
        <div className="flex justify-center gap-1 text-star">
          {[1, 2, 3, 4, 5].map((n) => (
            <StarIcon key={n} className="size-8" />
          ))}
        </div>
        <p className="mt-5 text-3xl font-semibold leading-tight tracking-tight">¿Cómo te atendimos?</p>
        <p className="mt-2 text-muted">Contanos en 30 segundos. Escaneá con la cámara de tu celular.</p>
        <div className="mx-auto mt-6 w-56 rounded-2xl border border-line p-4" dangerouslySetInnerHTML={{ __html: svg }} />
        <p className="mt-6 text-xl font-semibold">{biz.name}</p>
        <p className="mt-1 text-xs text-muted">Tu opinión nos ayuda a mejorar · {BRAND}</p>
      </div>

      <ul className="no-print mx-auto max-w-sm list-disc space-y-1 pl-5 text-sm text-muted">
        <li>Tamaño recomendado: A5 o A6, a la altura de los ojos.</li>
        <li>Sumalo también a tickets, bolsas, tarjetas y a la mesa de espera.</li>
        <li>Pedilo en voz alta: “si te gustó, ¿nos dejás tu opinión acá?” funciona mucho más que el cartel solo.</li>
      </ul>
    </div>
  );
}
