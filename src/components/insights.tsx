"use client";

import { startTransition, useActionState } from "react";
import { analyzeFeedback } from "@/actions/ai";

export function Insights({ count, min }: { count: number; min: number }) {
  const [state, action, pending] = useActionState(analyzeFeedback, undefined);
  const enough = count >= min;
  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Qué se repite en tus comentarios</h2>
          <p className="text-sm text-muted">
            {enough
              ? `La IA lee tus ${count} comentarios de los últimos 90 días y te dice qué arreglar primero.`
              : `Disponible cuando tengas ${min} comentarios (tenés ${count}).`}
          </p>
        </div>
        <button className="btn btn-primary btn-sm" disabled={pending || !enough} onClick={() => startTransition(() => action())}>
          {pending ? "Analizando…" : "Analizar con IA"}
        </button>
      </div>
      {state?.error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-bad">{state.error}</p>}
      {state?.reply && <p className="mt-4 whitespace-pre-wrap rounded-xl bg-star-soft p-4 text-sm leading-relaxed">{state.reply}</p>}
    </section>
  );
}
