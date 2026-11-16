/**
 * Normaliza un teléfono al formato que espera wa.me (solo dígitos, con código de país).
 * Devuelve null si no parece un número válido.
 */
export function normalizePhone(raw: string, countryCode = "54"): string | null {
  const intl = raw.trim().startsWith("+") || raw.trim().startsWith("00");
  let d = raw.replace(/\D/g, "").replace(/^00/, "");
  if (!d) return null;

  if (!intl) {
    if (d.startsWith(countryCode) && d.length > 10) {
      // ya trae el código de país, sin "+"
    } else {
      d = countryCode + d.replace(/^0+/, "");
    }
  }

  // Argentina: los celulares en WhatsApp llevan 9 después del 54 y no llevan el "15".
  if (d.startsWith("54")) {
    let rest = d.slice(2).replace(/^0+/, "");
    if (rest.startsWith("9")) rest = rest.slice(1);
    if (rest.length === 12) {
      // código de área (2 a 4 dígitos) + 15 + número: quitar el 15
      for (const area of [2, 3, 4]) {
        if (rest.slice(area, area + 2) === "15") {
          rest = rest.slice(0, area) + rest.slice(area + 2);
          break;
        }
      }
    }
    if (rest.length !== 10) return null;
    return "549" + rest;
  }

  return d.length >= 8 && d.length <= 15 ? d : null;
}

export function waLink(phone: string, text: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function fillTemplate(tpl: string, vars: { nombre: string; negocio: string; link: string }) {
  return tpl
    .replaceAll("{nombre}", vars.nombre.split(" ")[0])
    .replaceAll("{negocio}", vars.negocio)
    .replaceAll("{link}", vars.link);
}
