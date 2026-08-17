/**
 * Phase 3 — freeze legacy catalog templates into static HTML and structured
 * `record` overlays so pages can render without the dc-runtime.
 *
 * Multi-note pages expand `<sc-for>` loops from DCLogic `noteData` (see
 * `scripts/lib/catalog-freeze.mjs`). Do not re-strip Mustache to empty
 * strings before those loops have been expanded.
 *
 * Usage: node scripts/phase3-catalog-astro.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { freezeTemplate } from './lib/catalog-freeze.mjs';

const CATALOG_DIR = path.join(process.cwd(), 'src/content/catalog');
const SITE = 'https://notofilia.com';

function permanentIdFromPath(p) {
  const cleaned = p.replace(/^\/+|\/+$/g, '').replace(/^coleccion\//, '').replace(/\//g, '.');
  return `NF.${cleaned || 'unknown'}`;
}

function stripTags(html) {
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&mdash;/g, '—')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function labelValue(template, label) {
  const re = new RegExp(
    `${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</[^>]+>\\s*<[^>]+>([\\s\\S]*?)</`,
    'i',
  );
  const m = template.match(re);
  if (!m) return undefined;
  const val = stripTags(m[1]);
  return val || undefined;
}

function absUpload(src) {
  if (!src) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  return src.startsWith('/') ? src : `/${src}`;
}

function extractUploads(text) {
  return [...text.matchAll(/uploads\/[a-zA-Z0-9._\/-]+\.(?:jpg|jpeg|png|webp)/g)].map((m) => m[0]);
}

function extractImages(template, logic) {
  const fromTemplate = extractUploads(template).filter((u) => !u.endsWith('.webp'));
  const fromLogic = extractUploads(logic);
  const jpgs = [...new Set([...fromTemplate, ...fromLogic.filter((u) => /\.jpe?g$/i.test(u) || /\.png$/i.test(u))])];
  const webps = new Set(fromLogic.filter((u) => u.endsWith('.webp') && !u.includes('-640.')));
  if (jpgs.length === 0) {
    // fall back to any upload including webp→jpg guess
    const any = extractUploads(`${template}\n${logic}`);
    if (any[0]) jpgs.push(any[0].replace(/-640\.webp$/, '.jpg').replace(/\.webp$/, '.jpg'));
  }
  const primary = jpgs[0];
  if (!primary) return undefined;
  const base = primary.replace(/\.(jpe?g|png)$/i, '');
  const webp = [...webps].find((w) => w.startsWith(base)) || `${base}.webp`;
  const altMatch = template.match(/alt="([^"]{8,})"/);
  return {
    stacked: {
      src: absUpload(primary),
      srcWebp: absUpload(webp),
      alt: altMatch ? stripTags(altMatch[1]) : 'Imagen de la pieza de la colección Notofilia',
    },
    defaultView: 'stacked',
  };
}

function extractBreadcrumb(jsonLd, pathStr, title) {
  const crumbs = [];
  const graph = jsonLd?.['@graph'];
  if (Array.isArray(graph)) {
    const bc = graph.find((n) => n?.['@type'] === 'BreadcrumbList');
    if (bc?.itemListElement) {
      for (const item of bc.itemListElement) {
        const name = item?.name;
        const href = typeof item?.item === 'string'
          ? item.item.replace(SITE, '')
          : item?.item?.['@id']?.replace(SITE, '');
        if (!name) continue;
        const isLast = crumbs.length === bc.itemListElement.length - 1;
        crumbs.push(isLast || !href ? { name } : { name, href: href.endsWith('/') ? href : `${href}/` });
      }
    }
  }
  if (crumbs.length === 0) {
    crumbs.push({ name: 'Inicio', href: '/' });
    crumbs.push({ name: 'Colección', href: '/coleccion/' });
    const parts = pathStr.replace(/^\/coleccion\/|\/$/g, '').split('/');
    if (parts.length > 1) {
      crumbs.push({ name: parts[0].replace(/-/g, ' '), href: `/coleccion/${parts[0]}/` });
    }
    crumbs.push({ name: title });
  }
  // Ensure current page has no href
  if (crumbs.length) {
    const last = { ...crumbs[crumbs.length - 1] };
    delete last.href;
    crumbs[crumbs.length - 1] = last;
  }
  return crumbs.slice(0, 8);
}

function extractCards(template) {
  const cards = [];
  const re = /<dc-import\s+name="BanknoteCard"([\s\S]*?)(?:\/>|><\/dc-import>)/gi;
  let m;
  while ((m = re.exec(template))) {
    const block = m[1];
    const attr = (name) => {
      const am = block.match(new RegExp(`${name}="([^"]*)"`, 'i'));
      return am ? am[1] : '';
    };
    const href = attr('href');
    const title = attr('title');
    if (!href || !title) continue;
    cards.push({
      href: href.startsWith('/') ? href : `/${href}`,
      title,
      denomination: attr('denomination') || undefined,
      year: attr('year') || undefined,
      image: absUpload(attr('image')),
      imageWebp: absUpload(attr('image-webp') || attr('imageWebp')),
      alt: attr('alt') || title,
    });
  }
  return cards;
}

function buildMetadata(template, kind) {
  const meta = {};
  const map = [
    ['denomination', ['Denominación']],
    ['issuer', ['Entidad Emisora', 'Entidad emisora']],
    ['printer', ['Impresor']],
    ['series', ['Año de Serie', 'Serie / Número', 'Serie / Fecha', 'Serie']],
    ['serialNumber', ['Número de Serie']],
    ['issueDate', ['Fecha de Emisión', 'Año de acuñación', 'Año de Serie']],
    ['catalogNumber', ['Referencia de Catálogo', 'Referencias catalográficas', 'Referencia']],
    ['material', ['Material']],
    ['dimensions', ['Dimensiones']],
    ['composition', ['Composición']],
    ['weight', ['Peso bruto', 'Peso']],
    ['diameter', ['Diámetro']],
    ['edge', ['Canto']],
    ['mint', ['Ceca / Ensayador', 'Ceca']],
    ['condition', ['Condición', 'Rareza']],
    ['watermark', ['Marca de agua']],
  ];
  for (const [key, labels] of map) {
    for (const label of labels) {
      const val = labelValue(template, label);
      if (val) {
        meta[key] = val;
        break;
      }
    }
  }
  const country =
    labelValue(template, 'País') ||
    labelValue(template, 'País / Virreinato');
  if (kind === 'coin' && !meta.material && meta.composition) meta.material = meta.composition;
  return { meta, country };
}

function detectKind(fileName, data, cards) {
  if (cards.length) return 'hub';
  if (fileName.includes('perfil-') || data.ogType === 'profile') return 'profile';
  if (fileName.includes('moneda-') || data.path?.includes('/moneda-colonial')) return 'coin';
  return 'banknote';
}

function h1Title(template, fallback) {
  const m = template.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return fallback.replace(/\s*\|\s*Notofilia\s*$/, '');
  return stripTags(m[1]) || fallback;
}

function subtitle(template) {
  const m = template.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
  return m ? stripTags(m[1]) || undefined : undefined;
}

function eyebrow(template) {
  const m = template.match(
    /text-transform:\s*uppercase;[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
  );
  return m ? stripTags(m[1]) || undefined : undefined;
}

function migrateFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const fileName = path.basename(filePath);
  const cards = extractCards(data.template || '');
  const kind = detectKind(fileName, data, cards);
  const title = h1Title(data.template || '', data.title || fileName);
  const { meta, country } = buildMetadata(data.template || '', kind);
  const images = kind === 'hub' ? undefined : extractImages(data.template || '', data.logic || '');
  const breadcrumb = extractBreadcrumb(data.jsonLd, data.path, title);

  const existing = data.record && typeof data.record === 'object' ? data.record : {};
  const record = {
    ...existing,
    id: existing.id || permanentIdFromPath(data.path),
    kind: kind === 'hub' ? 'other' : kind,
    title: existing.title || title,
    subtitle: existing.subtitle || subtitle(data.template || ''),
    dateOrSeries: existing.dateOrSeries || meta.issueDate || meta.series || eyebrow(data.template || ''),
    country: existing.country || country,
    issuer: existing.issuer || meta.issuer,
    breadcrumb: existing.breadcrumb?.length ? existing.breadcrumb : breadcrumb,
    images: existing.images || images,
    metadata: { ...(meta || {}), ...(existing.metadata || {}) },
    sources: existing.sources,
    related: existing.related,
    previous: existing.previous,
    next: existing.next,
    context: existing.context,
    render: kind === 'hub' ? 'astro-hub' : 'astro-static',
    ...(cards.length ? { cards } : {}),
    ...(eyebrow(data.template || '') ? { eyebrow: existing.eyebrow || eyebrow(data.template || '') } : {}),
  };

  // Clean empty metadata keys
  if (record.metadata) {
    for (const [k, v] of Object.entries(record.metadata)) {
      if (v == null || v === '') delete record.metadata[k];
    }
  }

  data.record = record;
  data.template = freezeTemplate(data.template || '', data.logic || '');
  data.logic = ''; // interaction handled by catalog-zoom.js / Astro islands

  // Keep key order readable.
  const ordered = {};
  for (const key of Object.keys(data)) {
    if (key === 'legacyFile' && !ordered.record) ordered.record = data.record;
    if (key !== 'record') ordered[key] = data[key];
  }
  if (!ordered.record) ordered.record = data.record;

  fs.writeFileSync(filePath, `${JSON.stringify(ordered, null, 2)}\n`);
  return { fileName, kind, render: record.render, cards: cards.length };
}

function main() {
  const files = fs.readdirSync(CATALOG_DIR).filter((f) => f.endsWith('.json'));
  const summary = { hub: 0, piece: 0, profile: 0, cards: 0 };
  for (const file of files) {
    const result = migrateFile(path.join(CATALOG_DIR, file));
    if (result.kind === 'hub') summary.hub += 1;
    else if (result.kind === 'profile') summary.profile += 1;
    else summary.piece += 1;
    summary.cards += result.cards;
  }
  console.log(`Migrated ${files.length} catalog JSON files.`, summary);
}

main();
