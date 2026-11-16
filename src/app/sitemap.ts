import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/calculadora", "/registro", "/terminos", "/privacidad"].map((p) => ({ url: APP_URL + p }));
}
