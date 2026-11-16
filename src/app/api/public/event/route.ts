import { NextResponse } from "next/server";
import { z } from "zod";
import { APP_URL, BRAND } from "@/lib/config";
import { sql } from "@/lib/db";
import { esc, layout, sendEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/ratelimit";

const schema = z.object({
  slug: z.string().max(60),
  type: z.enum(["view", "rating", "google_click", "feedback"]),
  rating: z.number().int().min(1).max(5).optional(),
  source: z.enum(["qr", "whatsapp", "link"]).default("link"),
  c: z.string().max(40).optional(),
  q: z.string().max(20).optional(),
  message: z.string().trim().max(2000).optional(),
  contact: z.string().trim().max(120).optional(),
});

const NEXT_STATUS = { view: "opened", rating: "rated", google_click: "google", feedback: "rated" } as const;
const RANK = ["pending", "sent", "opened", "rated", "google"];

/** Registra lo que hace un cliente en la página pública de reseñas. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const d = parsed.data;
  if (!(await rateLimit(`event:${await clientIp()}`, 60, 600))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const [biz] = await sql<{ id: string; name: string; email: string }[]>`
    select b.id, b.name, u.email from businesses b join users u on u.id = b.owner_id where b.slug = ${d.slug}`;
  if (!biz) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const [customer] = d.c
    ? await sql<{ id: string; status: string }[]>`
        select id, status from customers where token = ${d.c} and business_id = ${biz.id}`
    : [];

  if (d.type === "feedback") {
    if (!d.message) return NextResponse.json({ error: "invalid" }, { status: 400 });
    await sql`insert into feedback (business_id, customer_id, rating, message, contact)
              values (${biz.id}, ${customer?.id ?? null}, ${d.rating ?? null}, ${d.message}, ${d.contact || null})`;
    await sendEmail(
      biz.email,
      `Nuevo comentario privado en ${biz.name}`,
      layout(
        "Recibiste un comentario privado",
        `<p>${d.rating ? "★".repeat(d.rating) + "☆".repeat(5 - d.rating) : ""}</p>
         <blockquote style="border-left:3px solid #f5a524;margin:0;padding:4px 12px">${esc(d.message)}</blockquote>
         ${d.contact ? `<p>Contacto: ${esc(d.contact)}</p>` : ""}
         <p><a href="${APP_URL}/app/comentarios">Ver en ${BRAND}</a></p>`,
      ),
    );
  }

  const [point] = d.q && !customer
    ? await sql<{ id: string }[]>`select id from qr_points where code = ${d.q} and business_id = ${biz.id}`
    : [];
  await sql`insert into events (business_id, customer_id, qr_id, type, rating, source)
            values (${biz.id}, ${customer?.id ?? null}, ${point?.id ?? null}, ${d.type}, ${d.rating ?? null},
                    ${customer ? "whatsapp" : point ? "qr" : d.source})`;

  const next = NEXT_STATUS[d.type];
  if (customer && RANK.indexOf(next) > RANK.indexOf(customer.status)) {
    await sql`update customers set status = ${next} where id = ${customer.id}`;
  }
  return NextResponse.json({ ok: true });
}
