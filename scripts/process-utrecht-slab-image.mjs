/**
 * Build the Utrecht ducat catalog hero from NGC full-holder photos (cert 4685927-012).
 * Joins obverse + reverse slabs side-by-side without cropping the holders.
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_BASE = path.join(ROOT, 'public/uploads/1761-netherland-ducat-utrecht');
const OBV =
  'https://ccg-imaging-ngc-coins-production.s3.amazonaws.com/edf4b7a038dcd9f09669db151cb9ad98345f01a5/NGC4685927-012_OBV.JPG';
const REV =
  'https://ccg-imaging-ngc-coins-production.s3.amazonaws.com/edf4b7a038dcd9f09669db151cb9ad98345f01a5/NGC4685927-012_REV.JPG';

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const [obvBuf, revBuf] = await Promise.all([fetchBuffer(OBV), fetchBuffer(REV)]);
const [obvMeta, revMeta] = await Promise.all([sharp(obvBuf).metadata(), sharp(revBuf).metadata()]);
const slabHeight = Math.max(obvMeta.height ?? 0, revMeta.height ?? 0);
const gap = 24;
const padX = 32;
const padY = 32;
const canvasWidth = padX * 2 + (obvMeta.width ?? 0) + gap + (revMeta.width ?? 0);
const canvasHeight = padY * 2 + slabHeight;

const obvLeft = padX;
const revLeft = padX + (obvMeta.width ?? 0) + gap;
const yOffset = padY + Math.floor((slabHeight - (obvMeta.height ?? 0)) / 2);
const revYOffset = padY + Math.floor((slabHeight - (revMeta.height ?? 0)) / 2);

const composite = await sharp({
  create: {
    width: canvasWidth,
    height: canvasHeight,
    channels: 3,
    background: { r: 28, g: 26, b: 21 },
  },
})
  .composite([
    { input: obvBuf, left: obvLeft, top: yOffset },
    { input: revBuf, left: revLeft, top: revYOffset },
  ])
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer();

const meta = await sharp(composite).metadata();
console.log(`Composite: ${meta.width}x${meta.height}`);

await sharp(composite).toFile(`${OUT_BASE}.png`);
await sharp(composite).webp({ quality: 85 }).toFile(`${OUT_BASE}.webp`);
await sharp(composite).resize({ width: 640 }).webp({ quality: 82 }).toFile(`${OUT_BASE}-640.webp`);

console.log('Wrote', `${OUT_BASE}.{png,webp,-640.webp}`);
