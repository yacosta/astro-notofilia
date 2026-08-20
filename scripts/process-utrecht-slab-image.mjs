/**
 * Encode catalog hero + responsive variants for the Utrecht ducat slab photo.
 *
 * Requires the user-submitted source at:
 *   public/uploads/1761-netherland-ducat-utrecht-source.png
 * (override with SOURCE=/path/to/file.png)
 *
 * Compress/format only — no cropping, compositing, recoloring, or substitution.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 */
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_BASE = path.join(ROOT, 'public/uploads/1761-netherland-ducat-utrecht');
const SOURCE_CANDIDATES = process.env.SOURCE
  ? [process.env.SOURCE]
  : [
      path.join(ROOT, 'public/uploads/1761-netherland-ducat-utrecht-source.png'),
      path.join(ROOT, 'public/images/monedas/1761-netherland-ducat-utrecht.png'),
      path.join(ROOT, 'images/monedas/1761-netherland-ducat-utrecht.png'),
    ];

const SOURCE = SOURCE_CANDIDATES.find((p) => existsSync(p));

if (!SOURCE) {
  console.error(
    [
      'Missing user-submitted slab photo from your collection.',
      'Checked:',
      ...SOURCE_CANDIDATES.map((p) => `  - ${p}`),
      '',
      'Commit your NGC slab photo (full frame, both faces) to any path above, then re-run:',
      '  node scripts/process-utrecht-slab-image.mjs',
      '  node scripts/write-ducado-utrecht-ficha.mjs',
      '',
      'Chat attachments are not readable in the cloud agent — the file must be in the repo.',
      'Do not substitute NGC cert downloads or stock images for catalog specimen photos.',
    ].join('\n'),
  );
  process.exit(1);
}

console.log(`Using user source: ${SOURCE}`);

async function writeVariants(input) {
  const meta = await sharp(input).metadata();
  console.log(`Output dimensions: ${meta.width}x${meta.height}`);

  await sharp(input).png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(`${OUT_BASE}.png`);
  await sharp(input).webp({ quality: 85 }).toFile(`${OUT_BASE}.webp`);
  await sharp(input).resize({ width: 640 }).webp({ quality: 82 }).toFile(`${OUT_BASE}-640.webp`);

  const cardOpts = { fit: 'cover', position: 'centre' };
  await sharp(input).resize(440, 280, cardOpts).webp({ quality: 82 }).toFile(`${OUT_BASE}-card.webp`);
  await sharp(input).resize(440, 280, cardOpts).jpeg({ quality: 85 }).toFile(`${OUT_BASE}-card.jpg`);
  await sharp(input)
    .resize(660, 280, cardOpts)
    .webp({ quality: 82 })
    .toFile(`${OUT_BASE}-card-2x.webp`);
  await sharp(input)
    .resize(660, 280, cardOpts)
    .jpeg({ quality: 85 })
    .toFile(`${OUT_BASE}-card-2x.jpg`);

  console.log('Wrote', `${OUT_BASE}.{png,webp,-640.webp,-card.*,-card-2x.*}`);
  return meta;
}

const input = await sharp(SOURCE).toBuffer();
await writeVariants(input);
