#!/usr/bin/env node
/**
 * Compile Markdown fichas in src/content/fichas/ into catalog JSON.
 * Spanish `*.md` (except `*.en.md`) is the source of truth; optional
 * `*.en.md` supplies the English body and overlay strings.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let yaml;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FICHAS = join(ROOT, 'src/content/fichas');
const CATALOG = join(ROOT, 'src/content/catalog');
const UPLOADS = join(ROOT, 'public/uploads');
const SITE = 'https://notofilia.com';

const KIND_FROM_TIPO = {
  billete: 'banknote',
  moneda: 'coin',
  prueba: 'banknote',
  specimen: 'banknote',
  error: 'banknote',
  medalla: 'coin',
  otro: 'other',
};

function splitFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error('Markdown ficha is missing YAML frontmatter');
  }
  return {
    data: yaml.load(match[1]) || {},
    body: match[2].replace(/^\uFEFF/, '').trim(),
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function newWindowHint(locale) {
  return locale === 'en'
    ? '<span class="new-window-hint"> (opens in a new tab)</span>'
    : '<span class="new-window-hint"> (se abre en una pestaña nueva)</span>';
}

function pictureForUpload(src, alt, { eager = false } = {}) {
  const file = basename(src);
  const stem = file.replace(/\.(jpe?g|png|webp)$/i, '');
  const webp = existsSync(join(UPLOADS, `${stem}.webp`)) ? `/uploads/${stem}.webp` : '';
  const webp640 = existsSync(join(UPLOADS, `${stem}-640.webp`))
    ? `/uploads/${stem}-640.webp`
    : '';
  const known = {
    'philippines-treasury-certificate-1-peso-victory-series-66-5c220d39.jpg': { w: 1148, h: 1370 },
    'philippines-treasury-certificate-2-pesos-victory-series-66-cc5b2834.jpg': { w: 1024, h: 1536 },
  }[file];
  const loading = eager ? 'eager' : 'lazy';
  const fetch = eager ? ' fetchpriority="high"' : '';
  const dims = known ? ` width="${known.w}" height="${known.h}"` : '';
  const img = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${dims} loading="${loading}"${fetch} decoding="async" />`;
  if (!webp) return img;
  const srcset = webp640 ? `${webp640} 640w, ${webp} 1280w` : webp;
  const sizes = '(max-width: 640px) 100vw, 760px';
  return `<picture><source srcset="${srcset}" sizes="${sizes}" type="image/webp" />${img}</picture>`;
}

function renderInline(text, locale, { eagerFirstImage = false } = {}) {
  let out = '';
  let i = 0;
  let eagerUsed = false;
  while (i < text.length) {
    if (text.startsWith('![', i)) {
      const closeAlt = text.indexOf(']', i + 2);
      const openParen = closeAlt >= 0 ? text.indexOf('(', closeAlt) : -1;
      const closeParen = openParen >= 0 ? text.indexOf(')', openParen) : -1;
      if (closeAlt > i && openParen === closeAlt + 1 && closeParen > openParen) {
        const alt = text.slice(i + 2, closeAlt);
        const src = text.slice(openParen + 1, closeParen).trim();
        const eager = eagerFirstImage && !eagerUsed;
        eagerUsed = eagerUsed || eager;
        out += pictureForUpload(src, alt, { eager });
        i = closeParen + 1;
        continue;
      }
    }
    if (text.startsWith('[', i)) {
      const closeLabel = text.indexOf(']', i + 1);
      const openParen = closeLabel >= 0 ? text.indexOf('(', closeLabel) : -1;
      const closeParen = openParen >= 0 ? text.indexOf(')', openParen) : -1;
      if (closeLabel > i && openParen === closeLabel + 1 && closeParen > openParen) {
        const label = renderInline(text.slice(i + 1, closeLabel), locale);
        const href = text.slice(openParen + 1, closeParen).trim();
        const external = /^https?:\/\//i.test(href);
        const attrs = external
          ? ` href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"`
          : ` href="${escapeHtml(href)}"`;
        const hint = external ? newWindowHint(locale) : '';
        out += `<a${attrs}>${label}${hint}</a>`;
        i = closeParen + 1;
        continue;
      }
    }
    if (text.startsWith('**', i)) {
      const end = text.indexOf('**', i + 2);
      if (end > i) {
        out += `<strong>${renderInline(text.slice(i + 2, end), locale)}</strong>`;
        i = end + 2;
        continue;
      }
    }
    if (text.startsWith('*', i) && !text.startsWith('**', i)) {
      const end = text.indexOf('*', i + 1);
      if (end > i) {
        out += `<em>${renderInline(text.slice(i + 1, end), locale)}</em>`;
        i = end + 1;
        continue;
      }
    }
    if (text[i] === '<') {
      const end = text.indexOf('>', i);
      if (end > i) {
        out += text.slice(i, end + 1);
        i = end + 1;
        continue;
      }
    }
    const next = text.slice(i).search(/!\[|\[|\*\*|\*|</);
    if (next === -1) {
      out += escapeHtml(text.slice(i)).replace(/\n/g, '<br />');
      break;
    }
    if (next === 0) {
      out += escapeHtml(text[i]);
      i += 1;
      continue;
    }
    out += escapeHtml(text.slice(i, i + next)).replace(/\n/g, '<br />');
    i += next;
  }
  return out;
}

function heading(line) {
  const match = line.match(/^(#{2,4})\s+(.+)$/);
  if (!match) return null;
  const level = match[1].length;
  return { level, text: match[2].trim() };
}

function isListLine(line) {
  return /^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line);
}

function markdownToHtml(markdown, locale) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  let firstImage = true;
  const inline = (text) => {
    const eager = firstImage;
    const out = renderInline(text, locale, { eagerFirstImage: eager && firstImage });
    if (text.includes('![') && firstImage) firstImage = false;
    return out;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim().startsWith('<') && !line.trim().startsWith('<http')) {
      const chunk = [];
      while (i < lines.length && lines[i].trim()) {
        chunk.push(lines[i]);
        i += 1;
      }
      html.push(chunk.join('\n'));
      continue;
    }

    const h = heading(line.trim());
    if (h) {
      html.push(`<h${h.level}>${inline(h.text)}</h${h.level}>`);
      i += 1;
      continue;
    }

    if (line.startsWith('>')) {
      const quote = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quote.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      html.push(`<blockquote>${inline(quote.join('\n'))}</blockquote>`);
      continue;
    }

    if (isListLine(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      while (i < lines.length && isListLine(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+|^\d+\.\s+/, ''));
        i += 1;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(
        `<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`,
      );
      continue;
    }

    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !heading(lines[i].trim()) &&
      !lines[i].startsWith('>') &&
      !isListLine(lines[i]) &&
      !(lines[i].trim().startsWith('<') && !lines[i].trim().startsWith('<http'))
    ) {
      para.push(lines[i]);
      i += 1;
    }
    html.push(`<p>${inline(para.join('\n'))}</p>`);
  }

  return html.join('\n');
}

function slash(pathValue) {
  if (!pathValue) return pathValue;
  return pathValue.endsWith('/') ? pathValue : `${pathValue}/`;
}

function catalogFileName(id, ruta) {
  if (typeof id === 'string' && id.startsWith('NF.')) {
    return `${id.slice(3).replace(/\./g, '--')}.json`;
  }
  const slug = slash(ruta)
    .replace(/^\/coleccion\//, '')
    .replace(/\/$/, '')
    .replace(/\//g, '--');
  return `${slug}.json`;
}

function mapKind(data) {
  if (data.kind) return data.kind;
  if (data.tipo && KIND_FROM_TIPO[data.tipo]) return KIND_FROM_TIPO[data.tipo];
  return 'other';
}

function asRelated(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (typeof item === 'string') return null;
      if (item && item.href && item.title) return { href: item.href, title: item.title };
      return null;
    })
    .filter(Boolean);
}

function asSources(list) {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      if (!item || !item.label) return null;
      const source = { label: String(item.label) };
      if (item.kind) source.kind = item.kind;
      if (item.url) source.url = item.url;
      if (item.note) source.note = item.note;
      return source;
    })
    .filter(Boolean);
}

function clip(value, max) {
  const t = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}

function compileOne(esPath) {
  const esRaw = readFileSync(esPath, 'utf8');
  const es = splitFrontmatter(esRaw);
  const enPath = esPath.replace(/\.md$/, '.en.md');
  const en = existsSync(enPath) ? splitFrontmatter(readFileSync(enPath, 'utf8')) : null;

  const ruta = slash(es.data.ruta);
  const rutaEn = slash(es.data.ruta_en || en?.data.ruta_en);
  if (!ruta || !ruta.startsWith('/coleccion/')) {
    throw new Error(`${basename(esPath)} needs ruta starting with /coleccion/`);
  }
  if (!rutaEn || !rutaEn.startsWith('/en/')) {
    throw new Error(`${basename(esPath)} needs ruta_en starting with /en/`);
  }

  const title = es.data.titulo || es.data.title;
  const subtitle = es.data.subtitulo || '';
  const description = clip(
    es.data.descripcion_seo || es.data.descripcion_corta || '',
    150,
  );
  const seoTitle = clip(es.data.titulo_seo || `${title} | Notofilia`, 60);
  const enTitleVisible = en?.data.titulo || es.data.titulo_en || title;
  const enSeoTitle = clip(
    en?.data.titulo_seo || es.data.titulo_seo_en || `${enTitleVisible} | Notofilia`,
    60,
  );
  const enDescription = clip(
    en?.data.descripcion_seo ||
      es.data.descripcion_en ||
      en?.data.descripcion_corta ||
      description,
    150,
  );

  const esHtml = markdownToHtml(es.body, 'es');
  const enHtml = markdownToHtml(en?.body || es.body, 'en');
  const id = es.data.id || `NF.${ruta.replace(/^\/+|\/+$/g, '').replace(/^coleccion\//, '').replace(/\//g, '.')}`;
  const legacyFile = es.data.legacyFile;
  if (!legacyFile) throw new Error(`${basename(esPath)} needs legacyFile`);

  const ogImage = es.data.ogImage || es.data.imagenes?.anverso || undefined;
  const cards = Array.isArray(es.data.cards) ? es.data.cards : [];
  const related = asRelated(es.data.related || es.data.piezas_relacionadas);
  const sources = asSources(es.data.fuentes);
  const country = es.data.pais;
  const issuer = es.data.entidad_emisora;
  const honesty = {
    printRun: es.data.tirada,
    knownVarieties: es.data.variedades_conocidas || es.data.variedades,
    circulationDates: es.data.fechas_circulacion,
    rarityBasis: es.data.base_rareza,
    shownSpecimenState: es.data.estado_ejemplar,
    factualReviewDate: es.data.fecha_ultima_revision,
  };

  const metadata = {
    denomination: es.data.denominacion,
    currency: es.data.moneda,
    issuer,
    printer: es.data.impresor,
    issueDate: es.data.fecha_emision,
    series: es.data.serie,
    serialNumber: es.data.numero_serie,
    catalogNumber: es.data.numero_catalogo,
    material: es.data.material,
    dimensions: es.data.dimensiones,
    condition: es.data.condicion,
    ...Object.fromEntries(Object.entries(honesty).filter(([, v]) => v != null && v !== '')),
  };

  const crumbs = [
    { name: 'Notofilia', href: '/' },
    ...(Array.isArray(es.data.breadcrumb) ? es.data.breadcrumb : []),
  ];
  if (!crumbs.some((c) => !c.href)) {
    crumbs.push({ name: title });
  }

  const hasPart = Array.isArray(es.data.hasPart) ? es.data.hasPart : cards.map((card) => ({
    '@type': 'CreativeWork',
    name: card.title,
    url: `${SITE}${card.href}`,
  }));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          ...(crumb.href ? { item: `${SITE}${crumb.href}` } : { item: `${SITE}${ruta}` }),
        })),
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE}${ruta}#page`,
        name: title,
        url: `${SITE}${ruta}`,
        description,
        inLanguage: 'es',
        hasPart,
      },
      {
        '@type': 'CreativeWork',
        name: title,
        url: `${SITE}${ruta}`,
        ...(ogImage ? { image: `${SITE}${ogImage}` } : {}),
        description,
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}${ruta}#page` },
        identifier: id,
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Identificador permanente', value: id },
        ],
      },
    ],
  };

  const sourceHash = createHash('sha1')
    .update(esRaw)
    .update(existsSync(enPath) ? readFileSync(enPath, 'utf8') : '')
    .digest('hex')
    .slice(0, 16);

  const out = {
    path: ruta,
    title: seoTitle,
    description,
    keywords: Array.isArray(es.data.palabras_clave) ? es.data.palabras_clave : [],
    robots: 'index, follow, max-image-preview:large',
    ogType: es.data.ogType || 'website',
    ogTitle: clip(es.data.ogTitle || title, 70),
    ogDescription: description,
    ...(ogImage ? { ogImage } : {}),
    jsonLd,
    styles: '',
    template: esHtml,
    logic: '',
    record: {
      id,
      kind: mapKind(es.data),
      title,
      ...(subtitle ? { subtitle } : {}),
      dateOrSeries: es.data.serie || es.data.dateOrSeries,
      country,
      issuer,
      breadcrumb: crumbs,
      metadata,
      sources,
      resourced: Boolean(es.data.resourced),
      related,
      ...(cards.length ? { cards } : {}),
      eyebrow: es.data.eyebrow || [country, issuer, es.data.serie].filter(Boolean).join(' · '),
      render: es.data.render || 'primary',
    },
    legacyFile,
    sourceHash,
    i18n: {
      en: {
        path: rutaEn,
        title: enSeoTitle,
        description: enDescription,
        ogTitle: clip(en?.data.ogTitle || enTitleVisible, 70),
        ogDescription: enDescription,
        template: enHtml,
        recordTitle: enTitleVisible,
        eyebrow:
          en?.data.eyebrow ||
          es.data.eyebrow_en ||
          [en?.data.pais, en?.data.entidad_emisora, en?.data.serie]
            .filter(Boolean)
            .join(' · '),
      },
    },
  };

  const dest = join(CATALOG, catalogFileName(id, ruta));
  writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
  return dest;
}

async function main() {
  try {
    yaml = (await import('js-yaml')).default;
  } catch {
    console.error('compile-fichas requires js-yaml. Install with: npm i -D js-yaml');
    process.exit(1);
  }
  if (!existsSync(FICHAS)) {
    console.log('compile-fichas: no src/content/fichas/ directory');
    return;
  }
  const files = readdirSync(FICHAS).filter(
    (file) => file.endsWith('.md') && !file.endsWith('.en.md') && !file.startsWith('_'),
  );
  if (files.length === 0) {
    console.log('compile-fichas: no markdown fichas');
    return;
  }
  const written = files.map((file) => compileOne(join(FICHAS, file)));
  console.log(`compile-fichas: wrote ${written.length} catalog JSON file(s)`);
  for (const file of written) console.log(`  ${file.replace(`${ROOT}/`, '')}`);
}

await main();
