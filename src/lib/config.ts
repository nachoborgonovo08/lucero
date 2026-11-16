export const BRAND = "Lucero";
export const TAGLINE = "Más reseñas en Google para tu negocio";

export const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const TRIAL_DAYS = 14;
export const REFERRED_TRIAL_DAYS = 30;
export const REFERRAL_REWARD_DAYS = 30;

export type PlanId = "esencial" | "pro" | "agencia";
export const PLAN_IDS = ["esencial", "pro", "agencia"] as const;
export type PlanState = "trial" | PlanId;

export const CURRENCY = process.env.CURRENCY ?? "ARS";

type PlanDef = {
  id: PlanId;
  name: string;
  price: number;
  maxBusinesses: number;
  qrPerBusiness: number;
  requestsPerMonth: number;
  aiRepliesPerMonth: number;
  features: string[];
};

export const PLANS: Record<PlanId, PlanDef> = {
  esencial: {
    id: "esencial",
    name: "Esencial",
    price: Number(process.env.PRICE_ESENCIAL ?? 19900),
    maxBusinesses: 1,
    qrPerBusiness: 5,
    requestsPerMonth: 150,
    aiRepliesPerMonth: 30,
    features: [
      "1 local",
      "Hasta 5 QR con estadísticas propias (mesas, caja, empleados)",
      "Página de reseñas + QR listo para imprimir",
      "150 pedidos por WhatsApp al mes",
      "Buzón de comentarios privados",
      "30 respuestas con IA al mes",
      "Estadísticas y resumen semanal por email",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: Number(process.env.PRICE_PRO ?? 39900),
    maxBusinesses: 3,
    qrPerBusiness: 30,
    requestsPerMonth: 1000,
    aiRepliesPerMonth: 300,
    features: [
      "Hasta 3 locales",
      "Todo lo del plan Esencial",
      "Hasta 30 QR por local",
      "1.000 pedidos por WhatsApp al mes",
      "300 respuestas con IA al mes",
      "Soporte prioritario por WhatsApp",
    ],
  },
  agencia: {
    id: "agencia",
    name: "Agencia",
    price: Number(process.env.PRICE_AGENCIA ?? 129900),
    maxBusinesses: 25,
    qrPerBusiness: 30,
    requestsPerMonth: 5000,
    aiRepliesPerMonth: 1000,
    features: [
      "Hasta 25 negocios en una sola cuenta",
      "Vista general con los números de todos tus clientes",
      "Todo lo del plan Pro en cada negocio",
      "5.000 pedidos por WhatsApp al mes",
      "1.000 usos de IA al mes",
    ],
  },
};

// Durante la prueba gratis se aplican los límites del plan Esencial,
// salvo las respuestas con IA (10) para acotar el costo por cuenta sin pagar.
export function limitsFor(plan: PlanState) {
  if (plan === "trial") return { ...PLANS.esencial, aiRepliesPerMonth: 10 };
  return PLANS[plan];
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const COUNTRY_CODES = [
  { code: "54", label: "Argentina (+54)" },
  { code: "598", label: "Uruguay (+598)" },
  { code: "56", label: "Chile (+56)" },
  { code: "595", label: "Paraguay (+595)" },
  { code: "52", label: "México (+52)" },
  { code: "57", label: "Colombia (+57)" },
  { code: "51", label: "Perú (+51)" },
  { code: "34", label: "España (+34)" },
];

export const TONES = [
  { id: "cercano", label: "Cercano y cálido" },
  { id: "profesional", label: "Profesional y sobrio" },
  { id: "divertido", label: "Descontracturado" },
];

export const DEFAULT_WHATSAPP_TEMPLATE =
  "¡Hola {nombre}! Gracias por elegir {negocio} 🙌 ¿Nos contás cómo te fue? Te lleva 30 segundos y nos ayuda un montón: {link}";

/** Mínimo de comentarios privados para que el análisis con IA tenga sentido. */
export const MIN_FEEDBACK_FOR_INSIGHTS = 5;
