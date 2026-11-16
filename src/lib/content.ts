/** Contenido de las páginas por rubro (/para/...) y de las guías (/guias/...). */

export type Niche = {
  slug: string;
  name: string; // "restaurantes y cafeterías"
  title: string;
  intro: string;
  pains: { t: string; d: string }[];
  qrSpots: string[];
  whatsapp: string;
  askLine: string;
  faq: { q: string; a: string }[];
};

export const NICHES: Niche[] = [
  {
    slug: "restaurantes-y-cafeterias",
    name: "restaurantes y cafeterías",
    title: "Más reseñas en Google para tu restaurante o cafetería",
    intro:
      "Quien busca dónde comer mira las estrellas y cuántas reseñas tenés antes de mirar la carta. Lucero pone un QR en cada mesa para que el cliente que comió bien lo diga en Google antes de irse.",
    pains: [
      { t: "La mesa contenta se va en silencio", d: "El que esperó de más lo escribe esa misma noche. Los otros cuarenta cubiertos del turno no dicen nada." },
      { t: "No sabés qué mozo o qué sector funciona", d: "Con un QR por mesa o por mozo ves quién consigue reseñas y dónde se traba el servicio." },
      { t: "Te enterás tarde de los problemas", d: "Con el buzón privado, el cliente puede avisarte a vos en el momento, cuando todavía podés resolverlo." },
    ],
    qrSpots: ["En cada mesa, con su propio QR", "Junto a la cuenta o el posnet", "En la bolsa del take away y el delivery", "En la puerta, a la salida"],
    whatsapp: "¡Hola {nombre}! Gracias por venir a {negocio} 🙌 ¿Nos contás cómo estuvo todo? Te lleva 30 segundos: {link}",
    askLine: "“Si la pasaron bien, ¿nos dejan su opinión acá? Nos ayuda un montón.”",
    faq: [
      { q: "¿Puedo tener un QR distinto por mesa?", a: "Sí. Creás un QR por mesa, sector o mozo y cada uno tiene sus propios números de escaneos y clics a Google." },
      { q: "¿Sirve para delivery?", a: "Sí. Imprimís el QR en un sticker o tarjeta para la bolsa, o le mandás el pedido de reseña por WhatsApp al cliente." },
      { q: "¿Puedo regalar un postre a cambio de la reseña?", a: "No conviene: Google prohíbe dar premios o descuentos a cambio de reseñas y puede borrarlas. Lo que funciona es pedirla en el momento justo y que sea fácil." },
    ],
  },
  {
    slug: "peluquerias-y-barberias",
    name: "peluquerías y barberías",
    title: "Más reseñas en Google para tu peluquería o barbería",
    intro:
      "Un cliente nuevo elige peluquero mirando fotos y reseñas. Lucero hace que cada persona que sale conforme de tu silla te deje la suya, con un QR en el espejo y un WhatsApp con un toque.",
    pains: [
      { t: "Tus clientes fieles nunca te reseñaron", d: "Vienen hace años y te recomiendan de palabra, pero en Google no figuran. Son los primeros a los que conviene pedirles." },
      { t: "Cada profesional tiene sus clientes", d: "Con un QR por silla o por profesional ves quién suma más reseñas al local." },
      { t: "La competencia abrió hace poco y ya te pasó", d: "No es que trabajen mejor: se la piden a todos. Con un sistema, los alcanzás." },
    ],
    qrSpots: ["En el espejo de cada silla", "En la caja, al cobrar", "En la tarjeta del próximo turno", "En el mensaje de confirmación del turno"],
    whatsapp: "¡Hola {nombre}! Gracias por venir a {negocio} ✂️ ¿Nos contás cómo quedaste? Te lleva 30 segundos: {link}",
    askLine: "“¿Te gustó cómo quedó? Si me dejás tu opinión acá me das una mano enorme.”",
    faq: [
      { q: "¿Puedo saber qué profesional consigue más reseñas?", a: "Sí. Creás un QR por profesional y ves los escaneos y los clics a Google de cada uno." },
      { q: "¿Tengo que cambiar mi sistema de turnos?", a: "No. Lucero funciona aparte: cargás el nombre y el teléfono del cliente, o pegás la lista del día, y mandás los pedidos por WhatsApp." },
      { q: "¿Y si alguien no quedó conforme?", a: "Puede publicar en Google igual, como siempre. Pero también tiene la opción de escribirte en privado, y muchas veces eso alcanza para resolverlo." },
    ],
  },
  {
    slug: "centros-de-estetica",
    name: "centros de estética",
    title: "Más reseñas en Google para tu centro de estética",
    intro:
      "En estética nadie se atiende sin antes leer opiniones. Lucero te ayuda a que tus clientas conformes las dejen en Google, y a enterarte primero cuando algo no salió como esperaban.",
    pains: [
      { t: "La confianza se decide antes de la primera consulta", d: "Pocas reseñas o reseñas viejas hacen dudar. Las recientes son las que convencen." },
      { t: "Los resultados se ven días después", d: "Por eso el pedido por WhatsApp funciona mejor que el cartel: lo mandás cuando el resultado ya se nota." },
      { t: "Un mal comentario pesa mucho", d: "El buzón privado le da a la clienta una forma de decírtelo a vos, y a vos la chance de solucionarlo." },
    ],
    qrSpots: ["En la recepción", "En cada gabinete", "En la tarjeta de cuidados posteriores", "Por WhatsApp, unos días después del tratamiento"],
    whatsapp: "¡Hola {nombre}! ¿Cómo te sentís después de tu sesión en {negocio}? 🌿 Si tenés 30 segundos, contanos acá: {link}",
    askLine: "“Cuando veas el resultado, ¿me contás qué te pareció? Te mando el link por WhatsApp.”",
    faq: [
      { q: "¿Puedo mandar el pedido días después del tratamiento?", a: "Sí. Cargás a la clienta y enviás el WhatsApp cuando quieras; ves si lo abrió, si calificó y si fue a Google." },
      { q: "¿Las respuestas con IA sirven para temas delicados?", a: "Te dan un borrador con el tono de tu centro, sin inventar promesas ni datos médicos. Siempre lo leés y lo ajustás antes de publicar." },
      { q: "¿Qué pasa con los datos de mis clientas?", a: "Solo guardamos el nombre y el teléfono que cargás para armar el mensaje. No los vendemos ni los usamos para publicidad." },
    ],
  },
  {
    slug: "odontologos-y-consultorios",
    name: "odontólogos y consultorios",
    title: "Más reseñas en Google para tu consultorio",
    intro:
      "Un paciente nuevo compara consultorios en Google Maps antes de llamar. Lucero hace que tus pacientes conformes dejen su opinión, de forma simple y sin exponer nada de su atención.",
    pains: [
      { t: "Los pacientes de años no figuran en Google", d: "Te recomiendan en persona, pero quien busca por primera vez solo ve estrellas y cantidad." },
      { t: "No hay un momento natural para pedirla", d: "Con el QR en recepción y el WhatsApp después de la consulta, el pedido deja de depender de que alguien se acuerde." },
      { t: "Una mala reseña queda años", d: "Responderla bien importa tanto como evitarla. La IA te arma un borrador profesional para cada una." },
    ],
    qrSpots: ["En el mostrador de recepción", "En la sala de espera", "En la tarjeta del próximo turno", "Por WhatsApp, después de la consulta"],
    whatsapp: "Hola {nombre}, gracias por atenderte en {negocio}. Si tenés 30 segundos, tu opinión nos ayuda a que otros pacientes nos encuentren: {link}",
    askLine: "“Si quedó conforme con la atención, nos ayuda mucho que lo cuente acá.”",
    faq: [
      { q: "¿Es correcto pedirle reseñas a un paciente?", a: "Pedirlas a todos por igual, sin premios y sin presionar, es lo que permite Google. Al responder, nunca confirmes ni des detalles de la atención de nadie." },
      { q: "¿La IA puede revelar datos del paciente?", a: "No tiene acceso a ningún dato clínico: solo ve el texto de la reseña que pegás. Aun así, revisá siempre la respuesta antes de publicarla." },
      { q: "¿Sirve para varios consultorios o profesionales?", a: "Sí. Un QR por profesional dentro del mismo local, o el plan Pro para manejar hasta 3 sedes." },
    ],
  },
];

export type Guide = {
  slug: string;
  title: string;
  description: string;
  minutes: number;
  intro: string;
  sections: { h: string; p?: string[]; list?: string[]; ordered?: boolean; quote?: string }[];
};

export const GUIDES: Guide[] = [
  {
    slug: "como-conseguir-resenas-en-google",
    title: "Cómo conseguir más reseñas en Google para tu negocio (sin comprarlas)",
    description:
      "Qué hacer, paso a paso, para que tus clientes dejen reseñas en Google: cuándo pedirlas, con qué frase, por qué canal y qué no hacer para no arriesgar tu perfil.",
    minutes: 6,
    intro:
      "La mayoría de los negocios tiene pocas reseñas por una sola razón: no las pide. El cliente conforme no piensa en Google al irse. Estas son las cosas que de verdad mueven la aguja, ordenadas de más a menos efecto.",
    sections: [
      {
        h: "1. Pedila en voz alta, en el momento justo",
        p: [
          "El mejor momento es cuando el cliente acaba de decirte que quedó conforme: al cobrar, al entregar el trabajo, al despedirlo. Un cartel solo consigue poco; un cartel más una persona que lo señala consigue mucho más.",
        ],
        quote: "“Si te gustó, ¿nos dejás tu opinión acá? Son 30 segundos y nos ayuda un montón.”",
      },
      {
        h: "2. Que sean dos toques, no diez",
        p: ["Cada paso extra hace que alguien abandone. El camino ideal:"],
        list: [
          "Un QR que abre directo la pantalla de reseñas, sin tener que buscar el negocio.",
          "Un link corto por WhatsApp para quien ya se fue.",
          "Nada de pedirle que se registre o complete datos antes.",
        ],
      },
      {
        h: "3. Escribile por WhatsApp al que ya se fue",
        p: [
          "La mayoría de tus clientes de esta semana ya no está en el local. Un mensaje corto, con su nombre y el link, enviado el mismo día o al siguiente, es el canal que más responde. Mandalo desde tu propio número, uno por uno: es más personal y no arriesgás que WhatsApp te bloquee.",
        ],
      },
      {
        h: "4. Pedísela a todos, no solo a los contentos",
        p: [
          "Google prohíbe elegir a quién pedirle según si quedó conforme, y también ocultarle la opción de reseñar a quien tuvo una mala experiencia. Puede borrar reseñas o restringir tu perfil. Además, un perfil con solo cinco estrellas genera desconfianza: unas pocas críticas bien respondidas lo hacen más creíble.",
        ],
      },
      {
        h: "5. Empezá por los que ya te quieren",
        p: [
          "Tus clientes de años nunca te reseñaron porque nunca se lo pediste. Hacé una lista de 20 y escribiles esta semana. Es la forma más rápida de sumar reseñas reales.",
        ],
      },
      {
        h: "6. Respondé todas",
        p: [
          "Quien ve que el dueño contesta, se anima a escribir. Agradecé las buenas mencionando algo concreto, y contestá las malas con calma. Las respuestas las leen sobre todo tus futuros clientes.",
        ],
      },
      {
        h: "Lo que no tenés que hacer",
        list: [
          "Comprar reseñas o pedirle a amigos que nunca fueron clientes.",
          "Dar descuentos, sorteos o regalos a cambio de una reseña.",
          "Escribir reseñas vos mismo o desde el wifi del local con cuentas de empleados.",
          "Pedir que borren o cambien una reseña a cambio de algo.",
        ],
        p: ["Todo eso va contra las políticas de Google y, si lo detecta, perdés más de lo que ganaste."],
      },
      {
        h: "Cuántas necesitás",
        p: [
          "Depende de tu punto de partida. Con nuestra calculadora gratuita ves cuántas reseñas de 5 estrellas te separan del puntaje que querés.",
        ],
      },
    ],
  },
  {
    slug: "como-responder-resenas-negativas",
    title: "Cómo responder reseñas negativas en Google (con ejemplos)",
    description:
      "Una fórmula simple para responder reseñas negativas sin empeorarlas, con ejemplos para copiar y los errores que más clientes hacen perder.",
    minutes: 5,
    intro:
      "Una reseña negativa no la podés borrar, pero sí decidir qué ve la próxima persona que la lea. Tu respuesta no es para quien se quejó: es para los cientos que van a leerla después.",
    sections: [
      {
        h: "Antes de escribir: esperá una hora",
        p: ["La primera respuesta que se te ocurre suele ser defensiva. Leela, andá a hacer otra cosa y volvé. Contestá dentro de las 24 o 48 horas, pero no en caliente."],
      },
      {
        h: "La fórmula de 4 pasos",
        ordered: true,
        list: [
          "Agradecé que se haya tomado el tiempo de contarlo.",
          "Reconocé el problema con sus palabras, sin discutir su versión.",
          "Contá qué hiciste o qué vas a hacer al respecto, si corresponde.",
          "Invitá a seguir la conversación por privado, con un contacto concreto.",
        ],
        p: ["Tres o cuatro oraciones alcanzan. Cuanto más larga la respuesta, más parece una pelea."],
      },
      {
        h: "Ejemplo: demora en la atención",
        quote:
          "“Hola Mariana, gracias por contarlo. Tenés razón: 40 minutos de espera con turno no es lo que queremos ofrecer. Ese día tuvimos una baja en el equipo y no avisamos como debíamos. Ya cambiamos la forma de confirmar los turnos. Si querés, escribinos al 11 5555-1234 y coordinamos tu próxima visita con prioridad.”",
      },
      {
        h: "Ejemplo: no estás de acuerdo con lo que dice",
        quote:
          "“Hola Jorge, lamentamos que te hayas ido con esa impresión. No es la experiencia que buscamos dar y nos gustaría entender mejor qué pasó. ¿Nos escribís a hola@tunegocio.com? Queremos revisarlo con vos.”",
        p: ["No hace falta darle la razón ni desmentirlo en público. Mostrás disposición y llevás el detalle a otro canal."],
      },
      {
        h: "Ejemplo: reseña sin texto, solo una estrella",
        quote: "“Hola, vimos tu calificación y nos gustaría saber qué pasó para poder mejorar. Si querés contarnos, estamos en el 11 5555-1234. Gracias.”",
      },
      {
        h: "Errores que cuestan clientes",
        list: [
          "Discutir punto por punto o tratar al cliente de mentiroso.",
          "Revelar datos personales, de la compra o, en salud, de la atención.",
          "Copiar y pegar la misma respuesta en todas.",
          "Ofrecer algo a cambio de que la borre o la cambie.",
          "No contestar: el silencio se lee como que no te importa.",
        ],
      },
      {
        h: "Si la reseña es falsa o es de otro negocio",
        p: [
          "Desde tu perfil de Google podés denunciarla como contenido que incumple las políticas. Mientras se resuelve, respondé igual, con calma: “No encontramos registro de tu visita; escribinos para poder ayudarte”. Quien lea va a entender.",
        ],
      },
      {
        h: "Después de responder",
        p: [
          "Si resolvés el problema, muchas personas actualizan su reseña por su cuenta. No se lo exijas. Y seguí pidiendo reseñas a todos tus clientes: la mejor forma de que una crítica pese menos es que quede rodeada de opiniones recientes.",
        ],
      },
    ],
  },
  {
    slug: "link-de-resenas-de-google",
    title: "Link de reseñas de Google: cómo encontrarlo y compartirlo",
    description:
      "Dónde está el link directo para que tus clientes dejen una reseña en Google, cómo copiarlo desde la compu o el celular y las mejores formas de compartirlo.",
    minutes: 3,
    intro:
      "El link de reseñas lleva a tu cliente directo a la pantalla de las estrellas, sin que tenga que buscar tu negocio. Es lo primero que necesitás para pedir reseñas en serio.",
    sections: [
      {
        h: "Cómo encontrarlo",
        ordered: true,
        list: [
          "Iniciá sesión en Google con la cuenta que administra tu negocio.",
          "Buscá el nombre de tu negocio en Google, o abrí la app de Google Maps y tocá tu perfil de empresa.",
          "En el panel de tu perfil, tocá “Pedir reseñas” (puede aparecer como “Conseguir más reseñas” o dentro de “Leer reseñas”).",
          "Copiá el link que te muestra. Suele empezar con https://g.page/r/ y terminar en /review.",
        ],
      },
      {
        h: "Si no ves esa opción",
        list: [
          "Revisá que estés con la cuenta dueña o administradora del perfil.",
          "Verificá que el perfil esté verificado: sin verificar, Google no muestra el link.",
          "Si tu negocio todavía no tiene perfil, crealo gratis en google.com/business.",
        ],
      },
      {
        h: "Cómo compartirlo",
        list: [
          "En un QR impreso donde el cliente paga o espera.",
          "Por WhatsApp, con el nombre del cliente y una frase corta.",
          "En la firma de tus emails y en la bio de Instagram.",
          "En tickets, bolsas, tarjetas y presupuestos.",
        ],
      },
      {
        h: "Por qué no alcanza con el link solo",
        p: [
          "El link no te dice cuántos lo abrieron, por dónde llegaron ni quién se quedó a mitad de camino. Y si un cliente tuvo un problema, no tiene otra opción que publicarlo.",
          "Con Lucero pegás ese mismo link una sola vez y obtenés QR con estadísticas, pedidos por WhatsApp con seguimiento y un buzón privado, sin dejar de darle a todos la opción de publicar en Google.",
        ],
      },
    ],
  },
];
