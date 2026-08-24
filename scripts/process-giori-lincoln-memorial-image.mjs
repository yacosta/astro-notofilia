/**
 * Encode catalog hero + responsive variants for the 1970s Giori test note
 * (Lincoln Memorial, green face, blank back). Stacked obverse/reverse photo.
 * Compress/format only — no crop, composite, or substitute.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.jpg node scripts/process-giori-lincoln-memorial-image.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };

const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [
      path.join(
        ROOT,
        '.cursor/projects/Users-yezidacosta-Documents-GitHub-astro-notofilia/assets/1970s_Giori_Test_Note_Lincoln_Memorial_Green_Front_Blank_Back-c8154ad4-acc1-49ae-a6e9-3518f142b6ff.jpg',
      ),
    ];

const SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));

if (!SOURCE) {
  console.error(
    [
      'Missing user-submitted 1970s Giori Lincoln Memorial test-note photo.',
      'Checked:',
      ...SOURCE_CANDIDATES.map((p) => `  - ${p}`),
      '',
      'Commit the original full-frame photo (both faces).',
      'Do not substitute auction, Wikimedia, or AI images.',
    ].join('\n'),
  );
  process.exit(1);
}

console.log(`Using user source: ${SOURCE}`);

const sourceBuf = await readFile(SOURCE);
const HASH = createHash('sha256').update(sourceBuf).digest('hex').slice(0, 8);
const SLUG = `us-giori-test-note-lincoln-memorial-green-${HASH}`;
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
console.log(`Asset slug: ${SLUG}`);

async function letterboxCard(input, width, height, ext) {
  const pipeline = sharp(input)
    .resize(width, height, { fit: 'contain', background: CREAM })
    .flatten({ background: CREAM });
  const suffix = width === 660 ? '-card-2x' : '-card';
  if (ext === 'webp') return pipeline.webp({ quality: 82 }).toFile(`${OUT_BASE}${suffix}.webp`);
  return pipeline.jpeg({ quality: 85, mozjpeg: true }).toFile(`${OUT_BASE}${suffix}.jpg`);
}

const input = await sharp(SOURCE).rotate().toBuffer();
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
console.log(JSON.stringify({ slug: SLUG, width: meta.width, height: meta.height, hash: HASH }));
