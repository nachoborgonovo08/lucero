import { BRAND } from "./config";

/**
 * Envía un email con Resend. Si no hay RESEND_API_KEY, no envía nada:
 * lo registra en el log del servidor y devuelve false.
 */
export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // El cuerpo (que puede traer links de un solo uso) solo se muestra en desarrollo.
    console.log(`[email no enviado: falta RESEND_API_KEY] para=${to} asunto="${subject}"`);
    if (process.env.NODE_ENV !== "production") console.log(html);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? `${BRAND} <onboarding@resend.dev>`,
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) console.error("[email] error de Resend", res.status, await res.text());
  return res.ok;
}

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function layout(title: string, body: string) {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14171f">
  <p style="font-weight:700;font-size:18px;margin:0 0 16px">★ ${BRAND}</p>
  <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
  ${body}
  <p style="color:#6b7280;font-size:12px;margin-top:32px">Recibís este email porque tenés una cuenta en ${BRAND}.</p>
</div>`;
}
