"use client";

import { useState } from "react";

/** Reseñas de 5★ necesarias para llevar un promedio `avg` con `count` reseñas hasta `target`. */
export function reviewsNeeded(avg: number, count: number, target: number) {
  if (target >= 5 || avg >= target) return avg >= target ? 0 : Infinity;
  return Math.ceil((count * (target - avg)) / (5 - target));
}

export function Calculator() {
  const [avg, setAvg] = useState("4.1");
  const [count, setCount] = useState("37");
  const [target, setTarget] = useState("4.6");
  const a = Number(avg.replace(",", "."));
  const c = Number(count);
  const t = Number(target.replace(",", "."));
  const valid = a >= 1 && a <= 5 && c >= 1 && Number.isInteger(c) && t > 1 && t < 5;
  const need = valid ? reviewsNeeded(a, c, t) : null;

  return (
    <div className="card">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="avg">Tu puntaje actual</label>
          <input id="avg" className="input" inputMode="decimal" value={avg} onChange={(e) => setAvg(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="count">Cantidad de reseñas</label>
          <input id="count" className="input" inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="target">Puntaje que querés</label>
          <input id="target" className="input" inputMode="decimal" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-star-soft p-6 text-center" aria-live="polite">
        {need === null ? (
          <p className="text-muted">Completá los tres datos. El puntaje va de 1 a 5 y el objetivo tiene que ser menor a 5.</p>
        ) : need === 0 ? (
          <p className="text-lg font-semibold">Ya estás en ese puntaje o por encima. Ahora toca sostenerlo con reseñas recientes.</p>
        ) : (
          <>
            <p className="text-sm text-star-deep">Necesitás</p>
            <p className="text-5xl font-semibold tracking-tight">{need.toLocaleString("es-AR")}</p>
            <p className="mt-1 font-medium">reseñas nuevas de 5 estrellas para llegar a {t.toLocaleString("es-AR")}</p>
            <p className="mt-3 text-sm text-muted">
              Si conseguís 3 por semana, llegás en unas {Math.ceil(need / 3)} semanas. Con 1 por semana, en {need}.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
