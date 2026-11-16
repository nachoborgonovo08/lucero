import { readFileSync } from "node:fs";
import postgres from "postgres";

// Para migrar conviene la conexión directa (sin pooler) cuando el proveedor la ofrece.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) {
  if (process.argv.includes("--if-configured")) {
    console.log("Sin DATABASE_URL: se omite la migración.");
    process.exit(0);
  }
  console.error("Falta DATABASE_URL");
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
await sql.unsafe(readFileSync("db/schema.sql", "utf8"));
await sql.end();
console.log("Esquema aplicado.");
