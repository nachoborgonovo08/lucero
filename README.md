# Lucero

Micro-SaaS para que negocios locales consigan más reseñas en Google: página de reseñas con QR, pedidos por WhatsApp con un toque, buzón de comentarios privados, respuestas con IA, suscripciones con Mercado Pago, referidos y panel de administración.

El plan de negocio completo (investigación, precios, marketing, plan 30/60/90) está en [`docs/NEGOCIO.md`](docs/NEGOCIO.md).

## Stack

- Next.js 16 (App Router, Server Actions) + TypeScript + Tailwind 4
- PostgreSQL (Supabase o cualquier Postgres) con el cliente `postgres`
- Sesiones propias (bcrypt + cookie httpOnly, token guardado con hash)
- Mercado Pago Suscripciones (preapproval + webhook firmado)
- Claude (Anthropic) para redactar respuestas · Resend para emails

## Desarrollo local

```bash
cp .env.example .env.local   # completar DATABASE_URL como mínimo
npm install
npm run db:migrate
npm run dev
```

Sin `MP_ACCESS_TOKEN`, `ANTHROPIC_API_KEY` o `RESEND_API_KEY` la app funciona igual: cada pantalla avisa que esa función no está habilitada (no simula nada).

## Pruebas de punta a punta

Recorren registro, alta, pedidos, página pública, pagos (contra un simulador local de la API de Mercado Pago), referidos, admin, cron y sesión. Necesitan Playwright (`npm i -D playwright && npx playwright install chromium`).

```bash
# .env.local de prueba: MP_API_BASE=http://127.0.0.1:4010, MP_ACCESS_TOKEN=TEST-fake-token,
# MP_WEBHOOK_SECRET=dev-webhook-secret, CRON_SECRET=dev-cron-secret, ADMIN_EMAILS=admin@test.local
node tests/fake-mp.mjs &
npm run build && npm start &
node --env-file=.env.local tests/e2e.mjs   # ¡borra los datos de la base!
```

## Puesta en producción (Vercel + Neon)

1. **Proyecto**: en Vercel, importar el repo. El build (`vercel-build`) aplica el esquema de la base solo, si hay `DATABASE_URL`.
2. **Base de datos**: en el proyecto de Vercel, *Storage → Create Database → Neon* (plan gratuito) y conectarla al proyecto. Eso crea `DATABASE_URL` automáticamente. Volver a desplegar. Sirve cualquier otro Postgres cargando `DATABASE_URL` a mano.
3. **Mercado Pago** (*Tus integraciones*): crear una aplicación y cargar el *Access Token* en `MP_ACCESS_TOKEN`. En *Webhooks* apuntar a `https://TU-DOMINIO/api/mp/webhook`, activar los eventos **Planes y suscripciones**, y copiar la *clave secreta* en `MP_WEBHOOK_SECRET`. Probar primero con usuarios de prueba.
4. **Precios**: `PRICE_ESENCIAL`, `PRICE_PRO` y `PRICE_AGENCIA` en la moneda de tu cuenta de Mercado Pago (`CURRENCY`).
5. **Anthropic**: `ANTHROPIC_API_KEY`. **Resend**: verificar el dominio y cargar `RESEND_API_KEY` y `EMAIL_FROM`.
6. **Admin y cron**: `ADMIN_EMAILS` con tu email; `CRON_SECRET` con un valor aleatorio largo (Vercel lo envía solo al cron de `vercel.json`).
7. **Dominio propio**: al sumarlo, definir `APP_URL` con ese dominio (sin barra final). Sin `APP_URL` se usa el dominio de producción de Vercel.
8. Completar los datos legales en `/terminos` y `/privacidad`.

## Mapa del código

| Ruta | Qué hay |
| --- | --- |
| `db/schema.sql` | Esquema completo, idempotente |
| `src/lib/` | config y planes, auth, Mercado Pago, facturación, IA, emails, teléfonos |
| `src/actions/` | Server Actions (auth, negocio, pedidos, IA, pagos, admin) |
| `src/app/r/[slug]` | Página pública de reseñas |
| `src/app/app/` | Panel del cliente |
| `src/app/admin` | Panel de administración |
| `src/app/api/` | Eventos públicos, webhook de MP, cron diario, QR |
