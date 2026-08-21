/**
 * Encode catalog hero + responsive variants for the Estados Unidos de
 * Nueva Granada 1861 Un Peso photo (side-by-side obverse/reverse).
 *
 * Compress/format only — no cropping, compositing, recoloring, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 *
 * Usage:
 *   SOURCE=/path/to/original.png node scripts/process-nueva-granada-1861-image.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE_SLUG = 'colombia-nueva-granada-1-peso-1861';
const CREAM = { r: 216, g: 210, b: 205, alpha: 1 };

const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [
      path.join(ROOT, 'public/uploads/Estados Unidos de Nueva Granada · 1861.png'),
      path.join(ROOT, `public/uploads/${BASE_SLUG}-source.png`),
      path.join(ROOT, `public/uploads/${BASE_SLUG}.png`),
    ];

const SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));

if (!SOURCE) {
  console.error(
    [
      'Missing user-submitted Nueva Granada 1861 banknote photo.',
      'Checked:',
      ...SOURCE_CANDIDATES.map((p) => `  - ${p}`),
      '',
      'Commit the original full-frame photo (both faces visible, no crop)',
      'to any path above. Do not substitute auction, Wikimedia, or AI images.',
      'Then re-run: node scripts/process-nueva-granada-1861-image.mjs',
    ].join('\n'),
  );
  process.exit(1);
}

console.log(`Using user source: ${SOURCE}`);

const sourceBuf = await readFile(SOURCE);
const HASH = createHash('sha256').update(sourceBuf).digest('hex').slice(0, 8);
const SLUG = `${BASE_SLUG}-${HASH}`;
const OUT_BASE = path.join(ROOT, 'public/uploads', SLUG);
const LEGACY_BASE = path.join(ROOT, 'public/uploads', BASE_SLUG);

console.log(`Cache-bust slug: ${SLUG}`);

async function letterboxCard(input, width, height, outBase, ext) {
  const suffix = width === 660 ? '-card-2x' : '-card';
  const pipeline = sharp(input)
    .resize(width, height, { fit: 'contain', background: CREAM })
    .flatten({ background: CREAM });
  if (ext === 'webp') return pipeline.webp({ quality: 82 }).toFile(`${outBase}${suffix}.webp`);
  return pipeline.jpeg({ quality: 85 }).toFile(`${outBase}${suffix}.jpg`);
}

async function writeVariants(input, outBase) {
  const meta = await sharp(input).metadata();
  console.log(`Source dimensions: ${meta.width}x${meta.height}`);

  const png = sharp(input).rotate();
  await png.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(`${outBase}.png`);
  await png.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(`${outBase}.jpg`);
  await png.clone().webp({ quality: 85 }).toFile(`${outBase}.webp`);
  await png.clone().resize({ width: 640 }).webp({ quality: 82 }).toFile(`${outBase}-640.webp`);

  await letterboxCard(input, 440, 280, outBase, 'webp');
  await letterboxCard(input, 440, 280, outBase, 'jpg');
  await letterboxCard(input, 660, 280, outBase, 'webp');
  await letterboxCard(input, 660, 280, outBase, 'jpg');

  console.log('Wrote', `${outBase}.{png,jpg,webp,-640.webp,-card.*,-card-2x.*}`);
  return meta;
}

const input = await sharp(sourceBuf).rotate().toBuffer();
const meta = await writeVariants(input, OUT_BASE);

for (const suffix of ['.png', '.jpg', '.webp', '-640.webp', '-card.webp', '-card.jpg', '-card-2x.webp', '-card-2x.jpg']) {
  await copyFile(`${OUT_BASE}${suffix}`, `${LEGACY_BASE}${suffix}`);
}

const ALT_ES =
  'Billete de Un Peso de 1861 de la Tesorería Jeneral de los Estados Unidos de Nueva Granada, anverso a la izquierda y reverso a la derecha';
const ALT_EN =
  'One Peso banknote of 1861 of the Tesorería Jeneral of the United States of New Granada, obverse at left and reverse at right';
const ALT_ES_ZOOM = `${ALT_ES}, vista ampliada`;
const ALT_EN_ZOOM = `${ALT_EN}, enlarged view`;

const jsonPath = path.join(ROOT, 'src/content/catalog/colombia--nueva-granada-1-peso-1861.json');
if (existsSync(jsonPath) && meta.width && meta.height) {
  const data = JSON.parse(await readFile(jsonPath, 'utf8'));
  const width = meta.width;
  const height = meta.height;
  const oldSlug = BASE_SLUG;
  const replaceHtml = (html, { alt, altZoom, caption }) =>
    String(html || '')
      .replaceAll(`/uploads/${oldSlug}-640.webp`, `/uploads/${SLUG}-640.webp`)
      .replaceAll(`/uploads/${oldSlug}.webp`, `/uploads/${SLUG}.webp`)
      .replaceAll(`/uploads/${oldSlug}.jpg`, `/uploads/${SLUG}.jpg`)
      .replace(/srcset="\/uploads\/[^"]+"/, (match) =>
        match
          .replace(/\s+\d+w/g, (w) => (w.includes('640w') ? ' 640w' : ` ${width}w`))
          .replace('" type="image/webp"', '" sizes="(max-width: 640px) 100vw, 760px" type="image/webp"'),
      )
      .replace(
        'width:100%; max-width:660px; display:flex; flex-direction:column; gap:14px; margin:0 auto 56px;',
        'width:100%; max-width:760px; display:flex; flex-direction:column; gap:14px; margin:0 auto 56px;',
      )
      .replace(/width="564"/g, `width="${width}"`)
      .replace(/height="483"/g, `height="${height}"`)
      .replace(
        `width="${width}"\n                height="${height}"\n                loading="eager"\n                decoding="async"`,
        `width="${width}"\n                height="${height}"\n                loading="eager"\n                fetchpriority="high"\n                decoding="async"`,
      )
      .replace(
        '<img data-zoom-image\n                    src="/uploads/' +
          SLUG +
          '.jpg"',
        `<img data-zoom-image\n                    src="/uploads/${SLUG}.jpg"\n                    width="${width}"\n                    height="${height}"`,
      )
      .replace(
        /alt="Billete de Un Peso de 1861 de la Tesorería Jeneral de los Estados Unidos de Nueva Granada, anverso y reverso"/g,
        `alt="${alt}"`,
      )
      .replace(
        /alt="Billete de Un Peso de 1861 de la Tesorería Jeneral de los Estados Unidos de Nueva Granada, vista ampliada"/g,
        `alt="${altZoom}"`,
      )
      .replace(
        /alt="Banknote of A Peso from 1861 de la Tesorería Jeneral de los United States de Nueva Granada, obverse and reverse"/g,
        `alt="${alt}"`,
      )
      .replace(
        /alt="Banknote of A Peso from 1861 de la Tesorería Jeneral de los United States de Nueva Granada, enlarged view"/g,
        `alt="${altZoom}"`,
      )
      .replace(
        'Anverso (arriba) y reverso (abajo) — Colección de Notofilia.com',
        caption,
      )
      .replace(
        'Obverse (top) and reverse (bottom) — Notofilia.com Collection',
        caption,
      );

  data.ogImage = `/uploads/${SLUG}.jpg`;
  if (data.jsonLd?.['@graph']) {
    for (const node of data.jsonLd['@graph']) {
      if (node.image) node.image = `https://notofilia.com/uploads/${SLUG}.jpg`;
    }
  }
  data.template = replaceHtml(data.template, {
    alt: ALT_ES,
    altZoom: ALT_ES_ZOOM,
    caption: 'Anverso (izquierda) y reverso (derecha) — Colección de Notofilia.com',
  });
  if (data.i18n?.en?.template) {
    data.i18n.en.template = replaceHtml(data.i18n.en.template, {
      alt: ALT_EN,
      altZoom: ALT_EN_ZOOM,
      caption: 'Obverse (left) and reverse (right) — Notofilia.com Collection',
    });
  }
  if (data.record?.images?.stacked) {
    data.record.images.stacked.src = `/uploads/${SLUG}.jpg`;
    data.record.images.stacked.srcWebp = `/uploads/${SLUG}.webp`;
    data.record.images.stacked.alt = ALT_ES;
    data.record.images.stacked.altEn = ALT_EN;
    data.record.images.stacked.width = width;
    data.record.images.stacked.height = height;
  }
  await writeFile(jsonPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Updated ficha to ${SLUG} at ${width}x${height}`);
}
