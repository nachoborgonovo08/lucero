"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AiError, aiConfigured, generateReply, summarizeFeedback } from "@/lib/ai";
import { hasAccess, requireUser } from "@/lib/auth";
import { listBusinesses, requireBusiness, usageThisMonth } from "@/lib/business";
import { limitsFor, MIN_FEEDBACK_FOR_INSIGHTS } from "@/lib/config";
import { sql } from "@/lib/db";

export type ReplyState = { error?: string; reply?: string } | undefined;

const schema = z.object({
  reviewer: z.string().trim().max(80).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().trim().max(3000),
});

export async function createReply(_prev: ReplyState, form: FormData): Promise<ReplyState> {
  const user = await requireUser();
  if (!hasAccess(user)) return { error: "Tu prueba o tu plan terminó. Renová para seguir usando la IA." };
  if (!aiConfigured()) return { error: "Las respuestas con IA todavía no están habilitadas en este sitio." };
  const biz = await requireBusiness(user);
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Elegí la cantidad de estrellas y pegá el texto de la reseña." };

  const limits = limitsFor(user.plan);
  const used = await usageThisMonth((await listBusinesses(user.id)).map((b) => b.id));
  if (used.aiReplies >= limits.aiRepliesPerMonth) {
    return { error: `Usaste las ${limits.aiRepliesPerMonth} respuestas con IA de este mes.` };
  }

  try {
    const reply = await generateReply({
      business: biz.name,
      category: biz.category,
      tone: biz.tone,
      reviewer: parsed.data.reviewer || null,
      rating: parsed.data.rating,
      review: parsed.data.review,
    });
    await sql`insert into ai_replies (business_id, reviewer, rating, review_text, reply)
              values (${biz.id}, ${parsed.data.reviewer || null}, ${parsed.data.rating}, ${parsed.data.review}, ${reply})`;
    revalidatePath("/app/respuestas");
    return { reply };
  } catch (err) {
    if (err instanceof AiError) return { error: err.message };
    console.error("[ai] error inesperado", err);
    return { error: "No pudimos generar la respuesta. Probá de nuevo." };
  }
}

/** Resume qué se repite en los comentarios privados de los últimos 90 días. Cuenta como un uso de IA. */
export async function analyzeFeedback(_prev: ReplyState): Promise<ReplyState> {
  const user = await requireUser();
  if (!hasAccess(user)) return { error: "Tu prueba o tu plan terminó. Renová para seguir usando la IA." };
  if (!aiConfigured()) return { error: "El análisis con IA todavía no está habilitado en este sitio." };
  const biz = await requireBusiness(user);
  const items = await sql<{ rating: number | null; message: string; date: string }[]>`
    select rating, message, to_char(created_at, 'DD/MM') as date from feedback
    where business_id = ${biz.id} and created_at > now() - interval '90 days'
    order by created_at desc limit 150`;
  if (items.length < MIN_FEEDBACK_FOR_INSIGHTS) {
    return { error: `Hacen falta al menos ${MIN_FEEDBACK_FOR_INSIGHTS} comentarios para detectar patrones. Tenés ${items.length}.` };
  }
  const limits = limitsFor(user.plan);
  const used = await usageThisMonth((await listBusinesses(user.id)).map((b) => b.id));
  if (used.aiReplies >= limits.aiRepliesPerMonth) {
    return { error: `Usaste los ${limits.aiRepliesPerMonth} usos de IA de este mes.` };
  }
  try {
    const reply = await summarizeFeedback({ business: biz.name, category: biz.category, items });
    await sql`insert into ai_replies (business_id, reviewer, rating, review_text, reply)
              values (${biz.id}, 'Análisis de comentarios', 5, ${`${items.length} comentarios`}, ${reply})`;
    return { reply };
  } catch (err) {
    if (err instanceof AiError) return { error: err.message };
    console.error("[ai] error inesperado", err);
    return { error: "No pudimos hacer el análisis. Probá de nuevo." };
  }
}
