import QRCode from "qrcode";
import { publicUrl } from "@/lib/business";
import { sql } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [biz] = await sql`select 1 from businesses where slug = ${slug}`;
  if (!biz) return new Response("No encontrado", { status: 404 });

  const target = `${publicUrl(slug)}?s=qr`;
  const png = new URL(req.url).searchParams.get("format") === "png";
  const opts = { errorCorrectionLevel: "M" as const, margin: 2, color: { dark: "#14171f", light: "#ffffff" } };
  if (png) {
    const buf = await QRCode.toBuffer(target, { ...opts, width: 1200 });
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="qr-${slug}.png"` },
    });
  }
  return new Response(await QRCode.toString(target, { ...opts, type: "svg" }), {
    headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=3600" },
  });
}
