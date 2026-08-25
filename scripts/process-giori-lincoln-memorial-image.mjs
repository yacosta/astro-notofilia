/**
 * Encode catalog hero + responsive variants for the Magna/Giori Lincoln Memorial
 * grass-green uniface test note (stacked printed face / blank back).
 *
 * Compress/format only — no cropping, compositing, recoloring, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.png node scripts/process-giori-lincoln-memorial-image.mjs
 */
import { existsSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'magna-giori-lincoln-memorial-rgmb1-0nsu';
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };
const UPLOADS = path.join(ROOT, 'public/uploads');

function findUploadedSource() {
  if (process.env.SOURCE) return process.env.SOURCE;
  const names = readdirSync(UPLOADS);
  const match = names.find(
    (name) =>
      name.includes('Lincoln Memorial') &&
      (name.includes('RGMB1') || name.includes('Giori') || name.includes('Magna')),
  );
  return match ? path.join(UPLOADS, match) : null;
}

const SOURCE = findUploadedSource();

if (!SOURCE || !existsSync(SOURCE)) {
  console.error(
    [
      'Missing user-submitted Magna/Giori Lincoln Memorial photo.',
      process.env.SOURCE ? `Checked SOURCE=${process.env.SOURCE}` : `Checked ${UPLOADS} for Lincoln Memorial / RGMB1`,
      '',
      'Commit the original full-frame photo (printed face + blank back).',
      'Do not substitute Heritage, Wikimedia, auction, or AI images.',
    ].join('\n'),
  );
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
  return meta;
}

const input = await sharp(SOURCE).rotate().toBuffer();
const meta = await writeVariants(input);

const jsonPath = path.join(ROOT, 'src/content/catalog/giori-press-test-note-lincoln-memorial.json');
if (existsSync(jsonPath) && meta.width && meta.height) {
  const data = JSON.parse(await readFile(jsonPath, 'utf8'));
  const width = meta.width;
  const height = meta.height;
  const replaceDims = (html) =>
    String(html || '')
      .replace(/width="\d+"/g, `width="${width}"`)
      .replace(/height="\d+"/g, `height="${height}"`)
      .replace(new RegExp(`${SLUG}\\.webp \\d+w`, 'g'), `${SLUG}.webp ${width}w`);
  data.template = replaceDims(data.template);
  if (data.i18n?.en?.template) data.i18n.en.template = replaceDims(data.i18n.en.template);
  if (data.record?.images?.stacked) {
    data.record.images.stacked.width = width;
    data.record.images.stacked.height = height;
  }
  await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ficha dimensions to ${width}x${height}`);
}
