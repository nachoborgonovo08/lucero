# Lucero: plan de negocio

Investigación hecha el 16/11/2026 con búsquedas web. Desde este entorno no pude abrir las páginas de los competidores (la red solo permitía el buscador), así que los precios salen de los resultados de búsqueda y de comparativas de terceros. **Verificalos en cada sitio antes de usarlos en ventas.** Donde algo es una hipótesis mía y no un dato, lo digo.

Supuse que operás desde Argentina (por cómo escribís). Eso define el medio de cobro: Stripe no opera directo en Argentina, por eso el producto cobra con Mercado Pago.

---

## 1. Investigación: qué se está pagando hoy

| Categoría | Qué encontré | Lectura |
| --- | --- | --- |
| Gestión de reseñas (EE. UU.) | NiceJob desde USD 75/mes, Grade.us USD 99–124, GatherUp desde USD 99, Birdeye y Podium con precio a pedido (un tercero estima ~USD 299 por local) | Categoría probada: miles de negocios pagan todos los meses por esto. Demasiado cara para un comercio latinoamericano. |
| Gestión de reseñas (España) | ReviewLoop 19 y 39 EUR/mes, The Reviewers 25 EUR/mes | Existe el micro-SaaS barato en español, pero apuntado a España. |
| Reseñas (Argentina) | StarTap (placas NFC/QR), Linkeados (kit de QR, ARS 90.000 pago único) | El mercado local hoy compra un **objeto de pago único**, no un servicio. Hay demanda y no hay un SaaS local instalado. |
| Turnos y recordatorios por WhatsApp | AgendaPro, Pedí Tu Turno (desde USD 9), guías que citan ARS 15.000–80.000/mes; cada mensaje por la API de WhatsApp tiene costo aparte | Demanda fuerte, pero muy competido y con costo variable por mensaje. |
| Herramientas para vendedores de Mercado Libre | Nubimetrics (socio Platinum de ML), Real Trends | Jugadores con acceso oficial a datos. Sin ventaja clara para un solo fundador. |
| Listas de "ideas micro-SaaS 2026" | Mucho contenido de relleno con cifras sin fuente (el "340% de crecimiento" no tiene origen rastreable) | Descartado como evidencia. |

Dato de demanda: la encuesta de consumidores de BrightLocal 2026 (EE. UU., 1.002 personas, leída a través de resúmenes de terceros) reporta que casi todos los consumidores leen reseñas de negocios locales y que la **recencia** pesa mucho. Es de EE. UU.: úsalo como indicio, no como estadística de tu mercado.

Dato regulatorio clave: Google prohíbe el *review gating* (pedir reseñas solo a clientes contentos o desalentar las negativas) y puede borrar reseñas o restringir perfiles. Varias herramientas baratas lo hacen igual. Es la base del diferencial de Lucero.

### Actualización: competidores locales que no había encontrado

Una segunda búsqueda (misma fecha) mostró que **sí hay SaaS locales**, lo que corrige la fila "Reseñas (Argentina)" de la tabla:

| Competidor | Qué ofrece | Precio según la búsqueda |
| --- | --- | --- |
| [DAME5](https://dame5.app/) (Argentina) | Cartelería NFC/QR y respuestas con IA | ARS 9.999/mes, plan único |
| [Trustars](https://www.trustars.com.ar/) (Argentina) | Pedidos por email y WhatsApp, QR, widgets, reseñas en video, respuestas con IA | Entre USD 49 y USD 2.990 según sus datos estructurados; no pude ver el detalle por plan |
| [StarTap](https://startap.net.ar/) | Placas NFC/QR | ARS 59.000, pago único |

No encontré ningún producto llamado "Dimmi" en este rubro.

**Qué cambia:**

- **El precio marcador de Esencial (ARS 19.900) duplica al de DAME5.** O bajás a un rango parecido, o lo justificás con lo que DAME5 no muestra: pedidos por WhatsApp con seguimiento, QR por mesa o empleado, buzón privado y vista para agencias. Verificá en su sitio qué incluye hoy.
- **Trustars cubre el segmento alto** (desde USD 49). El hueco está entre los dos: más completo que DAME5, mucho más barato y simple que Trustars.
- **El plan Agencia es el diferencial más defendible**, porque ninguno de los dos aparece vendiéndose a través de agencias, y vos ya tenés una (Brote Studios).

## 2. Las tres finalistas

Puntaje de 1 (malo) a 5 (bueno). Es mi criterio, no una medición.

| Criterio | A. Reseñas de Google para negocios locales | B. Recordatorios de turnos por WhatsApp | C. Monitor de precios para vendedores de Mercado Libre |
| --- | --- | --- | --- |
| Demanda real | 4 | 5 | 4 |
| Competencia (5 = poca) | 4 en LatAm | 2 | 2 |
| Dificultad de desarrollo (5 = fácil) | 5 | 2 | 2 |
| Inversión inicial (5 = baja) | 5 | 3 | 3 |
| Costos mensuales (5 = bajos) | 5 | 3 (costo por mensaje) | 3 (scraping/API) |
| Facilidad para conseguir clientes | 4 | 3 | 3 |
| Margen | 5 | 3 | 4 |
| Ingreso recurrente | 3 | 5 | 4 |
| Automatización | 4 | 4 | 4 |
| Expansión internacional | 4 | 3 | 2 |
| **Total** | **43** | **33** | **31** |

**Ganadora: A.** Razones:

1. **Los prospectos son públicos y vienen con el argumento de venta incluido.** Cada negocio muestra en Google Maps su puntaje y su cantidad de reseñas, y los de su competencia. Ningún otro nicho te deja abrir una conversación con "tenés 4,1 con 37 reseñas y el de la otra cuadra 4,7 con 312".
2. **Costo marginal casi cero.** Los mensajes salen del WhatsApp del propio comercio (links `wa.me`), sin API paga ni riesgo de bloqueo.
3. **Retención física.** El QR impreso en el mostrador apunta a nuestra URL. Si dejan de pagar, el cartel deja de funcionar.
4. **Se puede vender caminando**, sin pauta ni audiencia previa.

**El punto débil, sin maquillaje:** el ingreso recurrente (3 sobre 5). En Argentina la gente hoy paga una vez por una placa. El riesgo real es que prueben, impriman el QR y cancelen a los dos meses. Lo atacan el buzón privado, el seguimiento de pedidos, el resumen semanal y las respuestas con IA, pero **hay que medirlo**. Ver criterios de corte en la sección 8.

## 3. Cliente ideal

Dueño o encargado de un negocio local con atención presencial y ticket medio o alto, donde una reseña cambia la decisión: **barberías y peluquerías, estética, odontólogos y consultorios, talleres mecánicos, veterinarias, gimnasios, restaurantes de barrio, inmobiliarias**.

- Tiene perfil de Google pero menos reseñas que su competencia, o un puntaje por debajo de 4,5.
- Usa WhatsApp para todo. No usa software de gestión, o usa uno básico.
- Decide solo y en el momento.

Fuera de foco al inicio: cadenas grandes (compran Birdeye o similar), comercios sin perfil de Google, y negocios de ticket muy bajo y alta rotación.

## 4. Producto (lo que está construido)

- Página pública de reseñas por negocio, con calificación y dos opciones iguales para todos: publicar en Google o escribir en privado.
- Cartel con QR listo para imprimir y QR descargable.
- Pedidos por WhatsApp: alta individual o por lista, mensaje personalizado, seguimiento (enviado, abrió, calificó, fue a Google).
- Buzón de comentarios privados con aviso por email.
- Respuestas a reseñas con IA, con el tono del negocio (copiar y pegar en Google).
- Tablero con métricas de 30 días.
- Suscripciones con Mercado Pago, prueba de 14 días sin tarjeta, cancelación desde el panel.
- Referidos: 30 días de prueba para el invitado, 30 días gratis para quien invita.
- Automatizaciones: aviso de fin de prueba, resumen semanal, limpieza.
- Panel de administración: MRR, conversión de prueba a pago, uso por cuenta, planes manuales.
- Calculadora pública de reseñas (imán de SEO y de prospección).

**Lo que todavía no hace:** leer ni publicar reseñas automáticamente en Google. Eso requiere que Google apruebe el acceso a la API de Business Profile; es el primer punto de la hoja de ruta.

## 5. Monetización

| | Esencial | Pro |
| --- | --- | --- |
| Precio objetivo | ~USD 15/mes | ~USD 29/mes |
| Locales | 1 | hasta 3 |
| Pedidos por WhatsApp | 150/mes | 1.000/mes |
| Respuestas con IA | 30/mes | 300/mes |

**Por qué estos precios:**

- Techo: las herramientas de EE. UU. cobran USD 75–125 por un local.
- Referencia en español: 19–39 EUR en España.
- Piso local: un kit de QR cuesta ARS 90.000 una sola vez; el precio mensual tiene que sentirse menor que eso.
- Referencia de bolsillo: el software de turnos que estos mismos negocios ya pagan arranca cerca de USD 9.

USD 15 queda por debajo de España, muy por debajo de EE. UU., y un solo cliente nuevo al mes lo paga en casi cualquiera de los rubros elegidos. **Es una hipótesis hasta que 10 negocios lo paguen.**

Se cobra en pesos con Mercado Pago. Los montos están en `PRICE_ESENCIAL` y `PRICE_PRO`. Los valores por defecto (19.900 y 39.900) son marcadores: **ajustalos al tipo de cambio del día**, que no pude consultar.

**Camino a USD 1.000/mes** (antes de comisiones):

| Mezcla | Ingreso promedio por cliente | Clientes necesarios |
| --- | --- | --- |
| 100% Esencial | USD 15 | 67 |
| 80% Esencial, 20% Pro | USD 17,8 | 57 |
| 60% Esencial, 40% Pro | USD 20,6 | 49 |

**Cómo sube el valor de cada cliente:** paso a Pro al abrir un segundo local; plan anual con dos meses gratis (cobro por transferencia y plan manual desde el admin); placa NFC o acrílico impreso como venta única; plan para agencias que administran varios negocios.

**Cómo se quedan:** el QR impreso depende de la suscripción; el resumen semanal recuerda el valor sin que entren al panel; el buzón privado les muestra problemas que antes no veían.

## 6. Costos y márgenes

Precios de lista que conviene confirmar al contratar.

| Concepto | Costo | Nota |
| --- | --- | --- |
| Hosting (Vercel) | USD 0 al probar, ~USD 20/mes al vender | El plan gratuito no admite uso comercial |
| Base de datos (Supabase) | USD 0 al inicio, ~USD 25/mes al crecer | El plan gratuito alcanza para los primeros clientes |
| Dominio | ~USD 10–15/año | |
| Emails (Resend) | USD 0 al inicio | El nivel gratuito cubre el volumen inicial |
| IA (Claude Opus 5.5, USD 4 / 20 por millón de tokens) | ~USD 0,01–0,02 por respuesta | Tope: ~USD 0,60/mes en Esencial, ~USD 6 en Pro si agotan el cupo. Se puede bajar con `AI_MODEL` |
| Mercado Pago | una guía cita 2,99% + IVA | Depende del plazo de acreditación; confirmar en tu cuenta |

Con 57 clientes y ~USD 1.000 de ingreso: infraestructura fija ~USD 45, IA unos USD 15–30, comisiones e impuestos del cobro ~USD 40–70. **Margen bruto estimado: 85–90%**, antes de tus impuestos (monotributo o el régimen que te corresponda) y de tu tiempo.

## 7. Marketing y ventas

**Posicionamiento:** "El sistema para pedirle la reseña a cada cliente. Sin trucos que pongan en riesgo tu perfil de Google." Contra la placa: hace más que abrir un link. Contra el software caro: una décima parte del precio, en tu idioma, con WhatsApp.

### Primeros 10 clientes (sin pauta)

1. **Lista de 100 negocios** de tu ciudad en 3 rubros (empezá por barberías, estética y odontólogos), con puntaje, cantidad de reseñas y las del competidor más cercano. A mano desde Google Maps, o con Apify (tenés el conector, aunque en esta sesión no conectó).
2. **Visita en persona a 30**, en horario muerto. Llevá un cartel con QR ya impreso con el nombre de su negocio: tarda dos minutos crearlo y es la demo.
3. **WhatsApp a los otros 70** con el mensaje de abajo.
4. **Oferta fundadores:** primeros 10 clientes a mitad de precio de por vida a cambio de una charla de 15 minutos por mes. Se carga como plan manual desde el admin.
5. **Configurá vos la cuenta** de cada uno de los primeros 10. No escala, pero te muestra dónde se traban.

**Mensaje de prospección (WhatsApp):**

> Hola, ¿hablo con el dueño de [Negocio]? Soy [nombre], de acá de [ciudad]. Vi que en Google tienen [4,1] con [37] reseñas y [Competidor], a [3] cuadras, tiene [4,7] con [312]. Armé una herramienta para que cada cliente que atienden les deje su reseña con un QR y un WhatsApp. ¿Te muestro en 2 minutos cómo quedaría para [Negocio]? Los primeros 14 días son gratis.

**Seguimiento a los 3 días:** mandá el link de la calculadora con sus números: "para llegar a 4,5 les faltan [N] reseñas de 5 estrellas".

**Objeciones:**

- *"Ya tengo un QR"* → "¿Sabés cuántos lo escanearon este mes? ¿Y a los que ya se fueron, cómo se la pedís?"
- *"No tengo tiempo"* → "Te lo dejo andando yo ahora. Vos solo tocás enviar."
- *"¿Y si me ponen una mala?"* → "Pueden hacerlo hoy igual. Con esto, además, tienen la opción de decírtelo a vos primero."

### Contenido en Instagram y TikTok

No depende de viralizarse: son piezas para que el prospecto que te busca vea que sabés. Tres por semana, 30–45 segundos, grabadas con el celular.

- **Auditoría de perfil** (1 por semana): "Miré el perfil de Google de una [barbería] de [ciudad]. Tres cosas que le hacen perder clientes." Con permiso, o tapando el nombre.
- **Tutorial corto** (1 por semana): cómo encontrar tu link de reseñas; cómo responder una reseña de 1 estrella; qué frase decir en la caja para pedirla.
- **Caso real** (1 por semana, desde que haya clientes): "De 37 a 61 reseñas en 5 semanas: qué hizo esta veterinaria." Solo números reales y con permiso.

Cada video cierra con la calculadora como llamado a la acción.

### SEO

- Ya está: calculadora (`/calculadora`), preguntas frecuentes con datos estructurados, sitemap.
- Próximas páginas, una por búsqueda: "cómo conseguir reseñas en Google", "cómo responder reseñas negativas (con ejemplos)", "link de reseñas de Google: cómo encontrarlo", y una por rubro ("reseñas de Google para odontólogos").
- Cada página pública de reseñas lleva "Hecho con Lucero", visible para los clientes de tus clientes, que muchas veces son dueños de otros negocios.

### Publicidad

No al inicio. Con ~USD 15 por mes de ingreso y una retención que todavía no conocés, no se puede saber cuánto es razonable pagar por un cliente. Reevaluar cuando haya 20 clientes y tres meses de datos de cancelación.

### Canal con más potencial: socios

Community managers, agencias chicas, contadores y diseñadores web que ya atienden a 10–30 negocios. Ofreceles 30% recurrente (liquidación manual al principio). Un socio bueno vale más que 200 mensajes en frío.

## 8. Plan de 30, 60 y 90 días

**Antes de todo, validar pago (días 1–10).** No hace falta terminar nada más para esto.

- Publicar en producción y probar un cobro real con Mercado Pago.
- 30 visitas y 70 mensajes.
- **Meta: 15 pruebas activas y 3 que paguen.**
- **Criterio de corte:** si de 100 contactos salen menos de 5 pruebas, el problema es el mensaje o el rubro: cambiá de rubro y repetí una vez. Si hay pruebas pero nadie paga al día 14, hablá con cada uno antes de escribir una línea más de código.

| Período | Objetivo | Acciones |
| --- | --- | --- |
| **Días 1–30** | 10 clientes pagando (~USD 150/mes) | Venta directa en 3 rubros. Oferta fundadores. Configuración asistida. Entrevista a cada cliente. 3 videos por semana. Solicitar acceso a la API de Google Business Profile (tarda semanas). |
| **Días 31–60** | 25 clientes (~USD 400/mes) | Elegir el rubro que mejor convirtió y concentrarse ahí. Primeros 2 casos con números reales. 5 socios (agencias o community managers). 4 páginas de SEO. Activar referidos con cada cliente contento. |
| **Días 61–90** | 45–60 clientes (~USD 700–1.000/mes) | Segunda ciudad o segundo rubro con el mismo guion. Plan anual. Medir cancelación de los primeros 30 días. Decidir si conviene pauta. |

**Tres números para mirar cada lunes** (están en `/admin`): pruebas nuevas, conversión de prueba a pago, cancelaciones.

**Supuestos del embudo, a validar:** de 100 negocios contactados en persona o por WhatsApp personalizado, 10–15 prueban y 3–5 pagan. Con esos números hacen falta entre 1.200 y 1.900 contactos para llegar a 57 clientes, unos 20 por día hábil durante 90 días. Es trabajo de ventas sostenido. Los socios y referidos son la manera de bajarlo.

## 9. Hoja de ruta para escalar

1. **Sincronización con Google Business Profile**: leer reseñas nuevas, avisar por email y publicar la respuesta con un clic. Es lo que más justifica el pago mensual y un precio mayor.
2. **Plan Agencia** (USD 79–149): varios negocios, informes con marca propia.
3. **Otros países**: Uruguay, Chile, México y Colombia tienen Mercado Pago, pero cada cuenta cobra en su país. Para vender afuera hace falta una cuenta local o un cobrador internacional (Paddle, Lemon Squeezy, dLocal). No pude confirmar cuáles pagan a Argentina hoy.
4. **Widget de reseñas** para el sitio web del negocio.
5. **Envío automático** al cerrar una venta, integrando con sistemas de turnos o de caja.

De USD 1.000 a 3.000: el mismo producto con 150–170 clientes, o 60 clientes más 10 agencias. De 3.000 a 5.000 hace falta el punto 1 y un segundo país.

---

## Fuentes

- [Swydo: plataformas de gestión de reseñas con precios](https://www.swydo.com/blog/best-review-management-software-platforms/)
- [Costbench: precios de gestión de reseñas 2026](https://costbench.com/software/review-management/)
- [LocalImpact: herramientas de reseñas](https://localimpact.com/blog/review-management-tools)
- [ReviewLoop](https://www.reviewloop.es/) · [The Reviewers](https://thereviewers.pro/) · [StarTap](https://startap.net.ar/) · [Linkeados, kit de QR](https://linkeados.com.ar/product/kit-google/) · [RevuQR](https://revuqr.com/)
- [EmbedSocial: software de gestión de reseñas](https://embedsocial.com/es/blog/mejor-software-gestion-resenas-online/) · [The Stacc](https://thestacc.com/es/mejor/software-de-gestion-de-resenas/)
- [Podium: review gating y la política de Google](https://www.podium.com/article/review-gating) · [Synup](https://synpost.synup.com/what-is-review-gating/) · [SocialPilot](https://www.socialpilot.co/reviews/blogs/review-gating)
- [BrightLocal: Local Consumer Review Survey](https://www.brightlocal.com/research/local-consumer-review-survey/) · [resumen de PinMeTo](https://www.pinmeto.com/news/brightlocal-local-consumer-review-survey-2026/)
- [Develop Argentina: software para clínicas](https://developargentina.com/blog/software-clinicas-consultorios-argentina-2026) · [Pedí Tu Turno en Capterra](https://www.capterra.es/software/1113334/Pedi-Tu-Turno) · [AgendaPro](https://agendapro.com/ar/negocios)
- [Guía de Software: Stripe vs Mercado Pago](https://www.guiadesoftware.com/blog/stripe-vs-mercado-pago) · [pasarelas de pago en Argentina](https://www.guiadesoftware.com/blog/mejor-pasarela-pago-argentina)
- [Mercado Pago: crear suscripción](https://www.mercadopago.com.ar/developers/es/reference/online-payments/subscriptions/create-preapproval/post) · [notificaciones](https://www.mercadopago.com.ar/developers/en/docs/checkout-api-v2/notifications)
- [Jaguar Sheet: Nubimetrics vs Real Trends](https://jaguarsheet.com/es/comparar/nubimetrics-vs-real-trends)
