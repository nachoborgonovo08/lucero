"use client";

import { startTransition, useActionState, useState } from "react";
import { createReply } from "@/actions/ai";
import { StarIcon } from "./brand";
import { CopyButton } from "./form";

export function ReplyForm({ disabled }: { disabled?: string }) {
  const [state, action, pending] = useActionState(createReply, undefined);
  const [rating, setRating] = useState(5);
  return (
    <form
      className="card space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <input type="hidden" name="rating" value={rating} />
      <div>
        <span className="label">Estrellas de la reseña</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Estrellas">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} estrellas`} onClick={() => setRating(n)} className={`cursor-pointer ${n <= rating ? "text-star" : "text-line"}`}>
              <StarIcon className="size-8" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor="reviewer">Nombre de quien la escribió <span className="font-normal text-muted">(opcional)</span></label>
        <input className="input" id="reviewer" name="reviewer" maxLength={80} />
      </div>
      <div>
        <label className="label" htmlFor="review">Texto de la reseña</label>
        <textarea className="input min-h-28" id="review" name="review" maxLength={3000} placeholder="Pegá acá la reseña tal cual aparece en Google" />
      </div>
      <button className="btn btn-primary" disabled={pending || Boolean(disabled)}>
        {pending ? "Escribiendo…" : "Generar respuesta"}
      </button>
      {disabled && <p className="hint">{disabled}</p>}
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-bad">{state.error}</p>}
      {state?.reply && (
        <div className="rounded-xl border border-star bg-star-soft p-4">
          <p className="whitespace-pre-wrap">{state.reply}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyButton text={state.reply} label="Copiar respuesta" className="btn btn-primary btn-sm" />
            <a className="btn btn-ghost btn-sm" href="https://business.google.com/reviews" target="_blank" rel="noopener">Abrir mis reseñas en Google</a>
          </div>
        </div>
      )}
    </form>
  );
}
