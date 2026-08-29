/**
 * Encode user-submitted Series 1957B $1 Silver Certificate faces.
 * Compress/format only — no crop, composite, or substitute.
 * See .cursor/skills/catalog-submitted-images/SKILL.md
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STABLE = 'us-silver-certificate-1-dollar-1957b';

const FACES = [
  {
    role: 'obverse',
    source: '/home/ubuntu/.cursor/projects/workspace/assets/296296a4-0a63-4f48-8447-22b8a97f9461.png',
  },
  {
    role: 'reverse',
    source: '/home/ubuntu/.cursor/projects/workspace/assets/29f82e36-2e67-4d32-8739-74bb56013682.png',
  },
];

async function encodeFace({ role, source }) {
  if (!existsSync(source)) {
    throw new Error(`Missing submitted ${role} photograph: ${source}`);
  }
  const sourceBuf = await readFile(source);
  const hash = createHash('sha256').update(sourceBuf).digest('hex').slice(0, 8);
  const slug = `${STABLE}-${role}-${hash}`;
  const outBase = path.join(ROOT, 'public/uploads', slug);
  const input = await sharp(sourceBuf).rotate().toBuffer();
  const meta = await sharp(input).metadata();
  const png = sharp(input).rotate();
  await png.clone().jpeg({ quality: 88, mozjpeg: true }).toFile(`${outBase}.jpg`);
  await png.clone().webp({ quality: 85 }).toFile(`${outBase}.webp`);
  await png.clone().resize({ width: 640 }).webp({ quality: 82 }).toFile(`${outBase}-640.webp`);
  await png.clone().resize({ width: 640 }).jpeg({ quality: 85, mozjpeg: true }).toFile(`${outBase}-640.jpg`);
  return {
    role,
    slug,
    hash,
    width: meta.width,
    height: meta.height,
    jpg: `/uploads/${slug}.jpg`,
    webp: `/uploads/${slug}.webp`,
  };
}

const results = [];
for (const face of FACES) {
  const encoded = await encodeFace(face);
  results.push(encoded);
  console.log(JSON.stringify(encoded));
}
