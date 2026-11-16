import { NextResponse } from "next/server";
import { recordPayment, syncPreapproval } from "@/lib/billing";
import { getAuthorizedPayment, getPreapproval, MpError, verifyWebhookSignature } from "@/lib/mp";

/**
 * Webhook de Mercado Pago (tópicos de suscripciones).
 * 1) valida la firma x-signature; 2) consulta el recurso en la API de MP; 3) sincroniza.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = (await req.json().catch(() => ({}))) as { type?: string; data?: { id?: string | number } };
  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = String(url.searchParams.get("data.id") ?? body.data?.id ?? url.searchParams.get("id") ?? "");

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[mp webhook] falta MP_WEBHOOK_SECRET: se rechaza la notificación");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const valid = verifyWebhookSignature({
    signature: req.headers.get("x-signature"),
    requestId: req.headers.get("x-request-id"),
    dataId: url.searchParams.get("data.id") ?? (dataId || null),
    secret,
  });
  if (!valid) return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  if (!dataId) return NextResponse.json({ ok: true });

  try {
    if (type === "subscription_preapproval") {
      await syncPreapproval(await getPreapproval(dataId));
    } else if (type === "subscription_authorized_payment") {
      const payment = await getAuthorizedPayment(dataId);
      // Garantiza que la suscripción exista antes de registrar el cobro.
      await syncPreapproval(await getPreapproval(payment.preapproval_id));
      await recordPayment(payment);
    }
  } catch (err) {
    // 404: recurso de otra integración o de prueba; se confirma para que MP no reintente.
    if (err instanceof MpError && err.status === 404) return NextResponse.json({ ok: true });
    console.error("[mp webhook] error", err);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
