import type { Metadata } from "next";
import { Stars } from "@/components/brand";
import { CopyButton } from "@/components/form";
import { ReplyForm } from "@/components/reply-form";
import { aiConfigured } from "@/lib/ai";
import { hasAccess, requireUser } from "@/lib/auth";
import { listBusinesses, requireBusiness, usageThisMonth } from "@/lib/business";
import { limitsFor } from "@/lib/config";
import { sql } from "@/lib/db";

export const metadata: Metadata = { title: "Responder reseñas" };

export default async function RepliesPage() {
  const user = await requireUser();
  const biz = await requireBusiness(user);
  const used = await usageThisMonth((await listBusinesses(user.id)).map((b) => b.id));
  const limit = limitsFor(user.plan).aiRepliesPerMonth;
  const history = await sql<{ id: string; reviewer: string | null; rating: number; review_text: string; reply: string }[]>`
    select id, reviewer, rating, review_text, reply from ai_replies
    where business_id = ${biz.id} order by created_at desc limit 20`;
  const disabled = !aiConfigured()
    ? "Las respuestas con IA todavía no están habilitadas en este sitio."
    : !hasAccess(user)
      ? "Tu prueba terminó. Elegí un plan para seguir usando la IA."
      : undefined;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Responder reseñas con IA</h1>
        <p className="mt-1 text-muted">
          Pegá la reseña y te devolvemos una respuesta lista para publicar, con el tono de {biz.name}. {used.aiReplies} de {limit} usadas este mes.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <ReplyForm disabled={disabled} />
        <section className="space-y-3">
          <h2 className="font-semibold">Últimas respuestas</h2>
          {history.length === 0 && <p className="text-sm text-muted">Acá vas a ver las respuestas que generes.</p>}
          {history.map((h) => (
            <details key={h.id} className="card !p-4">
              <summary className="flex cursor-pointer items-center gap-2 text-sm">
                <Stars value={h.rating} className="size-3.5" />
                <span className="truncate">{h.reviewer ?? "Sin nombre"} · {h.review_text.slice(0, 50) || "sin texto"}</span>
              </summary>
              <p className="mt-3 whitespace-pre-wrap text-sm">{h.reply}</p>
              <div className="mt-2"><CopyButton text={h.reply} /></div>
            </details>
          ))}
        </section>
      </div>
    </div>
  );
}
