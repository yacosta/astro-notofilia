/**
 * Encode catalog hero + responsive variants for the Banco Hipotecario
 * 1881 PMG proof photo (side-by-side front/back holders).
 *
 * Compress/format only — no cropping, compositing, recoloring, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.png node scripts/process-hipotecario-slab-image.mjs
 */
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'colombia-banco-hipotecario-5-pesos-1881';
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };

const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [
      path.join(ROOT, 'public/uploads/Colombia - Banco Hipotecario - 5 Peso - Proof.png'),
      path.join(ROOT, 'public/uploads/Colombia-El Banco Hipotecario 5 pesos.png'),
      path.join(ROOT, `public/uploads/${SLUG}-source.png`),
      path.join(ROOT, `public/uploads/${SLUG}.png`),
    ];

const SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));

if (!SOURCE) {
  console.error(
    [
      'Missing user-submitted Banco Hipotecario slab photo.',
      'Checked:',
      ...SOURCE_CANDIDATES.map((p) => `  - ${p}`),
      '',
      'Commit the original full-frame photo (both PMG holders and labels visible)',
      'to any path above. Do not substitute auction, PMG CDN, Wikimedia, or AI images.',
      'Then re-run: node scripts/process-hipotecario-slab-image.mjs',
    ].join('\n'),
  );
  process.exit(1);
}

console.log(`Using user source: ${SOURCE}`);

async function letterboxCard(input, width, height, ext) {
  const pipeline = sharp(input)
    .resize(width, height, { fit: 'contain', background: CREAM })
    .flatten({ background: CREAM });
  if (ext === 'webp') return pipeline.webp({ quality: 82 }).toFile(`${OUT_BASE}-card${width === 660 ? '-2x' : ''}.webp`);
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

  await letterboxCard(input, 440, 280, 'webp');
  await letterboxCard(input, 440, 280, 'jpg');
  await letterboxCard(input, 660, 280, 'webp');
  await letterboxCard(input, 660, 280, 'jpg');

  console.log('Wrote', `${OUT_BASE}.{png,jpg,webp,-640.webp,-card.*,-card-2x.*}`);
  return meta;
}

const input = await sharp(SOURCE).rotate().toBuffer();
const meta = await writeVariants(input);

const jsonPath = path.join(ROOT, 'src/content/catalog/colombia--banco-hipotecario-5-pesos-1881.json');
if (existsSync(jsonPath) && meta.width && meta.height) {
  const data = JSON.parse(await readFile(jsonPath, 'utf8'));
  const width = meta.width;
  const height = meta.height;
  const replaceDims = (html) =>
    String(html || '')
      .replace(/width="\d+"/g, `width="${width}"`)
      .replace(/height="\d+"/g, `height="${height}"`)
      .replace(
        new RegExp(`${SLUG}\\.webp \\d+w`, 'g'),
        `${SLUG}.webp ${width}w`,
      )
      .replace(
        'width:100%; max-width:560px; display:flex; flex-direction:column; gap:14px; margin:0 auto 56px;',
        'width:100%; max-width:760px; display:flex; flex-direction:column; gap:14px; margin:0 auto 56px;',
      )
      .replace(
        'sizes="(max-width: 640px) 100vw, 560px"',
        'sizes="(max-width: 640px) 100vw, 760px"',
      )
      .replace(
        'Anverso (arriba) y reverso (abajo) — Colección de Notofilia.com',
        'Anverso (izquierda) y reverso (derecha) — Colección de Notofilia.com',
      )
      .replace(
        'Obverse (top) and reverse (bottom) — Notofilia.com Collection',
        'Obverse (left) and reverse (right) — Notofilia.com Collection',
      )
      .replace(
        'anverso arriba (Pick S511p1) y reverso abajo (Pick S511p2)',
        'anverso a la izquierda (Pick S511p1) y reverso a la derecha (Pick S511p2)',
      )
      .replace(
        'obverse above (Pick S511p1) and reverse below (Pick S511p2)',
        'obverse at left (Pick S511p1) and reverse at right (Pick S511p2)',
      );
  data.template = replaceDims(data.template);
  if (data.i18n?.en?.template) data.i18n.en.template = replaceDims(data.i18n.en.template);
  if (data.record?.images?.stacked) {
    data.record.images.stacked.width = width;
    data.record.images.stacked.height = height;
    data.record.images.stacked.alt =
      'Pruebas encapsuladas PMG del 5 pesos del Banco Hipotecario de Bogotá, 1881: anverso a la izquierda (Pick S511p1) y reverso a la derecha (Pick S511p2), ambos 61 Uncirculated';
    data.record.images.stacked.altEn =
      'PMG-encapsulated proofs of the Banco Hipotecario 5 pesos of Bogotá, 1881: obverse at left (Pick S511p1) and reverse at right (Pick S511p2), both 61 Uncirculated';
  }
  await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ficha dimensions to ${width}x${height}`);
}
