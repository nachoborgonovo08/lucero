import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const dir = process.argv[2], only = process.argv[3];
mkdirSync(`${dir}/frames`, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
await p.goto(`file://${dir}/promo.html`);
await p.evaluate(() => document.fonts.ready);
if (only) {
  for (const s of only.split(",")) { await p.evaluate((ms) => seek(ms), s * 1000); await p.screenshot({ path: `${dir}/check-${s}.png` }); }
} else {
  const FPS = 30, N = 27 * FPS;
  for (let i = 0; i < N; i++) {
    await p.evaluate((ms) => seek(ms), (i * 1000) / FPS);
    await p.screenshot({ path: `${dir}/frames/f${String(i).padStart(4, "0")}.jpg`, type: "jpeg", quality: 92 });
  }
}
await b.close();
