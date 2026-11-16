"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AiError, aiConfigured, generateReply } from "@/lib/ai";
import { hasAccess, requireUser } from "@/lib/auth";
import { listBusinesses, requireBusiness, usageThisMonth } from "@/lib/business";
import { limitsFor } from "@/lib/config";
import { sql } from "@/lib/db";

export type ReplyState = { error?: string; reply?: string } | undefined;

const schema = z.object({
  reviewer: z.string().trim().max(80).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().trim().max(3000),
});

export async function createReply(_prev: ReplyState, form: FormData): Promise<ReplyState> {
  const user = await requireUser();
  if (!hasAccess(user)) return { error: "Tu prueba terminó. Elegí un plan para seguir usando la IA." };
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
