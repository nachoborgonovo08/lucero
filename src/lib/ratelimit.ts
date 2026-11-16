import { headers } from "next/headers";
import { sql } from "./db";

/** Límite de intentos con ventana fija, guardado en Postgres. Devuelve true si se permite. */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const rows = await sql<{ count: number }[]>`
    insert into rate_limits (key, window_start)
    values (${key}, to_timestamp(floor(extract(epoch from now()) / ${windowSeconds}) * ${windowSeconds}))
    on conflict (key, window_start) do update set count = rate_limits.count + 1
    returning count`;
  return rows[0].count <= limit;
}

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "local").trim();
}
