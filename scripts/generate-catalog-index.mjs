import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG_DIR = path.join(ROOT, 'src/content/catalog');
const OUT_DIR = path.join(ROOT, 'public/data');
const OUT_FILE = path.join(OUT_DIR, 'catalog-index.json');
const SITE = 'https://notofilia.com';

const POLYMER_COUNTRY = {
  bangladesh: 'Bangladesh',
  brazil: 'Brasil',
  brasil: 'Brasil',
  brunei: 'Brunéi',
  bulgaria: 'Bulgaria',
  catar: 'Catar',
  chile: 'Chile',
  'costa-rica': 'Costa Rica',
  guatemala: 'Guatemala',
  haiti: 'Haití',
  honduras: 'Honduras',
  'hong-kong': 'Hong Kong',
  'islas-salomon': 'Islas Salomón',
  kazajistan: 'Kazajistán',
  malasia: 'Malasia',
  mexico: 'México',
  mozambique: 'Mozambique',
  nepal: 'Nepal',
  nicaragua: 'Nicaragua',
  nigeria: 'Nigeria',
  oman: 'Omán',
  'papua-nueva-guinea': 'Papúa Nueva Guinea',
  'republica-dominicana': 'República Dominicana',
  rumania: 'Rumania',
  samoa: 'Samoa',
  'sri-lanka': 'Sri Lanka',
  suazilandia: 'Suazilandia',
  taiwan: 'Taiwán',
  zambia: 'Zambia',
};

const HUB_PATHS = new Set([
  '/coleccion/billete-obsoleto-estados-unidos/',
  '/coleccion/reserva-federal/',
  '/coleccion/departamento-del-tesoro-de-ee-uu/',
  '/coleccion/moneda-colonial/',
  '/coleccion/colombia/',
  '/coleccion/colombia/banca-libre/',
  '/coleccion/colombia/emisiones-en-el-extranjero/',
  '/coleccion/puerto-rico/',
  '/coleccion/ecuador/',
  '/coleccion/moneda-colonial-espanola/',
  '/coleccion/polimero-mundial/',
  '/coleccion/pop-art/',
  '/coleccion/certificados-de-pago-militar/',
  '/coleccion/emisiones-promocionales/',
  '/coleccion/food-coupons-usda/',
]);

function decodeEntities(value = '') {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—')
    .replace(/&middot;/gi, '·')
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/&trade;/gi, '™')
    .replace(/&reg;/gi, '®')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function stripTags(html = '') {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function fact(html, label) {
  const patterns = [
    new RegExp(
      `<span[^>]*>\\s*${label}\\s*</span>\\s*<span[^>]*>([\\s\\S]*?)</span>`,
      'i',
    ),
    new RegExp(`<dt[^>]*>\\s*${label}\\s*</dt>\\s*<dd[^>]*>([\\s\\S]*?)</dd>`, 'i'),
    new RegExp(
      `<(?:th|strong)[^>]*>\\s*${label}\\s*</(?:th|strong)>\\s*<(?:td|span)[^>]*>([\\s\\S]*?)</(?:td|span)>`,
      'i',
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return stripTags(match[1]);
  }
  return '';
}

function normalizeCountry(raw, catalogPath) {
  const text = (raw || '').trim();
  const lower = text.toLowerCase();
  if (lower.includes('estados unidos') || lower.includes('ee. uu') || lower.includes('ee uu')) {
    return 'Estados Unidos';
  }
  if (lower.includes('puerto rico')) return 'Puerto Rico';
  if (lower.startsWith('colombia') || lower.includes('república de colombia') || lower.includes('nueva granada')) {
    return 'Colombia';
  }
  if (lower.includes('ecuador')) return 'Ecuador';
  if (lower.includes('guatemala')) return 'Guatemala';
  if (lower.includes('panamá') || lower.includes('panama')) return 'Panamá';
  if (lower.includes('españa') || lower.includes('nueva granada')) return 'España';

  const segs = catalogPath.split('/').filter(Boolean);
  const section = segs[1] || '';
  if (section === 'colombia') return 'Colombia';
  if (section === 'puerto-rico') return 'Puerto Rico';
  if (section === 'ecuador') return 'Ecuador';
  if (section === 'polimero-mundial') {
    const slug = segs[2] || '';
    const known = Object.keys(POLYMER_COUNTRY).sort((a, b) => b.length - a.length);
    for (const key of known) {
      if (slug === key || slug.startsWith(`${key}-`)) return POLYMER_COUNTRY[key];
    }
  }
  if (
    [
      'certificados-de-pago-militar',
      'reserva-federal',
      'departamento-del-tesoro-de-ee-uu',
      'moneda-colonial',
      'emisiones-promocionales',
      'food-coupons-usda',
      'pop-art',
      'billete-obsoleto-estados-unidos',
    ].includes(section)
  ) {
    return 'Estados Unidos';
  }
  if (section === 'moneda-colonial-espanola') return 'España';

  // Flat U.S. leaves under /coleccion/<slug>/
  if (segs.length >= 2 && !HUB_PATHS.has(catalogPath)) return 'Estados Unidos';
  return text || 'Otros';
}

function normalizeMaterial(raw, pathValue, keywords, kind) {
  const blob = `${raw} ${pathValue} ${keywords.join(' ')}`.toLowerCase();
  if (/h[ií]brido|hybrid|optiks|varifeye/.test(blob)) return 'híbrido';
  if (/pol[ií]mero|polymer|guardian|safeguard|tyvek/.test(blob)) return 'polímero';
  if (kind === 'coin') return 'metal';
  if (/papel|paper|algod[oó]n|trapo/.test(blob)) return 'papel';
  return raw ? 'papel' : '';
}

function detectKind(pathValue, title, keywords, emissionType) {
  const blob = `${pathValue} ${title} ${keywords.join(' ')} ${emissionType}`.toLowerCase();
  if (pathValue.includes('/moneda-colonial-espanola/') && !HUB_PATHS.has(pathValue)) return 'coin';
  if (/specimen|esp[eé]cimen/.test(blob)) return 'specimen';
  if (/\berror\b|errores de imprenta|descentrad/.test(blob)) return 'error';
  return 'banknote';
}

function extractYear(...values) {
  for (const value of values) {
    const match = String(value || '').match(/(1[7-9]\d{2}|20\d{2})/);
    if (match) return Number(match[1]);
  }
  return null;
}

function titleClean(title = '') {
  return title.replace(/\s*\|\s*Notofilia\s*$/i, '').trim();
}

function firstImage(data) {
  if (data.ogImage) return data.ogImage.startsWith('/') ? data.ogImage : `/${data.ogImage}`;
  const match = String(data.template || '').match(
    /(?:image-webp|image|src)=["']([^"']+\.(?:webp|jpe?g|png))["']/i,
  );
  if (!match) return '';
  const src = match[1].replace(/^\.\//, '');
  if (src.startsWith('/')) return src;
  if (src.startsWith('uploads/')) return `/${src}`;
  return `/${src}`;
}

const files = (await readdir(CATALOG_DIR)).filter((f) => f.endsWith('.json')).sort();
const items = [];
const hubs = [];
const countryCounts = new Map();

for (const file of files) {
  const raw = await readFile(path.join(CATALOG_DIR, file), 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    continue;
  }
  if (!data.path || !data.title) continue;

  const id = file.replace(/\.json$/, '');
  const keywords = Array.isArray(data.keywords) ? data.keywords : [];
  const template = data.template || '';
  const isProfile = data.path.includes('/perfil-') || data.ogType === 'profile';
  const isHub = data.ogType === 'website' || HUB_PATHS.has(data.path);

  const base = {
    id,
    path: data.path,
    title: titleClean(data.title),
    description: data.description || '',
    keywords,
    url: SITE + data.path,
    image: firstImage(data),
    ogType: data.ogType || 'article',
  };

  if (isHub) {
    hubs.push({
      ...base,
      role: 'hub',
    });
    continue;
  }

  if (isProfile) {
    items.push({
      ...base,
      role: 'profile',
      country: normalizeCountry(fact(template, 'País'), data.path),
      kind: 'profile',
    });
    continue;
  }

  const countryRaw = fact(template, 'País');
  const issuer = fact(template, 'Entidad Emisora');
  const denomination = fact(template, 'Denominación');
  const catalogRef = fact(template, 'Referencia de Catálogo');
  const condition = fact(template, 'Condición');
  const emissionType = fact(template, 'Tipo de Emisión');
  const dateLabel =
    fact(template, 'Fecha de Emisión') ||
    fact(template, 'Fecha') ||
    fact(template, 'Año');
  const materialRaw = fact(template, 'Material') || fact(template, 'Composición');
  const kind = detectKind(data.path, data.title, keywords, emissionType);
  const material = normalizeMaterial(materialRaw, data.path, keywords, kind);
  const country = normalizeCountry(countryRaw, data.path);
  const year = extractYear(dateLabel, denomination, data.title, data.path);

  countryCounts.set(country, (countryCounts.get(country) || 0) + 1);

  items.push({
    ...base,
    role: 'piece',
    country,
    issuer,
    denomination,
    catalogRef,
    condition,
    emissionType,
    dateLabel,
    year,
    material,
    kind,
    searchText: [
      titleClean(data.title),
      data.description,
      country,
      issuer,
      denomination,
      catalogRef,
      condition,
      material,
      kind,
      ...keywords,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  });
}

const countries = [...countryCounts.entries()]
  .map(([name, count]) => ({ name, count, slug: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }))
  .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));

await mkdir(OUT_DIR, { recursive: true });
await writeFile(
  OUT_FILE,
  `${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: items.length,
      pieceCount: items.filter((i) => i.role === 'piece').length,
      countries,
      hubs,
      items,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Wrote ${items.length} catalog entries (${countries.length} countries) to ${path.relative(ROOT, OUT_FILE)}`,
);
