# Cómo vender Lucero: guía práctica

El video ayuda, pero no vende solo. Los primeros clientes de un producto así salen de hablar con dueños de negocios, uno por uno. Este es el orden.

## Paso 0: tenerlo publicado (1 tarde)

Hoy no se puede vender porque no hay un link donde registrarse ni cobrar. Seguí la sección "Puesta en producción" del `README.md`: Supabase, Vercel, Mercado Pago, dominio. Hacé un cobro de prueba con tu propia tarjeta antes de mostrárselo a nadie.

## Paso 1: armá tu lista (1 hora)

Abrí Google Maps en tu ciudad y buscá **barberías, estéticas y odontólogos**. Anotá 50 en una planilla:

| Negocio | WhatsApp | Puntaje | Cant. de reseñas | Competidor cercano con más reseñas |
| --- | --- | --- | --- | --- |

Elegí los que tienen **menos de 100 reseñas o menos de 4,5** y un competidor cerca que los supera. Esos sienten el problema.

## Paso 2: andá en persona a 10 (2 tardes)

Es lo que mejor convierte. Antes de entrar, creá una cuenta con el nombre de ese negocio e imprimí el cartel con QR. Entrás con el cartel en la mano.

> "Hola, ¿está el dueño? Soy [nombre], vivo acá en [barrio]. Les traje esto de regalo: es un cartel para que sus clientes les dejen reseñas en Google. Vi que tienen [37] y [Competidor] tiene [312]. ¿Te muestro cómo funciona? Son dos minutos."

Mostrale en su celular: escanea el QR, toca las estrellas, llega a Google. Después mostrale la pantalla de pedidos por WhatsApp.

Cierre: "Te lo dejo andando ahora, gratis 14 días. Si te sirve, después son [precio] por mes. ¿A qué mail te lo registro?"

## Paso 3: WhatsApp a los otros 40

**Primer mensaje:**

> Hola, ¿hablo con el dueño de [Negocio]? Soy [nombre], de acá de [ciudad]. Vi que en Google tienen [4,1] con [37] reseñas y [Competidor], a [3] cuadras, tiene [4,7] con [312]. Armé una herramienta para que cada cliente que atienden les deje su reseña, con un QR y un WhatsApp. ¿Te muestro en 2 minutos cómo quedaría para [Negocio]?

**Si no contesta, a los 3 días** (mandá el video):

> Te dejo un video de 30 segundos que lo muestra mejor que yo. Hice la cuenta: para llegar a 4,5 les faltan [N] reseñas de 5 estrellas. Si querés te lo dejo andando gratis 14 días.

El número [N] sale de la calculadora del sitio (`/calculadora`).

**Si dice "ya tengo un QR":**

> ¡Buenísimo! ¿Sabés cuántos lo escanearon este mes? Con esto ves eso, y además les escribís por WhatsApp a los que ya se fueron, que son la mayoría.

**Si dice "es caro" o duda:**

> Te entiendo. Probalo los 14 días sin poner tarjeta. Si no te entra ninguna reseña nueva, no pagás nada y listo.

## Paso 4: oferta para los primeros 10

"Precio fundador": mitad de precio para siempre a cambio de que te cuenten cómo les va una vez por mes. Se carga desde `/admin` como plan manual, cobrando por transferencia, o con un monto menor en Mercado Pago.

Cuando un cliente te diga que le llegaron reseñas, pedile dos cosas: una captura con los números (con permiso para mostrarla) y el contacto de otro negocio. Ese caso real vale más que cualquier video.

## Qué esperar

Son supuestos míos, no datos: de 50 contactos bien hechos, entre 5 y 8 prueban y 2 o 3 pagan. Si después de 50 contactos nadie prueba, cambiá el rubro o el mensaje antes de seguir. Si prueban y no pagan, llamalos y preguntá por qué.

---

# El video

`lucero-promo-vertical.mp4`: 27 segundos, vertical 1080×1920, para Reels, TikTok, Shorts y estados de WhatsApp. Se entiende sin sonido. **No tiene audio**: sumale música desde la propia app al publicar (así usás audio con licencia) o grabá la locución de abajo.

Todas las pantallas son del producto real. El tablero tiene datos de ejemplo y lo dice en pantalla. Cuando tengas un cliente con números reales, reemplazá esa escena.

## Locución (27 segundos, grabala vos con el celular)

Tu voz genera más confianza que una voz generada, sobre todo vendiendo a negocios de tu ciudad.

| Segundo | Texto |
| --- | --- |
| 0–3 | Tus clientes contentos casi nunca te dejan una reseña. |
| 3–6 | Y el que tuvo un mal día, sí. |
| 6–9 | Con Lucero, se la pedís a todos. |
| 9–12 | Ponés un QR en el mostrador. |
| 12–16 | Y a los que ya se fueron, les mandás un WhatsApp con un toque. |
| 16–19 | Tu cliente opina en treinta segundos. |
| 19–23 | Y vos ves quién fue a Google a dejarte la reseña. |
| 23–27 | Probalo gratis catorce días. Sin tarjeta. |

## Texto para publicar

> ¿Cuántas reseñas tiene tu negocio en Google? ¿Y el de la otra cuadra? 👀
>
> El cliente contento se va sin decir nada. Lucero hace que te deje su reseña: un QR en el mostrador y un WhatsApp con un toque.
>
> 14 días gratis, sin tarjeta. Link en la bio.
>
> #reseñasgoogle #negocioslocales #googlemaps #emprendedores #pymes

## Tres videos más para grabar vos (sin editar casi nada)

**1. La comparación (15 s).** Grabá la pantalla de Google Maps buscando un rubro en tu ciudad. Texto en pantalla: "¿A cuál llamarías?" mostrando uno con 4,8 y 300 reseñas y otro con 4,1 y 30. Cierre: "Tus clientes hacen esto mismo. Te muestro cómo subir."

**2. La frase (20 s).** Vos a cámara: "La frase que más reseñas consigue en un negocio es esta: 'si te gustó, ¿nos dejás tu opinión acá?', señalando el QR al cobrar. El cartel solo no alcanza. Hay que pedirla."

**3. La demo (30 s).** Grabá tu celular escaneando un QR de Lucero impreso, tocando las estrellas y llegando a Google. Sin cortes. "Así de fácil es para tu cliente."

## Para regenerar o cambiar el video

`promo.html` es la animación y `render.mjs` la convierte en fotogramas. Cambiás textos o imágenes en el HTML, corrés `node render.mjs <carpeta>` y unís los fotogramas con ffmpeg.
