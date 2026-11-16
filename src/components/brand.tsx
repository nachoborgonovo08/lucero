import Link from "next/link";
import { BRAND } from "@/lib/config";

export function StarIcon({ className = "size-5", filled = true }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.6}>
      <path d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9L12 2.6z" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
      <span className="grid size-8 place-items-center rounded-xl bg-ink text-star">
        <StarIcon className="size-4.5" />
      </span>
      {BRAND}
    </Link>
  );
}

export function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex text-star" aria-label={`${value} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} className={className} filled={n <= Math.round(value)} />
      ))}
    </span>
  );
}
