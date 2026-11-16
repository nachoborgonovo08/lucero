import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { APP_URL, BRAND, TRANSFER } from "@/lib/config";
import { sql } from "@/lib/db";
import { esc, layout, sendEmail } from "@/lib/email";

export const maxDuration = 60;

/**
 * Tareas automáticas diarias (Vercel Cron):
 *  - aviso de fin de prueba 3 días antes;
 *  - resumen semanal por email, los lunes;
 *  - limpieza de sesiones vencidas y contadores viejos.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let reminders = 0;
  const ending = await sql<{ id: string; email: string; name: string }[]>`
    update users set trial_reminder_sent_at = now()
    where plan = 'trial' and trial_reminder_sent_at is null
      and trial_ends_at between now() and now() + interval '3 days'
      and exists (select 1 from businesses where owner_id = users.id)
    returning id, email, name`;
  for (const u of ending) {
    reminders += Number(
      await sendEmail(
        u.email,
        `Tu prueba de ${BRAND} termina en 3 días`,
        layout(
          `${esc(u.name.split(" ")[0])}, tu prueba está por terminar`,
          `<p>Para que tu QR y tu página de reseñas sigan funcionando, elegí un plan antes de que termine la prueba.</p>
           <p><a href="${APP_URL}/app/plan">Elegir mi plan</a></p>`,
        ),
      ),
    );
  }

  // Planes pagados por transferencia: aviso 3 días antes del vencimiento (el cron corre una vez por día).
  let renewals = 0;
  const expiring = await sql<{ email: string; name: string; plan: string; until: Date }[]>`
    select email, name, plan, manual_until as until from users
    where plan_source = 'manual' and plan <> 'trial'
      and manual_until > now() + interval '2 days' and manual_until <= now() + interval '3 days'`;
  for (const u of expiring) {
    const alias = TRANSFER.alias ? `<p>Transferí al alias <b>${esc(TRANSFER.alias)}</b>${TRANSFER.holder ? ` (titular: ${esc(TRANSFER.holder)})` : ""} y mandanos el comprobante.</p>` : "";
    renewals += Number(
      await sendEmail(
        u.email,
        `Tu plan de ${BRAND} vence en 3 días`,
        layout(
          `${esc(u.name.split(" ")[0])}, tu plan está por vencer`,
          `<p>Tu plan vence el ${new Intl.DateTimeFormat("es-AR", { dateStyle: "long" }).format(u.until)}. Para que tu página de reseñas y tus QR sigan funcionando, renovalo antes.</p>
           ${alias}
           <p><a href="${APP_URL}/app/plan">Ver cómo renovar</a></p>`,
        ),
      ),
    );
  }

  let digests = 0;
  if (new Date().getUTCDay() === 1) {
    const rows = await sql<
      { email: string; name: string; views: number; ratings: number; clicks: number; avg: string | null; fb: number }[]
    >`
      select u.email, b.name,
        count(*) filter (where e.type = 'view')::int as views,
        count(*) filter (where e.type = 'rating')::int as ratings,
        count(*) filter (where e.type = 'google_click')::int as clicks,
        round(avg(e.rating) filter (where e.type = 'rating'), 1)::text as avg,
        (select count(*)::int from feedback f where f.business_id = b.id and f.read_at is null) as fb
      from businesses b
      join users u on u.id = b.owner_id
      left join events e on e.business_id = b.id and e.created_at > now() - interval '7 days'
      where (u.plan <> 'trial' and (u.plan_source is distinct from 'manual' or u.manual_until > now())) or u.trial_ends_at > now()
      group by u.email, b.id, b.name`;
    for (const r of rows) {
      digests += Number(
        await sendEmail(
          r.email,
          `Tu semana en ${r.name}: ${r.clicks} ${r.clicks === 1 ? "cliente fue" : "clientes fueron"} a dejar su reseña`,
          layout(
            `Resumen semanal de ${esc(r.name)}`,
            `<ul>
               <li><b>${r.views}</b> visitas a tu página de reseñas</li>
               <li><b>${r.ratings}</b> calificaciones${r.avg ? ` (promedio ${r.avg}★)` : ""}</li>
               <li><b>${r.clicks}</b> clientes fueron a Google a dejar su reseña</li>
               <li><b>${r.fb}</b> comentarios privados sin leer</li>
             </ul>
             <p>${r.views === 0 ? "Esta semana nadie abrió tu página. Probá mandar 5 pedidos por WhatsApp hoy: lleva dos minutos." : "Seguí pidiendo reseñas a cada cliente: la constancia es lo que mueve tu puntaje."}</p>
             <p><a href="${APP_URL}/app/pedir">Pedir reseñas ahora</a></p>`,
          ),
        ),
      );
    }
  }

  await sql`delete from sessions where expires_at < now()`;
  await sql`delete from rate_limits where window_start < now() - interval '2 days'`;
  await sql`delete from password_resets where expires_at < now() - interval '1 day'`;

  return NextResponse.json({ ok: true, trialReminders: reminders, renewalReminders: renewals, weeklyDigests: digests });
}
