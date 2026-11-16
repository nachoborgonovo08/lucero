import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";
import { GUIDES, NICHES } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/calculadora",
    "/guias",
    ...GUIDES.map((g) => `/guias/${g.slug}`),
    ...NICHES.map((n) => `/para/${n.slug}`),
    "/registro",
    "/terminos",
    "/privacidad",
  ].map((p) => ({ url: APP_URL + p }));
}
