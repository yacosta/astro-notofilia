/**
 * Encode catalog variants for the Magna/Giori Lincoln Memorial uniface
 * test note (Rothberg RGMB1/0NSU). Distinct from us-giori-press-test-note*.
 *
 * Compress/format only — no crop, composite, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.png node scripts/process-giori-lincoln-memorial-uniface-image.mjs
 */
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'us-giori-press-test-note-lincoln-memorial-uniface';
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };
const UPLOADS = path.join(ROOT, 'public/uploads');

async function findLongFilenameSource() {
  const names = await readdir(UPLOADS);
  return names
    .map((name) => path.join(UPLOADS, name))
    .find((p) => p.includes('Lincoln Memorial') && p.endsWith('.png'));
}

const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [path.join(ROOT, `public/uploads/${SLUG}-source.png`), path.join(ROOT, `public/uploads/${SLUG}.png`)];

let SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));
if (!SOURCE) SOURCE = await findLongFilenameSource();

if (!SOURCE) {
  console.error('Missing user-submitted Magna/Giori Lincoln Memorial photo.');
  process.exit(1);
}

if (path.basename(SOURCE).startsWith('us-giori-press-test-note.') && !SOURCE.includes('lincoln-memorial')) {
  console.error('Refusing to overwrite the published three-portrait Giori assets.');
  process.exit(1);
}

console.log(`Using user source: ${SOURCE}`);

async function letterboxCard(input, width, height, ext) {
  const pipeline = sharp(input)
    .resize(width, height, { fit: 'contain', background: CREAM })
    .flatten({ background: CREAM });
  const suffix = width === 660 ? '-card-2x' : '-card';
  if (ext === 'webp') return pipeline.webp({ quality: 82 }).toFile(`${OUT_BASE}${suffix}.webp`);
  return pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(`${OUT_BASE}${suffix}.jpg`);
}

async function writeVariants(input) {
  const meta = await sharp(input).metadata();
  console.log(`Source dimensions: ${meta.width}x${meta.height}`);
  const png = sharp(input).rotate();
  await png.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(`${OUT_BASE}.png`);
  await png.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(`${OUT_BASE}.jpg`);
  await png.clone().webp({ quality: 85 }).toFile(`${OUT_BASE}.webp`);
  await png.clone().resize({ width: 640 }).webp({ quality: 82 }).toFile(`${OUT_BASE}-640.webp`);
  await png.clone().resize({ width: 640 }).jpeg({ quality: 85, mozjpeg: true }).toFile(`${OUT_BASE}-640.jpg`);
  await letterboxCard(input, 440, 280, 'webp');
  await letterboxCard(input, 440, 280, 'jpg');
  await letterboxCard(input, 660, 280, 'webp');
  await letterboxCard(input, 660, 280, 'jpg');
  console.log('Wrote', `${OUT_BASE}.{png,jpg,webp,-640.*,-card.*,-card-2x.*}`);
}

const input = await sharp(SOURCE).rotate().toBuffer();
await writeVariants(input);
