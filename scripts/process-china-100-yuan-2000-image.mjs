/**
 * Encode catalog hero + responsive variants for the People's Bank of China
 * 2000 polymer 100 yuan (stacked obverse/reverse in sleeves).
 *
 * Compress/format only — no cropping, compositing, recoloring, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.png node scripts/process-china-100-yuan-2000-image.mjs
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'china-pboc-100-yuan-2000-polimero';
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };

const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [
      path.join(ROOT, 'public/uploads/2000 100 yuan China Peoples Republic Bank.png'),
      path.join(ROOT, `public/uploads/${SLUG}-source.png`),
      path.join(ROOT, `public/uploads/${SLUG}.png`),
    ];

const SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));

if (!SOURCE) {
  console.error(
    [
      'Missing user-submitted China 2000 100 yuan polymer photo.',
      'Checked:',
      ...SOURCE_CANDIDATES.map((p) => `  - ${p}`),
      '',
      'Commit the original full-frame photo (both faces and sleeves visible)',
      'to any path above. Do not substitute auction, Wikimedia, or AI images.',
      'Then re-run: node scripts/process-china-100-yuan-2000-image.mjs',
    ].join('\n'),
  );
  process.exit(1);
}

console.log(`Using user source: ${SOURCE}`);

async function letterboxCard(input, width, height, ext) {
  const pipeline = sharp(input)
    .resize(width, height, { fit: 'contain', background: CREAM })
    .flatten({ background: CREAM });
  if (ext === 'webp') {
    return pipeline.webp({ quality: 82 }).toFile(`${OUT_BASE}-card${width === 660 ? '-2x' : ''}.webp`);
  }
  return pipeline.jpeg({ quality: 85 }).toFile(`${OUT_BASE}-card${width === 660 ? '-2x' : ''}.jpg`);
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

const jsonPath = path.join(ROOT, 'src/content/catalog/polimero-mundial--china-100-yuan-2000.json');
if (existsSync(jsonPath) && meta.width && meta.height) {
  const data = JSON.parse(await readFile(jsonPath, 'utf8'));
  const width = meta.width;
  const height = meta.height;
  if (data.record?.images?.stacked) {
    data.record.images.stacked.width = width;
    data.record.images.stacked.height = height;
  }
  const rewriteDims = (html) =>
    String(html || '')
      .replace(/width="\d+"/g, `width="${width}"`)
      .replace(/height="\d+"/g, `height="${height}"`)
      .replace(new RegExp(`${SLUG}\\.webp \\d+w`, 'g'), `${SLUG}.webp ${width}w`);
  data.template = rewriteDims(data.template);
  if (data.i18n?.en?.template) data.i18n.en.template = rewriteDims(data.i18n.en.template);
  await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ficha image dimensions: ${width}x${height}`);
}
