import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "entry.png");
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output/entry.png";
const dest = outDir.endsWith(".png") ? outDir : join(outDir, "entry.png");

if (!existsSync(src)) {
  throw new Error(`entry.png not found at ${src}`);
}
// Fail loudly if the image is not a real PNG instead of copying bad bytes.
const buf = readFileSync(src);
const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
if (!buf.subarray(0, 8).equals(pngMagic)) {
  throw new Error(`entry.png at ${src} is not a PNG file`);
}
// The format gate allows at most 1024x1024: refuse an oversized render
// instead of copying bytes the gate would reject.
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}
mkdirSync(dirname(dest), { recursive: true });
copyFileSync(src, dest);
console.log(`copied ${src} -> ${dest}`);
