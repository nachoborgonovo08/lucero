"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/app", label: "Inicio", icon: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" },
  { href: "/app/pedir", label: "Pedir", icon: "M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.7-5.2A8.5 8.5 0 1 1 21 12z" },
  { href: "/app/qr", label: "QR", icon: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" },
  { href: "/app/comentarios", label: "Buzón", icon: "M4 5h16v11H8l-4 4z" },
  { href: "/app/respuestas", label: "Responder", icon: "M12 3l1.8 4.9L19 9.5l-4.2 3 1.5 5L12 14.6 7.7 17.5l1.5-5L5 9.5l5.2-1.6z" },
];

export function Nav({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <>
      {ITEMS.map((it) => {
        const active = it.href === "/app" ? path === "/app" : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition md:flex-none md:flex-row md:gap-3 md:px-3 md:py-2.5 md:text-sm ${
              active ? "bg-ink text-white" : "text-muted hover:bg-white hover:text-ink"
            }`}
          >
            <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
              <path d={it.icon} />
            </svg>
            {it.label}
            {it.href === "/app/comentarios" && unread > 0 && (
              <span className="absolute right-2 top-1 rounded-full bg-star px-1.5 text-[10px] font-bold text-ink md:static md:ml-auto">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}
