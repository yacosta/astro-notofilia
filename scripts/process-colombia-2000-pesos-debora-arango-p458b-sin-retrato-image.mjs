/**
 * Encode catalog hero + responsive variants for the second Banco de la República
 * 2.000 pesos Débora Arango P-458b progressive proof (face without portrait
 * intaglio; printed Caño Cristales reverse; mismatched AA serials).
 *
 * Compress/format only — no cropping, compositing, recoloring, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.png node scripts/process-colombia-2000-pesos-debora-arango-p458b-sin-retrato-image.mjs
 */
import { existsSync, readdirSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'colombia-banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato';
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };
const UPLOADS = path.join(ROOT, 'public/uploads');

function findUploadedSource() {
  if (process.env.SOURCE) return process.env.SOURCE;
  const names = readdirSync(UPLOADS);
  const match = names.find(
    (name) =>
      name.includes('P-458b') &&
      name.includes('Progressive') &&
      (name.includes('2,000') || name.includes('2000') || name.includes('Arango')),
  );
  return match ? path.join(UPLOADS, match) : null;
}

const SOURCE = findUploadedSource();

if (!SOURCE || !existsSync(SOURCE)) {
  console.error(
    [
      'Missing user-submitted Débora Arango P-458b underprint-proof photo.',
      process.env.SOURCE ? `Checked SOURCE=${process.env.SOURCE}` : `Checked ${UPLOADS} for P-458b Progressive`,
      '',
      'Commit the original full-frame photo (sleeve, both faces, margins visible).',
      'Do not substitute BanRep publicity scans, Wikimedia, auction, or AI images.',
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

const jsonPath = path.join(
  ROOT,
  'src/content/catalog/colombia--banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato.json',
);
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
