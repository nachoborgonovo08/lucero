import { readFileSync } from "node:fs";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
await sql.unsafe(readFileSync("db/schema.sql", "utf8"));
await sql.end();
console.log("Esquema aplicado.");
