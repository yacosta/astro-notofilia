#!/usr/bin/env node
/**
 * Add i18n.en overlays for catalog JSON files that lack an English pair.
 * Does not mutate Spanish path/template. Skips records that already have i18n.en.template.
 *
 * Usage:
 *   node scripts/generate-catalog-en-pairs.mjs           # write overlays
 *   node scripts/generate-catalog-en-pairs.mjs --dry-run # leftovers only
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOG = join(ROOT, 'src/content/catalog');
const AUDIT = join(ROOT, 'docs/i18n/AUDIT.md');
const DICT_PATH = join(ROOT, 'src/i18n/catalog-es-en.json');
const SUPPLEMENT_PATH = join(ROOT, 'src/i18n/catalog-es-en-supplement.json');
const PATH_MAP_OUT = join(ROOT, 'src/i18n/catalog-en-path-map.json');
const DRY = process.argv.includes('--dry-run');
const SKIP_HUBS = process.argv.includes('--skip-hubs');
const FORCE_PIECES = process.argv.includes('--force-pieces');
const CARDS_ONLY = process.argv.includes('--cards-only');
const LEFTOVER_PATH = DRY
  ? '/tmp/catalog-en-leftovers.json'
  : '/tmp/catalog-en-leftovers.json';

const MONTHS = {
  enero: 'January',
  febrero: 'February',
  marzo: 'March',
  abril: 'April',
  mayo: 'May',
  junio: 'June',
  julio: 'July',
  agosto: 'August',
  septiembre: 'September',
  octubre: 'October',
  noviembre: 'November',
  diciembre: 'December',
};

const SHORT_ALLOW = new Set([
  'País',
  'Año',
  'Tipo',
  'Tema',
  'Serie',
  'Fecha',
  'Valor',
  'Firma',
  'Firmas',
  'Firma:',
  'Firmas:',
  'Ceca',
  'Ley',
  'Anverso',
  'Reverso',
  'Color',
  'Tamaño',
  'Papel',
  'Metal',
  'Peso',
  'Canto',
  'Tirada',
  'Rareza',
  'Notas',
  'Notas:',
  'Título',
  'Diseño',
  'Emisión',
  'Edición',
  'Fuentes',
  'Ampliar',
  'Cerrar',
  'Alejar',
  'Acercar',
  'Artista',
  'Número',
  'Origen',
  'Medio',
  'Monto',
  'Grado',
]);

const SKIP_BLOCKS = /<(script|style|noscript|code|pre)\b[\s\S]*?<\/\1>/gi;

const EXTRA_PHRASES = [
  ['Ruta de navegación', 'Breadcrumb'],
  ['Perfil Histórico', 'Historical Profile'],
  ['Perfil histórico', 'Historical profile'],
  ['Cupones de Alimentos', 'Food Coupons'],
  ['Cupones de alimentos', 'Food coupons'],
  ['Certificados de Pago Militar', 'Military Payment Certificates'],
  ['Emisiones impresas en el extranjero', 'Issues printed abroad'],
  ['Emisiones promocionales', 'Promotional issues'],
  ['Banca libre', 'Free banking'],
  ['Papel moneda colonial', 'Colonial paper money'],
  ['Acuñación colonial española', 'Spanish colonial coinage'],
  ['Mundo polímero', 'World polymer'],
  ['Reserva Federal', 'Federal Reserve'],
  ['Estados Unidos — Tesoro', 'United States — Treasury'],
  ['Estados Unidos obsoletos', 'United States obsolete'],
  ['Billete obsoleto de Estados Unidos', 'Obsolete United States banknotes'],
  ['Departamento del Tesoro de EE. UU.', 'U.S. Department of the Treasury'],
  ['Departamento del Tesoro de EE UU', 'U.S. Department of the Treasury'],
  ['anverso arriba y reverso abajo', 'obverse above and reverse below'],
  ['anverso a la izquierda, reverso a la derecha', 'obverse on the left, reverse on the right'],
  ['anverso a la izquierda y reverso a la derecha', 'obverse on the left and reverse on the right'],
  ['anverso (arriba) y reverso (abajo)', 'obverse (top) and reverse (bottom)'],
  ['en un solo encuadre', 'in a single frame'],
  ['en un solo archivo', 'in a single file'],
  ['en un único encuadre', 'in a single frame'],
  ['en un único archivo', 'in a single file'],
  ['Fotografía de estudio del', 'Studio photograph of the'],
  ['Fotografía de estudio de', 'Studio photograph of'],
  ['Fotografía de estudio', 'Studio photograph'],
  ['Ejemplar de gabinete', 'Cabinet specimen'],
  ['Ejemplar de colección', 'Collection specimen'],
  ['Ejemplar mostrado', 'Shown specimen'],
  ['Estado del ejemplar mostrado', 'Condition of the shown specimen'],
  ['Fecha de última revisión factual', 'Date of last factual review'],
  ['Base de la rareza', 'Rarity basis'],
  ['Variedades conocidas', 'Known varieties'],
  ['Fechas de circulación', 'Circulation dates'],
  ['no confirmado', 'unconfirmed'],
  ['No confirmado', 'Unconfirmed'],
  ['sin confirmar', 'unconfirmed'],
  ['Pieza de la colección', 'Collection piece'],
  ['Ficha de catálogo', 'Catalog record'],
  ['Colección numismática', 'Numismatic collection'],
  ['volver al índice', 'back to the index'],
  ['Volver al índice', 'Back to the index'],
  ['ver ficha', 'view record'],
  ['Ver ficha', 'View record'],
  ['ver colección', 'view collection'],
  ['Ver colección', 'View collection'],
  ['Sobre la Obra', 'About the Work'],
  ['Sobre la obra', 'About the work'],
  ['Arrastra para mover', 'Drag to pan'],
  ['Rueda del ratón para ampliar', 'Scroll wheel to zoom'],
  ['vista ampliada', 'enlarged view'],
  ['Denominación Facial', 'Face denomination'],
  ['Denominación facial', 'Face denomination'],
  ['Clasificación', 'Classification'],
  ['Dimensiones', 'Dimensions'],
  ['Contexto Histórico', 'Historical Context'],
  ['Polímero mundial', 'World polymer'],
  ['Billetes de polímero', 'Polymer banknotes'],
  ['anverso y reverso', 'obverse and reverse'],
  ['Anverso y reverso', 'Obverse and reverse'],
  ['Billete obsoleto de', 'Obsolete banknote of'],
  ['Billete de', 'Banknote of'],
  ['Billetes de', 'Banknotes of'],
  ['Sello Rojo', 'Red Seal'],
  ['sello rojo', 'red seal'],
  ['Polímero', 'Polymer'],
  ['polímero', 'polymer'],
  ['Espécimen', 'Specimen'],
  ['espécimen', 'specimen'],
  ['Sobreimpresión', 'Overprint'],
  ['sobreimpresión', 'overprint'],
  ['Gema sin circular', 'Gem uncirculated'],
  ['Míchigan', 'Michigan'],
  ['Nueva Jersey', 'New Jersey'],
  ['anverso', 'obverse'],
  ['reverso', 'reverse'],
  ['Anverso', 'Obverse'],
  ['Reverso', 'Reverse'],
  ['billete', 'banknote'],
  ['Billete', 'Banknote'],
  ['billetes', 'banknotes'],
  ['Billetes', 'Banknotes'],
  ['catálogo', 'catalog'],
  ['Catálogo', 'Catalog'],
];

export function parseAuditPaths() {
  const md = readFileSync(AUDIT, 'utf8');
  const map = new Map();
  map.set('/coleccion/', '/en/collection/');
  map.set('/coleccion/numismatica/', '/en/collection/numismatics/');

  const tableRe =
    /^\| (?:banknote|coin|profile|hub|other) \| `(\/coleccion\/[^`]+)` \| `(\/en\/collection\/[^`]+)` \|/gm;
  let m;
  while ((m = tableRe.exec(md))) {
    map.set(m[1], m[2]);
  }

  const hubRe = /^\| `(\/coleccion\/[^`]+)` \| `(\/en\/collection\/[^`]+)` \|/gm;
  while ((m = hubRe.exec(md))) {
    if (!map.has(m[1])) map.set(m[1], m[2]);
  }

  return map;
}

function loadDict() {
  const raw = JSON.parse(readFileSync(DICT_PATH, 'utf8'));
  const exact = new Map();
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string' && k) exact.set(k, v);
  }
  if (existsSync(SUPPLEMENT_PATH)) {
    const extra = JSON.parse(readFileSync(SUPPLEMENT_PATH, 'utf8'));
    for (const [k, v] of Object.entries(extra)) {
      if (typeof v === 'string' && k) exact.set(k, v);
    }
  }
  for (const [es, en] of EXTRA_PHRASES) exact.set(es, en);

  const HAS_ACCENT = /[áéíóúñüÁÉÍÓÚÑÜ]/;
  const SAFE_WORD = new Set([
    ...SHORT_ALLOW,
    'anverso',
    'reverso',
    'Anverso',
    'Reverso',
    'polímero',
    'Polímero',
    'espécimen',
    'Espécimen',
    'billete',
    'Billete',
    'billetes',
    'Billetes',
    'catálogo',
    'Catálogo',
  ]);
  const long = [...exact.entries()]
    .filter(([k]) => {
      if (SAFE_WORD.has(k) || SHORT_ALLOW.has(k)) return true;
      if (k.includes(' ')) return k.length >= 6;
      if (HAS_ACCENT.test(k) && k.length >= 5) return true;
      return k.length >= 16;
    })
    .sort((a, b) => b[0].length - a[0].length);
  return { exact, long };
}

const DATE_RE =
  /(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de (\d{4})/gi;

function formatDate(day, monthEs, year) {
  return `${MONTHS[monthEs.toLowerCase()]} ${Number(day)}, ${year}`;
}

function translateDatesIn(s) {
  return s.replace(DATE_RE, (_, day, monthEs, year) => formatDate(day, monthEs, year));
}

function translateDate(s) {
  const m = s.match(
    /^(\d{1,2}) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de (\d{4})$/i,
  );
  if (!m) return null;
  return formatDate(m[1], m[2], m[3]);
}

function applyLong(s, long) {
  let out = s;
  for (const [es, en] of long) {
    if (out.includes(es)) out = out.split(es).join(en);
  }
  return out;
}

export function translateText(s, exact, long) {
  const original = s;
  const t = s.replace(/\s+/g, ' ').trim();
  if (!t) return original;
  if (exact.has(t)) return exact.get(t);
  if (exact.has(original.trim())) return exact.get(original.trim());
  const dated = translateDate(t);
  if (dated) return dated;

  const withDates = translateDatesIn(t);
  if (exact.has(withDates)) return exact.get(withDates);

  const ampImg = t.match(/^Ampliar imagen del (.+)$/i);
  if (ampImg) return `Enlarge image of the ${applyLong(ampImg[1], long)}`;
  if (/^Billete ampliado$/i.test(t)) return 'Enlarged banknote';
  if (/^Imagen ampliada$/i.test(t)) return 'Enlarged image';
  const amp2 = t.match(/^(.+) ampliado$/i);
  if (amp2 && !/enlarged/i.test(amp2[1])) {
    return `Enlarged ${applyLong(amp2[1], long)}`;
  }
  const perfil = t.match(/^Perfil Histórico · (.+)$/i);
  if (perfil) return `Historical Profile · ${applyLong(perfil[1], long)}`;
  const stacked = t.match(/^(.+): anverso y reverso(?: stacked)?$/i);
  if (stacked) return `${applyLong(stacked[1], long)}: obverse and reverse`;

  return applyLong(withDates === t ? original : withDates, long);
}

function escapeAttr(s) {
  return s.replace(/&(?![a-zA-Z]+;|#\d+;|#x[0-9a-fA-F]+;)/g, '&amp;').replace(/"/g, '&quot;');
}

function rewriteHref(href, pathMap) {
  const m = href.match(/^(https:\/\/notofilia\.com)?(\/coleccion\/[^?#]*)(\?[^#]*)?(#.*)?$/);
  if (!m) return href;
  const origin = m[1] || '';
  let path = m[2];
  const query = m[3] || '';
  const hash = m[4] || '';
  const lookup = path.endsWith('/') ? path : `${path}/`;
  const mapped = pathMap.get(lookup) || pathMap.get(path);
  if (!mapped) return href;
  const mappedPath = path.endsWith('/') ? mapped : mapped.replace(/\/$/, '');
  return `${origin}${mappedPath}${query}${hash}`;
}

function rewriteTemplate(html, pathMap, exact, long, leftovers) {
  const skipped = [];
  const withHoles = html.replace(SKIP_BLOCKS, (block) => {
    skipped.push(block);
    return `\u0000SKIP${skipped.length - 1}\u0000`;
  });

  let out = withHoles.replace(/\blang="es"/g, 'lang="en"');

  out = out.replace(
    /(href|content|src)="((?:https:\/\/notofilia\.com)?\/coleccion\/[^"]+)"/g,
    (_, attr, href) => `${attr}="${rewriteHref(href, pathMap)}"`,
  );

  out = out.replace(/data-pagefind-meta="url:([^"]+)"/g, (_, url) => {
    return `data-pagefind-meta="url:${rewriteHref(url, pathMap)}"`;
  });

  out = out.replace(
    /(alt|aria-label|title|aria-roledescription|data-screen-label)="([^"]*)"/g,
    (full, attr, val) => {
      const next = translateText(val, exact, long);
      if (next === val && /[áéíóúñüÁÉÍÓÚÑÜ]/.test(val)) leftovers.add(val);
      return `${attr}="${escapeAttr(next)}"`;
    },
  );

  out = out.replace(/>([^<]+)</g, (full, text) => {
    if (!/[A-Za-zÁÉÍÓÚáéíóúÑñÜü]/.test(text)) return full;
    const next = translateText(text, exact, long);
    if (next === text && /[áéíóúñüÁÉÍÓÚÑÜ]/.test(text)) leftovers.add(text.replace(/\s+/g, ' ').trim());
    return `>${next}<`;
  });

  return out.replace(/\u0000SKIP(\d+)\u0000/g, (_, index) => skipped[Number(index)] ?? '');
}

function clip(s, n) {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n - 1);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}

function translateMeta(val, exact, long) {
  if (typeof val !== 'string' || !val) return val;
  return translateText(val, exact, long);
}

function seoTitle(val, exact, long) {
  const translated = translateMeta(val, exact, long);
  if (typeof translated !== 'string') return translated;
  const suffix = ' | Notofilia';
  if (translated.endsWith(suffix) || translated.endsWith('| Notofilia')) {
    const core = translated.replace(/\s*\|\s*Notofilia\s*$/, '');
    return `${clip(core, 60 - suffix.length)}${suffix}`.replace(/\s+\|/, ' |');
  }
  return clip(translated, 60);
}

function addAltEn(images, exact, long) {
  if (!images || typeof images !== 'object') return;
  for (const key of Object.keys(images)) {
    const img = images[key];
    if (img && typeof img === 'object' && img.alt) {
      img.altEn = translateText(img.alt, exact, long);
    }
  }
}

function addCardEn(rec, exact, long) {
  const cards = rec.record?.cards;
  if (!Array.isArray(cards)) return false;
  let changed = false;
  for (const card of cards) {
    if (card.alt && !card.altEn) {
      const next = translateText(card.alt, exact, long);
      if (next) {
        card.altEn = next;
        changed = true;
      }
    }
    if (card.title && !card.titleEn) {
      const next = translateText(card.title, exact, long);
      if (next !== card.title) {
        card.titleEn = next;
        changed = true;
      }
    }
  }
  return changed;
}

function remainingSpanish(html) {
  const text = html
    .replace(SKIP_BLOCKS, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ');
  return /[áéíóúñüÁÉÍÓÚÑÜ]/.test(text);
}

export function buildPathMap() {
  const pathMap = parseAuditPaths();
  const files = readdirSync(CATALOG).filter((f) => f.endsWith('.json'));
  const missingAudit = [];
  for (const file of files) {
    const rec = JSON.parse(readFileSync(join(CATALOG, file), 'utf8'));
    if (rec.i18n?.en?.path && rec.path) {
      pathMap.set(rec.path, rec.i18n.en.path);
    }
    if (rec.path && !pathMap.has(rec.path)) {
      const guessed = rec.path.replace(/^\/coleccion\//, '/en/collection/');
      pathMap.set(rec.path, guessed);
      missingAudit.push({ file, esPath: rec.path, guessed });
    }
  }
  return { pathMap, missingAudit, files };
}

function main() {
  const { pathMap, missingAudit, files } = buildPathMap();
  writeFileSync(
    PATH_MAP_OUT,
    `${JSON.stringify(Object.fromEntries([...pathMap.entries()].sort()), null, 2)}\n`,
  );

  const { exact, long } = loadDict();
  const leftovers = new Set();
  let skipped = 0;
  let written = 0;
  const stillSpanish = [];

  if (!CARDS_ONLY) {
  for (const file of files) {
    const fp = join(CATALOG, file);
    const rec = JSON.parse(readFileSync(fp, 'utf8'));
    if (rec.i18n?.en?.template) {
      const isHub = rec.record?.render === 'astro-hub';
      if (isHub || !FORCE_PIECES) {
        skipped += 1;
        continue;
      }
    }
    if (SKIP_HUBS && rec.record?.render === 'astro-hub') {
      skipped += 1;
      continue;
    }
    const enPath = pathMap.get(rec.path);
    if (!enPath || !rec.template) {
      console.warn('skip (no path/template)', file);
      continue;
    }

    const template = rewriteTemplate(rec.template, pathMap, exact, long, leftovers);
    if (remainingSpanish(template)) stillSpanish.push(file);

    if (!DRY) {
      rec.i18n = rec.i18n || {};
      rec.i18n.en = {
        path: enPath,
        title: seoTitle(rec.title, exact, long),
        description: clip(translateMeta(rec.description, exact, long), 150),
        ogTitle: seoTitle(rec.ogTitle || rec.title, exact, long),
        ogDescription: clip(
          translateMeta(rec.ogDescription || rec.description, exact, long),
          150,
        ),
        template,
        recordTitle: translateMeta(rec.recordTitle ?? rec.record?.title, exact, long),
        eyebrow: translateMeta(rec.eyebrow ?? rec.record?.eyebrow, exact, long),
      };
      addAltEn(rec.images, exact, long);
      addAltEn(rec.record?.images, exact, long);
      writeFileSync(fp, `${JSON.stringify(rec, null, 2)}\n`);
    }
    written += 1;
  }
  }

  if (!DRY) {
    let hrefFixed = 0;
    for (const file of files) {
      const fp = join(CATALOG, file);
      const rec = JSON.parse(readFileSync(fp, 'utf8'));
      const enTpl = rec.i18n?.en?.template;
      if (!enTpl) continue;
      const next = enTpl
        .replace(
          /(href|content)="((?:https:\/\/notofilia\.com)?\/coleccion\/[^"]+)"/g,
          (_, attr, href) => `${attr}="${rewriteHref(href, pathMap)}"`,
        )
        .replace(
          /data-pagefind-meta="url:((?:https:\/\/notofilia\.com)?\/coleccion\/[^"]+)"/g,
          (_, url) => `data-pagefind-meta="url:${rewriteHref(url, pathMap)}"`,
        );
      if (next !== enTpl) {
        rec.i18n.en.template = next;
        hrefFixed += 1;
      }
      const cardsChanged = addCardEn(rec, exact, long);
      if (next !== enTpl || cardsChanged) {
        writeFileSync(fp, `${JSON.stringify(rec, null, 2)}\n`);
      }
    }
    console.log(JSON.stringify({ hrefFixed }, null, 2));
  }

  const leftoverObj = {
    generatedAt: new Date().toISOString(),
    dryRun: DRY,
    missingAuditPaths: missingAudit,
    uniqueSpanishLeftovers: [...leftovers].sort(),
    filesStillContainingSpanishChars: stillSpanish.sort(),
  };
  writeFileSync(LEFTOVER_PATH, `${JSON.stringify(leftoverObj, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        mode: DRY ? 'dry-run' : 'write',
        written,
        skipped,
        missingAuditPaths: missingAudit.length,
        leftoverPhrases: leftovers.size,
        filesStillContainingSpanishChars: stillSpanish.length,
        leftoverFile: LEFTOVER_PATH,
        pathMapFile: PATH_MAP_OUT,
      },
      null,
      2,
    ),
  );
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
