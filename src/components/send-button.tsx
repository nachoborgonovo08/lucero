"use client";

import { markSent } from "@/actions/requests";

/** Abre WhatsApp con el mensaje listo y marca el pedido como enviado. */
export function SendButton({ id, href, again }: { id: string; href: string; again?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`btn btn-sm ${again ? "btn-ghost" : "btn-wa"}`}
      onClick={() => {
        void markSent(id);
      }}
    >
      {again ? "Reenviar" : "Enviar por WhatsApp"}
    </a>
  );
}
