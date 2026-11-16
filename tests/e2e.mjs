// Prueba de punta a punta. Requiere: app en :3000 (con .env.local), Postgres y tests/fake-mp.mjs.
import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import postgres from "postgres";

// Playwright se toma de la instalación global (NODE_PATH=$(npm root -g)) o de node_modules.
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = "http://localhost:3000";
const sql = postgres(process.env.DATABASE_URL, { onnotice: () => {} });
const shots = process.env.SHOTS_DIR;
let step = 0;
const ok = (msg) => console.log(`  ✓ ${++step}. ${msg}`);

await sql`truncate users, rate_limits cascade`;
const browser = await chromium.launch();

async function webhook(type, id, { secret = "dev-webhook-secret" } = {}) {
  const ts = Date.now().toString();
  const rid = "req-" + ts;
  const v1 = createHmac("sha256", secret).update(`id:${id.toLowerCase()};request-id:${rid};ts:${ts};`).digest("hex");
  return fetch(`${BASE}/api/mp/webhook?data.id=${id}&type=${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-signature": `ts=${ts},v1=${v1}`, "x-request-id": rid },
    body: JSON.stringify({ type, data: { id } }),
  });
}

async function signup(page, name, email, ref) {
  await page.goto(`${BASE}/registro${ref ? `?ref=${ref}` : ""}`);
  await page.fill("#name", name);
  await page.fill("#email", email);
  await page.fill("#password", "clave-segura-123");
  await page.click("button[type=submit]");
  await page.waitForURL("**/app/alta");
}

async function createBusiness(page, name) {
  await page.fill("#name", name);
  await page.fill("#google_review_url", "https://g.page/r/CabcDEF123/review");
  await page.click("button[type=submit]");
  await page.waitForURL("**/app?bienvenida=1");
}

async function subscribeAndPay(page, plan = "esencial") {
  await page.goto(`${BASE}/app/plan`);
  await page.locator(`form:has(input[value=${plan}]) button[type=submit]`).click();
  await page.waitForURL("**/checkout?preapproval_id=*");
  const id = new URL(page.url()).searchParams.get("preapproval_id");
  const { payment_id } = await (await fetch(`http://127.0.0.1:4010/_pay/${id}`, { method: "POST" })).json();
  return { id, payment_id };
}

try {
  // --- Sitio público ---
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const res = await page.goto(BASE);
  assert.equal(res.status(), 200);
  assert.match(await page.textContent("h1"), /no dejan reseñas/);
  assert.equal(res.headers()["x-frame-options"], "DENY");
  if (shots) await page.screenshot({ path: `${shots}/landing.png`, fullPage: true });
  ok("landing carga con cabeceras de seguridad");

  await page.goto(`${BASE}/calculadora`);
  assert.match(await page.textContent("[aria-live]"), /47/); // 37 × (4,6 − 4,1) ÷ 0,4 = 46,25 → 47
  ok("calculadora: 4,1 con 37 reseñas → 47 para llegar a 4,6");

  await page.goto(`${BASE}/app`);
  await page.waitForURL("**/login");
  ok("/app sin sesión redirige a /login");

  // --- Registro y alta ---
  await signup(page, "Ana Admin", "admin@test.local");
  await page.fill("#name", "Barbería Don Julio");
  await page.fill("#google_review_url", "https://sitio-malicioso.com/x");
  await page.click("button[type=submit]");
  await page.waitForSelector("[role=alert]");
  assert.equal(await page.inputValue("#name"), "Barbería Don Julio");
  ok("alta rechaza links que no son de Google y conserva lo escrito");
  await createBusiness(page, "Barbería Don Julio");
  const [biz] = await sql`select * from businesses`;
  assert.equal(biz.slug, "barberia-don-julio");
  if (shots) await page.screenshot({ path: `${shots}/dashboard-empty.png`, fullPage: true });
  ok("negocio creado con slug limpio");

  // --- Pedidos por WhatsApp ---
  await page.goto(`${BASE}/app/pedir`);
  await page.fill("#name", "Carla Gómez");
  await page.fill("#phone", "011 15 5555-1234");
  await page.locator("form:has(#name) button[type=submit]").click();
  await page.waitForSelector("text=Cliente agregado");
  await page.fill("textarea[name=bulk]", "Juan Pérez, 351 555 4321\nlinea rota\nLucía, +598 99 123 456");
  await page.locator("form:has(textarea) button[type=submit]").click();
  await page.waitForSelector("text=2 clientes agregados");
  const phones = (await sql`select phone from customers order by created_at`).map((r) => r.phone);
  assert.deepEqual(phones.sort(), ["5491155551234", "5493515554321", "59899123456"].sort());
  const [carla] = await sql`select * from customers where name = 'Carla Gómez'`;
  const href = await page.locator(`a[href*="wa.me/5491155551234"]`).getAttribute("href");
  const text = decodeURIComponent(href.split("text=")[1]);
  assert.match(text, /¡Hola Carla! Gracias por elegir Barbería Don Julio/);
  assert.ok(text.includes(`/r/barberia-don-julio?c=${carla.token}`));
  if (shots) await page.screenshot({ path: `${shots}/pedir.png`, fullPage: true });
  ok("teléfonos normalizados y link de WhatsApp personalizado");

  // --- Página pública (como cliente, en un celular) ---
  const phone = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const pub = await phone.newPage();
  await pub.goto(`${BASE}/r/barberia-don-julio?c=${carla.token}`);
  await pub.click('[aria-label="1 estrella"]');
  await pub.waitForSelector("text=Publicar mi reseña en Google");
  await pub.waitForSelector("text=Escribirle en privado al equipo");
  await pub.click('[aria-label="5 estrellas"]');
  await pub.waitForSelector("text=Publicar mi reseña en Google");
  await pub.waitForSelector("text=Escribirle en privado al equipo");
  if (shots) await pub.screenshot({ path: `${shots}/public.png` });
  ok("1★ y 5★ ven las mismas dos opciones (sin filtrado de reseñas)");

  await pub.click("text=Escribirle en privado al equipo");
  await pub.fill("#message", "El corte bien, pero esperé 40 minutos.");
  await pub.fill("#contact", "carla@mail.com");
  await pub.click("text=Enviar mensaje");
  await pub.waitForSelector("text=¡Gracias por contarnos!");
  await pub.route("https://g.page/**", (r) => r.fulfill({ body: "google" }));
  await pub.click("text=También quiero dejar mi reseña en Google");
  await pub.waitForURL("https://g.page/r/CabcDEF123/review");
  await new Promise((r) => setTimeout(r, 500));
  const types = (await sql`select type, source from events order by id`).map((e) => e.type);
  assert.deepEqual(types, ["view", "rating", "rating", "feedback", "google_click"]);
  assert.equal((await sql`select status from customers where id = ${carla.id}`)[0].status, "google");
  ok("eventos registrados, comentario guardado y redirección a Google");

  const qr = await phone.newPage();
  await qr.goto(`${BASE}/r/barberia-don-julio?s=qr`);
  await qr.waitForTimeout(600);
  assert.equal((await sql`select source from events order by id desc limit 1`)[0].source, "qr");
  assert.equal((await fetch(`${BASE}/api/qr/barberia-don-julio?format=png`)).headers.get("content-type"), "image/png");
  assert.equal((await fetch(`${BASE}/r/no-existe`)).status, 404);
  ok("visita por QR atribuida, PNG del QR descargable, slug inexistente da 404");

  // --- QR múltiples ---
  await page.goto(`${BASE}/app/qr`);
  await page.fill("#label", "Mesa 4");
  await page.locator("form:has(#label) button[type=submit]").click();
  await page.waitForSelector('text=QR "Mesa 4" creado');
  const [mesa] = await sql`select * from qr_points`;
  const scan = await phone.newPage();
  await scan.goto(`${BASE}/r/barberia-don-julio?q=${mesa.code}`);
  await scan.click('[aria-label="5 estrellas"]');
  await scan.waitForTimeout(600);
  const perQr = await sql`select type, source from events where qr_id = ${mesa.id} order by id`;
  assert.deepEqual(perQr.map((e) => `${e.type}:${e.source}`), ["view:qr", "rating:qr"]);
  assert.equal((await fetch(`${BASE}/api/qr/barberia-don-julio?q=${mesa.code}&format=png`)).status, 200);
  assert.equal((await fetch(`${BASE}/api/qr/barberia-don-julio?q=inventado`)).status, 404);
  await page.goto(`${BASE}/app/qr?q=${mesa.code}`);
  await page.waitForSelector("text=Cartel de: Mesa 4");
  if (shots) await page.screenshot({ path: `${shots}/qr.png`, fullPage: true });
  ok("QR por mesa: se crea, atribuye sus escaneos y tiene su propio cartel");

  // --- Panel ---
  await page.goto(`${BASE}/app/comentarios`);
  await page.waitForSelector("text=esperé 40 minutos");
  await page.click("text=Marcar como leído");
  await page.waitForSelector("text=Marcar como leído", { state: "detached" });
  await page.goto(`${BASE}/app`);
  if (shots) await page.screenshot({ path: `${shots}/dashboard.png`, fullPage: true });
  await page.goto(`${BASE}/app/qr`);
  assert.ok(await page.locator("svg path").count());
  await page.goto(`${BASE}/app/comentarios`);
  assert.ok(await page.locator("button:has-text('Analizar con IA')").isDisabled());
  await page.goto(`${BASE}/app/respuestas`);
  await page.waitForSelector("text=todavía no están habilitadas");
  ok("buzón, tablero, cartel QR y aviso de IA sin configurar");

  await page.goto(`${BASE}/app/ajustes`);
  await page.fill("#whatsapp_template", "Hola, dejanos tu reseña");
  await page.click("text=Guardar cambios");
  await page.waitForSelector("text=tiene que incluir {link}");
  ok("ajustes validan el mensaje de WhatsApp");

  // --- Pagos ---
  await page.goto(`${BASE}/app/plan`);
  await page.locator("form:has(input[value=esencial]) input[type=email]").fill("rechazado@test.local");
  await page.locator("form:has(input[value=esencial]) button[type=submit]").click();
  await page.waitForSelector("text=Mercado Pago rechazó la solicitud");
  ok("error de Mercado Pago se muestra sin romper");

  const a = await subscribeAndPay(page);
  assert.equal((await webhook("subscription_preapproval", a.id, { secret: "otro" })).status, 401);
  assert.equal((await sql`select plan from users where email = 'admin@test.local'`)[0].plan, "trial");
  ok("webhook con firma inválida es rechazado (401) y no cambia el plan");

  assert.equal((await webhook("subscription_preapproval", a.id)).status, 200);
  assert.equal((await webhook("subscription_authorized_payment", a.payment_id)).status, 200);
  assert.equal((await webhook("subscription_authorized_payment", a.payment_id)).status, 200); // reintento
  const [admin] = await sql`select * from users where email = 'admin@test.local'`;
  assert.equal(admin.plan, "esencial");
  assert.equal((await sql`select count(*)::int n from payments`)[0].n, 1);
  await page.goto(`${BASE}/app/plan?preapproval_id=${a.id}`);
  await page.waitForSelector("text=Tenés el plan Esencial activo");
  await page.waitForSelector("text=Aprobado");
  if (shots) await page.screenshot({ path: `${shots}/plan.png`, fullPage: true });
  ok("webhook firmado activa el plan; el cobro se registra una sola vez");

  // Cambio de plan: al activarse Pro, la suscripción Esencial se cancela sola.
  const up = await subscribeAndPay(page, "pro");
  assert.equal((await webhook("subscription_preapproval", up.id)).status, 200);
  const subs = await sql`select plan, status from subscriptions order by created_at`;
  assert.deepEqual(subs.filter((x) => x.status !== "pending").map((x) => `${x.plan}:${x.status}`), ["esencial:cancelled", "pro:authorized"]);
  assert.equal((await (await fetch(`http://127.0.0.1:4010/preapproval/${a.id}`, { headers: { Authorization: "Bearer TEST-fake-token" } })).json()).status, "cancelled");
  assert.equal((await sql`select plan from users where email = 'admin@test.local'`)[0].plan, "pro");
  ok("cambio de plan cancela la suscripción anterior en Mercado Pago (sin doble cobro)");

  // --- Referidos ---
  const ctxB = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pb = await ctxB.newPage();
  await signup(pb, "Beto Bar", "beto@test.local", admin.referral_code);
  await createBusiness(pb, "Barbería Don Julio");
  const [beto] = await sql`select *, trial_ends_at - now() > interval '29 days' as long from users where email = 'beto@test.local'`;
  assert.ok(beto.long);
  assert.notEqual((await sql`select slug from businesses where owner_id = ${beto.id}`)[0].slug, "barberia-don-julio");
  ok("referido obtiene 30 días de prueba; slug duplicado se resuelve");

  const b = await subscribeAndPay(pb, "pro");
  await pb.goto(`${BASE}/app/plan?preapproval_id=${b.id}`); // sincroniza al volver, sin webhook
  await pb.waitForSelector("text=Tenés el plan Pro activo");
  await webhook("subscription_authorized_payment", b.payment_id);
  assert.equal((await sql`select status from referrals`)[0].status, "pending_reward");
  ok("vuelta del checkout sincroniza sin webhook; referido que paga genera premio");

  // Otro usuario no puede activar su plan con el preapproval ajeno.
  const ctxC = await browser.newContext();
  const pc = await ctxC.newPage();
  await signup(pc, "Caro", "caro@test.local");
  await pc.goto(`${BASE}/app/plan?preapproval_id=${b.id}`);
  assert.equal((await sql`select plan from users where email = 'caro@test.local'`)[0].plan, "trial");
  await pc.goto(`${BASE}/admin`);
  await pc.waitForURL("**/app/alta");
  ok("un preapproval ajeno no activa el plan; /admin bloqueado para no admins");

  // --- Varios negocios (Pro / Agencia) ---
  await page.goto(`${BASE}/app/alta`);
  await createBusiness(page, "Estética Lumen");
  await page.goto(`${BASE}/app/locales`);
  await page.waitForSelector("text=2 de 3 en tu plan");
  await page.waitForSelector("td:has-text(\"Estética Lumen\")");
  if (shots) await page.screenshot({ path: `${shots}/locales.png`, fullPage: true });
  await page.locator("tr:has-text('Barbería Don Julio') button").click();
  await page.waitForURL("**/app");
  await page.waitForSelector("h1:has-text('Barbería Don Julio')");
  ok("vista de varios negocios y cambio de negocio activo");

  // --- Admin ---
  await page.goto(`${BASE}/admin`);
  await page.waitForSelector("text=Premios de referidos por acreditar");
  await page.waitForSelector("text=beto@test.local");
  if (shots) await page.screenshot({ path: `${shots}/admin.png`, fullPage: true });
  await page.click("text=Marcar acreditado");
  await page.waitForSelector("text=Premios de referidos por acreditar", { state: "detached" });
  ok("admin: métricas, usuarios y premio de referido");

  // --- Plan por transferencia: se activa por un mes y vence solo ---
  await page.goto(`${BASE}/admin`);
  await page.locator("tr:has-text('caro@test.local') select").selectOption("esencial");
  await page.locator("tr:has-text('caro@test.local') button:has-text('+1 mes')").click();
  await page.waitForTimeout(800);
  const [caro] = await sql`select plan, plan_source, manual_until > now() + interval '27 days' as month from users where email = 'caro@test.local'`;
  assert.deepEqual([caro.plan, caro.plan_source, caro.month], ["esencial", "manual", true]);
  await pc.goto(`${BASE}/app/plan`);
  await pc.waitForSelector("text=Tenés el plan Esencial activo hasta el");
  await pc.waitForSelector("text=lucero.test.alias");
  const notice = await pc.locator("a:has-text('Ya transferí la renovación')").getAttribute("href");
  assert.match(decodeURIComponent(notice), /wa\.me\/5491100000000\?text=.*caro@test\.local/);
  if (shots) await pc.screenshot({ path: `${shots}/plan-transferencia.png`, fullPage: true });
  await sql`update users set manual_until = now() + interval '2 days 12 hours' where email = 'caro@test.local'`;
  const renew = await (await fetch(`${BASE}/api/cron/daily`, { headers: { Authorization: "Bearer dev-cron-secret" } })).json();
  assert.equal(renew.renewalReminders, 0); // sin RESEND_API_KEY no se envía, pero se intenta
  await sql`update users set manual_until = now() - interval '1 day' where email = 'caro@test.local'`;
  await pc.goto(`${BASE}/app/plan`);
  await pc.waitForSelector("text=Tu plan venció.");
  await pc.waitForSelector("text=Renovar por transferencia");
  ok("plan por transferencia: alias visible, aviso por WhatsApp, vence solo al mes");

  // --- Cancelación y vencimiento ---
  pb.on("dialog", (d) => d.accept());
  await pb.goto(`${BASE}/app/plan`);
  await pb.click("text=Cancelar suscripción");
  await pb.waitForSelector("text=Estás en la prueba gratis");
  await sql`update users set trial_ends_at = now() - interval '1 day' where id = ${beto.id}`;
  await pb.goto(`${BASE}/app`);
  await pb.waitForSelector("text=Tu prueba gratis terminó");
  const betoSlug = (await sql`select slug from businesses where owner_id = ${beto.id}`)[0].slug;
  await pub.goto(`${BASE}/r/${betoSlug}`);
  await pub.waitForSelector("text=en pausa");
  ok("cancelar baja el plan; cuenta vencida pausa panel y página pública");

  // --- Cron ---
  assert.equal((await fetch(`${BASE}/api/cron/daily`)).status, 401);
  await sql`update users set trial_ends_at = now() + interval '2 days' where email = 'caro@test.local'`;
  const cron = await fetch(`${BASE}/api/cron/daily`, { headers: { Authorization: "Bearer dev-cron-secret" } });
  assert.equal(cron.status, 200);
  ok(`cron protegido por secreto: ${JSON.stringify(await cron.json())}`);

  // --- Sesión ---
  await page.goto(`${BASE}/app`);
  await page.click("text=Salir");
  await page.waitForURL(BASE + "/");
  await page.goto(`${BASE}/login`);
  await page.fill("#email", "admin@test.local");
  await page.fill("#password", "incorrecta");
  await page.click("button[type=submit]");
  await page.waitForSelector("text=Email o contraseña incorrectos");
  await page.fill("#password", "clave-segura-123");
  await page.click("button[type=submit]");
  await page.waitForURL("**/app");
  ok("logout, login fallido y login correcto");

  // --- Recuperar contraseña ---
  await page.goto(`${BASE}/recuperar`);
  await page.fill("#email", "admin@test.local");
  await page.click("button[type=submit]");
  await page.waitForSelector("text=te enviamos un link");
  assert.equal((await sql`select count(*)::int n from password_resets`)[0].n, 1);
  ok("recuperación de contraseña genera un token de un solo uso");

  if (shots) {
    const m = await phone.newPage();
    await m.goto(BASE);
    await m.screenshot({ path: `${shots}/landing-mobile.png`, fullPage: true });
  }
  console.log(`\nTodo OK: ${step} verificaciones.`);
} finally {
  await browser.close();
  await sql.end();
}
