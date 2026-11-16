"use client";

import { useEffect, useRef, useState } from "react";
import { StarIcon } from "./brand";

type Props = { slug: string; name: string; googleUrl: string; token?: string; qr?: string; source: "qr" | "whatsapp" | "link" };

export function ReviewFlow({ slug, name, googleUrl, token, qr, source }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [mode, setMode] = useState<"choose" | "write" | "sent">("choose");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const viewed = useRef(false);

  const track = (payload: Record<string, unknown>) =>
    fetch("/api/public/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, source, c: token, q: qr, ...payload }),
      keepalive: true,
    });

  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    void track({ type: "view" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = (n: number) => {
    setRating(n);
    void track({ type: "rating", rating: n });
  };

  const goGoogle = () => {
    void track({ type: "google_click", rating: rating || undefined });
    window.location.href = googleUrl;
  };

  async function send(form: FormData) {
    setBusy(true);
    setError("");
    const res = await track({
      type: "feedback",
      rating: rating || undefined,
      message: String(form.get("message") ?? ""),
      contact: String(form.get("contact") ?? ""),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) setMode("sent");
    else setError("No pudimos enviar tu mensaje. Probá de nuevo.");
  }

  if (mode === "sent") {
    return (
      <div className="text-center">
        <p className="text-4xl">🙏</p>
        <h1 className="mt-3 text-2xl font-semibold">¡Gracias por contarnos!</h1>
        <p className="mt-2 text-muted">Tu mensaje le llegó directo al equipo de {name}.</p>
        <button onClick={goGoogle} className="btn btn-ghost mt-6 w-full">También quiero dejar mi reseña en Google</button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold leading-tight tracking-tight">¿Cómo fue tu experiencia en {name}?</h1>
      <div className="mt-6 flex justify-center gap-1.5" role="radiogroup" aria-label="Tu calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => pick(n)}
            className={`cursor-pointer transition active:scale-90 ${n <= (hover || rating) ? "text-star" : "text-line"}`}
          >
            <StarIcon className="size-12" />
          </button>
        ))}
      </div>

      {rating > 0 && mode === "choose" && (
        <div className="mt-8 space-y-3">
          <p className="text-muted">¡Gracias! ¿Dónde querés dejar tu opinión?</p>
          <button onClick={goGoogle} className="btn btn-primary w-full !py-3.5 text-base">
            Publicar mi reseña en Google
          </button>
          <button onClick={() => setMode("write")} className="btn btn-ghost w-full !py-3.5 text-base">
            Escribirle en privado al equipo
          </button>
        </div>
      )}

      {mode === "write" && (
        <form
          className="mt-8 space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            void send(new FormData(e.currentTarget));
          }}
        >
          <label className="label" htmlFor="message">Tu mensaje para {name}</label>
          <textarea id="message" name="message" className="input min-h-28" required maxLength={2000} placeholder="Contanos qué pasó o qué podríamos mejorar" />
          <label className="label" htmlFor="contact">Tu WhatsApp o email <span className="font-normal text-muted">(opcional, si querés que te respondan)</span></label>
          <input id="contact" name="contact" className="input" maxLength={120} />
          {error && <p role="alert" className="text-sm text-bad">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Enviando…" : "Enviar mensaje"}</button>
          <button type="button" onClick={() => setMode("choose")} className="w-full cursor-pointer py-2 text-sm text-muted underline">Volver</button>
        </form>
      )}
    </div>
  );
}
