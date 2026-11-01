/**
 * Renders the PDF Robin brand assets into public/: favicon, PWA icons and the
 * Open Graph image.
 *
 * The geometry is duplicated from src/components/BrandLogo.tsx on purpose —
 * the component needs theme-driven CSS variables, these files need literal
 * hex, and neither can read the other. Change one, change both.
 *
 * Playwright is not a saved dependency (see CLAUDE.md):
  *   npm i -D playwright png-to-ico --no-save && node scripts/brand-assets.mjs
 */
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import pngToIco from "png-to-ico";

const NAVY = "#16294A";
const NAVY_SOFT = "#1E3A63";
const ORANGE = "#F4511E";

/** The robin and the page it is holding, on a 128x128 grid. */
const bird = ({ doc = true } = {}) => `
<ellipse cx="54" cy="112" rx="28" ry="4.2" fill="#CBD5E1" opacity=".5"/>
<g stroke="${NAVY}" stroke-width="3.4" stroke-linecap="round" fill="none">
  <path d="M48 95 V107"/><path d="M60 95 V107"/><path d="M42 108 H54"/><path d="M54 108 H66"/>
</g>
<path d="M30 66 C21 77 12 86 5 93 C12 97 24 95 36 89 Z" fill="${NAVY}"/>
<path d="M25 58 C25 32 42 15 62 15 C83 15 96 33 96 56 C96 79 81 99 59 99 C39 99 25 82 25 58 Z" fill="${NAVY}"/>
<path d="M72 18 C86 22 96 37 96 56 C96 72 89 86 78 94 C64 89 54 73 55 55 C56 40 62 25 72 18 Z" fill="${ORANGE}"/>
<path d="M78 94 C72 98 66 99 59 99 C49 99 40 93 34 84 C48 92 64 94 78 94 Z" fill="#F8FAFC"/>
<path d="M34 50 C45 42 61 47 66 62 C62 78 44 83 36 72 C31 64 31 56 34 50 Z" fill="${NAVY_SOFT}"/>
<path d="M94 42 L107 40.5 L94 48 Z" fill="${NAVY}"/><path d="M94 49 L105 52 L94 54 Z" fill="${NAVY}"/>
<circle cx="82" cy="40" r="4.6" fill="#0B1733"/><circle cx="83.6" cy="38.4" r="1.5" fill="#fff"/>
${
  doc
    ? `<path d="M74 62 H106 L118 74 V112 A4 4 0 0 1 114 116 H74 A4 4 0 0 1 70 112 V66 A4 4 0 0 1 74 62 Z" fill="#fff" stroke="${NAVY}" stroke-width="3.6" stroke-linejoin="round"/>
<path d="M106 62 L118 74 H110 A4 4 0 0 1 106 70 Z" fill="#E2E8F0" stroke="${NAVY}" stroke-width="3.6" stroke-linejoin="round"/>
<rect x="76" y="86" width="36" height="18" rx="3.5" fill="#D93025"/>
<text x="94" y="99.5" font-family="Arial Black, Arial, sans-serif" font-size="13" font-weight="900" fill="#fff" text-anchor="middle">PDF</text>`
    : ""
}`;

const wordmark = (x, y, size) => `
<text x="${x}" y="${y}" font-family="Arial Black, Arial, sans-serif" font-size="${size}" font-weight="900" fill="${NAVY}">PDF</text>
<text x="${x + size * 2}" y="${y}" font-family="Arial Black, Arial, sans-serif" font-size="${size}" font-weight="900" fill="${ORANGE}">Robin</text>
<path d="M${x + size * 2 + 4} ${y + 15} C${x + size * 3} ${y + 6} ${x + size * 4.2} ${y + 6} ${x + size * 5.2} ${y + 14}"
  stroke="${ORANGE}" stroke-width="${size / 8}" stroke-linecap="round" fill="none"/>`;

/** At favicon sizes the page swamps the bird, so the small icons drop it. */
const icon = (round) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 4 124 124">
     <rect x="-6" y="4" width="124" height="124" ${round ? 'rx="20"' : ""} fill="#fff"/>
     ${bird({ doc: false })}
   </svg>`;

const fullMark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="22" fill="#fff"/>${bird()}</svg>`;

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fff"/>
  <rect y="606" width="1200" height="24" fill="${ORANGE}"/>
  <g transform="translate(300 185) scale(1.75)">${bird()}</g>
  ${wordmark(560, 325, 72)}
  <text x="600" y="440" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#334155" text-anchor="middle">38 free PDF tools. Most run in your browser.</text>
  <text x="600" y="492" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="#64748B" text-anchor="middle">We do not keep your files.</text>
</svg>`;

const outDir = path.resolve("public");
const tmp = mkdtempSync(path.join(tmpdir(), "brand-"));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/opt/pw-browsers/chromium",
});

async function render(svg, width, height, out) {
  const file = path.join(tmp, `${path.basename(out)}.svg`);
  writeFileSync(file, svg);
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`file://${file}`);
  await page.screenshot({ path: out, omitBackground: false });
  await page.close();
  return out;
}

const icoParts = [];
for (const size of [16, 32, 48, 64]) {
  icoParts.push(await render(icon(false), size, size, path.join(tmp, `ico-${size}.png`)));
}
writeFileSync(path.join(outDir, "favicon.ico"), await pngToIco(icoParts));

await render(icon(true), 180, 180, path.join(outDir, "apple-touch-icon.png"));
await render(fullMark, 192, 192, path.join(outDir, "icon-192.png"));
await render(fullMark, 512, 512, path.join(outDir, "icon-512.png"));
await render(og, 1200, 630, path.join(outDir, "og-image.png"));

await browser.close();
rmSync(tmp, { recursive: true, force: true });
console.log("brand assets written to public/: favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, og-image.png");
