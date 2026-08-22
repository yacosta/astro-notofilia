/**
 * Encode catalog hero + responsive variants for the MPC Series 692 $20 photo
 * (obverse above reverse). Compress/format only — no crop or substitute.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.png node scripts/process-mpc-692-slab-image.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };
const JSON_PATH = path.join(
  ROOT,
  'src/content/catalog/certificados-de-pago-militar--20-dolares-serie-692.json',
);
const PREVIOUS_SLUG = 'mpc-series-692-20-dollars-3f285359';

const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [
      path.join(ROOT, 'public/uploads/MPC_Series_692_20_Dollars_Front_Back_6144x40962.png'),
      path.join(ROOT, 'public/uploads/Military Payment Certificate - 20 dollars.png'),
      path.join(ROOT, 'public/uploads/Military Payment Certificate - 20 Dollars.png'),
    ];

const SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));

if (!SOURCE) {
  console.error(
    [
      'Missing user-submitted MPC Series 692 $20 photo.',
      'Checked:',
      ...SOURCE_CANDIDATES.map((p) => `  - ${p}`),
      '',
      'Commit the original full-frame photo to any path above.',
      'Do not substitute auction, Wikimedia, or AI images.',
    ].join('\n'),
  );
  process.exit(1);
}

console.log(`Using user source: ${SOURCE}`);

const sourceBuf = await readFile(SOURCE);
const HASH = createHash('sha256').update(sourceBuf).digest('hex').slice(0, 8);
const SLUG = `mpc-series-692-20-dollars-${HASH}`;
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
console.log(`Asset slug: ${SLUG}`);

async function letterboxCard(input, width, height, ext) {
  const pipeline = sharp(input)
    .resize(width, height, { fit: 'contain', background: CREAM })
    .flatten({ background: CREAM });
  const suffix = width === 660 ? '-card-2x' : '-card';
  if (ext === 'webp') return pipeline.webp({ quality: 82 }).toFile(`${OUT_BASE}${suffix}.webp`);
  return pipeline.jpeg({ quality: 85 }).toFile(`${OUT_BASE}${suffix}.jpg`);
}

const input = await sharp(SOURCE).rotate().toBuffer();
const meta = await sharp(input).metadata();
const width = meta.width;
const height = meta.height;
console.log(`Source dimensions: ${width}x${height}`);

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

function replaceHtml(html) {
  return String(html || '')
    .replaceAll(`/uploads/${PREVIOUS_SLUG}`, `/uploads/${SLUG}`)
    .replaceAll('width="1448"', `width="${width}"`)
    .replaceAll('height="1086"', `height="${height}"`)
    .replaceAll('.webp 1448w', `.webp ${width}w`)
    .replaceAll(
      'Anverso (izquierda) y reverso (derecha) — Colección de Notofilia.com',
      'Anverso (arriba) y reverso (abajo) — Colección de Notofilia.com',
    )
    .replaceAll(
      'Obverse (left) and reverse (right) — Notofilia.com Collection',
      'Obverse (top) and reverse (bottom) — Notofilia.com Collection',
    )
    .replaceAll(
      'anverso a la izquierda con el retrato del jefe ute Ouray y reverso a la derecha con la presa Hoover',
      'anverso arriba con el retrato del jefe ute Ouray y reverso abajo con la presa Hoover',
    )
    .replaceAll(
      'obverse at left con el portrait of Ute Chief Ouray y reverse at right con la presa Hoover',
      'obverse at top con el portrait of Ute Chief Ouray y reverse at bottom con la presa Hoover',
    );
}

if (existsSync(JSON_PATH) && width && height) {
  const data = JSON.parse(await readFile(JSON_PATH, 'utf8'));
  data.ogImage = `/uploads/${SLUG}.jpg`;
  if (data.jsonLd?.['@graph']) {
    for (const node of data.jsonLd['@graph']) {
      if (node.image) node.image = `https://notofilia.com/uploads/${SLUG}.jpg`;
    }
  }
  data.template = replaceHtml(data.template);
  if (data.i18n?.en?.template) data.i18n.en.template = replaceHtml(data.i18n.en.template);
  if (data.record?.images?.stacked) {
    data.record.images.stacked.src = `/uploads/${SLUG}.jpg`;
    data.record.images.stacked.srcWebp = `/uploads/${SLUG}.webp`;
    data.record.images.stacked.width = width;
    data.record.images.stacked.height = height;
    data.record.images.stacked.alt =
      'Certificado de pago militar de veinte dólares, Serie 692: anverso arriba con el retrato del jefe ute Ouray y reverso abajo con la presa Hoover';
    data.record.images.stacked.altEn =
      'Military Payment Certificate twenty dollars, Series 692: obverse at top with the portrait of Ute Chief Ouray and reverse at bottom with Hoover Dam';
  }
  await writeFile(JSON_PATH, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ficha to ${SLUG} ${width}x${height}`);
}

console.log(SLUG);
