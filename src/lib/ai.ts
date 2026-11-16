import Anthropic from "@anthropic-ai/sdk";

export const aiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY);

const MODEL = process.env.AI_MODEL || "claude-opus-5-5";

const TONE_GUIDE: Record<string, string> = {
  cercano: "cálido y cercano, como el dueño hablándole a un vecino",
  profesional: "profesional y sobrio, sin exclamaciones de más",
  divertido: "descontracturado y con algo de humor, sin pasarse",
};

const SYSTEM = `Escribís respuestas públicas a reseñas de Google en nombre del dueño de un negocio local.

La respuesta la van a leer dos públicos: quien dejó la reseña y, sobre todo, los futuros clientes que comparan negocios en Google Maps. Por eso tiene que sonar a una persona real del negocio, no a un comunicado.

Cómo escribir:
- En español, con el voseo o tuteo que use la reseña; si no se nota, español rioplatense neutro.
- Breve: entre 2 y 4 oraciones. Mencioná algo concreto de lo que dijo la persona para que no parezca una plantilla.
- Si la reseña es positiva: agradecé y sumá un detalle propio del negocio o una invitación a volver.
- Si es negativa o mixta: reconocé el problema sin ponerte a la defensiva, pedí disculpas si corresponde, y ofrecé seguir la conversación por privado. No discutas ni cuestiones la versión del cliente.
- No inventes hechos, promociones, nombres del personal ni compensaciones que el negocio no mencionó.
- No ofrezcas nada a cambio de modificar o borrar la reseña.
- Sin hashtags y, como mucho, un emoji.

Devolvé únicamente el texto de la respuesta, listo para pegar en Google.`;

export class AiError extends Error {}

export async function generateReply(input: {
  business: string;
  category: string | null;
  tone: string;
  reviewer: string | null;
  rating: number;
  review: string;
}): Promise<string> {
  const client = new Anthropic({ timeout: 60_000 });
  const user = [
    `Negocio: ${input.business}${input.category ? ` (${input.category})` : ""}`,
    `Tono deseado: ${TONE_GUIDE[input.tone] ?? TONE_GUIDE.cercano}`,
    `Calificación: ${input.rating} de 5 estrellas`,
    `Autor de la reseña: ${input.reviewer || "no indicado"}`,
    "",
    "Reseña:",
    input.review || "(sin texto, solo dejó las estrellas)",
  ].join("\n");

  try {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: SYSTEM,
      messages: [{ role: "user", content: user }],
    });
    if (res.stop_reason === "refusal") {
      throw new AiError("No pudimos generar una respuesta para esta reseña. Probá reformulándola.");
    }
    const text = res.content
      .flatMap((b) => (b.type === "text" ? [b.text] : []))
      .join("")
      .trim();
    if (!text) throw new AiError("La IA devolvió una respuesta vacía. Probá de nuevo.");
    return text;
  } catch (err) {
    if (err instanceof AiError) throw err;
    if (err instanceof Anthropic.RateLimitError) {
      throw new AiError("Hay mucha demanda en este momento. Probá de nuevo en un minuto.");
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("[ai] credencial inválida");
      throw new AiError("El servicio de IA no está bien configurado. Avisanos por soporte.");
    }
    if (err instanceof Anthropic.APIError) {
      console.error("[ai] error de API", err.status, err.message);
      throw new AiError("No pudimos generar la respuesta. Probá de nuevo.");
    }
    throw err;
  }
}
