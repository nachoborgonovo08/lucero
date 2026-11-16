import postgres from "postgres";

declare global {
  var __sql: ReturnType<typeof postgres> | undefined;
}

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta la variable DATABASE_URL");
  // prepare:false => compatible con el pooler en modo transacción de Supabase.
  return postgres(url, { max: 5, prepare: false, idle_timeout: 20, onnotice: () => {} });
}

// Conexión perezosa: no se abre al importar (el build no necesita la base).
export const sql: ReturnType<typeof postgres> = new Proxy(function () {} as never, {
  apply(_t, _this, args) {
    globalThis.__sql ??= connect();
    return (globalThis.__sql as unknown as (...a: unknown[]) => unknown)(...args);
  },
  get(_t, prop) {
    globalThis.__sql ??= connect();
    const value = (globalThis.__sql as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === "function" ? value.bind(globalThis.__sql) : value;
  },
});
