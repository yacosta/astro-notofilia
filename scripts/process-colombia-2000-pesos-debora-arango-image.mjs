/**
 * Encode catalog hero + responsive variants for the Banco de la República
 * 2.000 pesos Débora Arango P-458b progressive proof (stacked obverse/reverse).
 *
 * Compress/format only — no cropping, compositing, recoloring, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Chat attachments are not readable in the cloud agent. Commit the original
 * full-frame photo (sleeve, both faces, margins visible) to one of the
 * SOURCE_CANDIDATES paths, then re-run this script.
 *
 * Usage:
 *   SOURCE=/path/to/original.jpg node scripts/process-colombia-2000-pesos-debora-arango-image.mjs
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'colombia-banco-de-la-republica-2000-pesos-debora-arango';
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };

const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [
      path.join(ROOT, 'public/uploads/Colombia 2000 pesos - Error.png'),
      path.join(ROOT, 'public/uploads/Colombia 2000 pesos - Error.jpg'),
      path.join(ROOT, 'public/uploads/Colombia - BDR 2000pesos Debora Arango.png'),
      path.join(ROOT, 'public/uploads/Colombia - BDR 2000pesos Debora Arango.jpg'),
      path.join(ROOT, 'public/uploads/Colombia - BDR 2000pesos Debora Arango.jpeg'),
      path.join(ROOT, 'public/uploads/Colombia - BDR 2000 pesos Debora Arango.png'),
      path.join(ROOT, 'public/uploads/Colombia - BDR 2000 pesos Debora Arango.jpg'),
      path.join(ROOT, `public/uploads/${SLUG}-source.png`),
      path.join(ROOT, `public/uploads/${SLUG}-source.jpg`),
      path.join(ROOT, `public/uploads/${SLUG}-source.jpeg`),
      path.join(ROOT, `public/uploads/${SLUG}-source.webp`),
      path.join(ROOT, `public/uploads/${SLUG}.png`),
      path.join(ROOT, `public/uploads/${SLUG}.jpg`),
      path.join(ROOT, `public/uploads/${SLUG}.jpeg`),
      path.join(ROOT, `public/uploads/${SLUG}.webp`),
    ];

const SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));

if (!SOURCE) {
  console.error(
    [
      'Missing user-submitted 2.000 pesos Débora Arango photo.',
      'Checked:',
      ...SOURCE_CANDIDATES.map((p) => `  - ${p}`),
      '',
      'Commit the original full-frame photo (collector sleeve, both faces).',
      'Do not substitute BanRep publicity scans, Wikimedia, auction, or AI images.',
      'Then re-run: node scripts/process-colombia-2000-pesos-debora-arango-image.mjs',
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

const jsonPath = path.join(ROOT, 'src/content/catalog/colombia--banco-de-la-republica-2000-pesos-debora-arango.json');
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
