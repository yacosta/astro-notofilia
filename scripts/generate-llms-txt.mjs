/**
 * Generate public/llms.txt and public/llms-full.txt (llmstxt.org).
 * Also writes alias copies at llm.txt / llm-full.txt for common misspellings.
 *
 * Run from prebuild so catalog/editorial changes stay in sync.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.notofilia.com';
const CATALOG_DIR = path.join(ROOT, 'src/content/catalog');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const NOTICIAS_DIR = path.join(ROOT, 'src/content/noticias');
const PUBLIC = path.join(ROOT, 'public');

const HUB_ORDER = [
  { path: '/coleccion/', label: 'Billete obsoleto EE. UU.' },
  { path: '/coleccion/colombia/', label: 'Billetes de Colombia' },
  { path: '/coleccion/colombia/banca-libre/', label: 'Banca libre colombiana' },
  { path: '/coleccion/colombia/emisiones-en-el-extranjero/', label: 'Emisiones colombianas en el extranjero' },
  { path: '/coleccion/puerto-rico/', label: 'Billetes de Puerto Rico' },
  { path: '/coleccion/ecuador/', label: 'Billetes de Ecuador' },
  { path: '/coleccion/polimero-mundial/', label: 'Polímero mundial' },
  { path: '/coleccion/moneda-colonial/', label: 'Moneda colonial americana (papel)' },
  { path: '/coleccion/moneda-colonial-espanola/', label: 'Moneda colonial española (oro)' },
  { path: '/coleccion/reserva-federal/', label: 'Reserva Federal' },
  { path: '/coleccion/departamento-del-tesoro-de-ee-uu/', label: 'Departamento del Tesoro EE. UU.' },
  { path: '/coleccion/certificados-de-pago-militar/', label: 'MPC (EE. UU.)' },
  { path: '/coleccion/pop-art/', label: 'Pop art / exonumia' },
  { path: '/coleccion/emisiones-promocionales/', label: 'Emisiones promocionales' },
];

const decodeEntities = (value = '') =>
  value
    .replaceAll('&ldquo;', '“')
    .replaceAll('&rdquo;', '”')
    .replaceAll('&lsquo;', '‘')
    .replaceAll('&rsquo;', '’')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&#39;', "'")
    .replaceAll('&quot;', '"');

const cleanTitle = (title = '') =>
  decodeEntities(title)
    .replace(/\s*[|—–-]\s*Notofilia\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const abs = (p) => (p.startsWith('http') ? p : `${SITE}${p.startsWith('/') ? p : `/${p}`}`);

/** Truncate on a word boundary so link notes don't end mid-word. */
function clip(text, max = 140) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const sliced = t.slice(0, max);
  const at = sliced.lastIndexOf(' ');
  return `${(at > 40 ? sliced.slice(0, at) : sliced).trimEnd()}…`;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: source };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[kv[1]] = value;
  }
  return { data, body: match[2].trim() };
}

function linkLine(name, url, note) {
  const n = note ? `: ${note}` : '';
  return `- [${name}](${url})${n}`;
}

function sectionForPath(p) {
  if (p.startsWith('/coleccion/colombia/')) return '/coleccion/colombia/';
  if (p.startsWith('/coleccion/puerto-rico/')) return '/coleccion/puerto-rico/';
  if (p.startsWith('/coleccion/ecuador/')) return '/coleccion/ecuador/';
  if (p.startsWith('/coleccion/polimero-mundial/')) return '/coleccion/polimero-mundial/';
  if (p.startsWith('/coleccion/moneda-colonial-espanola/')) return '/coleccion/moneda-colonial-espanola/';
  if (p.startsWith('/coleccion/moneda-colonial/')) return '/coleccion/moneda-colonial/';
  if (p.startsWith('/coleccion/reserva-federal/')) return '/coleccion/reserva-federal/';
  if (p.startsWith('/coleccion/departamento-del-tesoro-de-ee-uu/')) {
    return '/coleccion/departamento-del-tesoro-de-ee-uu/';
  }
  if (p.startsWith('/coleccion/certificados-de-pago-militar/')) {
    return '/coleccion/certificados-de-pago-militar/';
  }
  if (p.startsWith('/coleccion/pop-art/')) return '/coleccion/pop-art/';
  if (p.startsWith('/coleccion/emisiones-promocionales/')) return '/coleccion/emisiones-promocionales/';
  return '/coleccion/';
}

async function loadCatalog() {
  const files = (await readdir(CATALOG_DIR)).filter((f) => f.endsWith('.json')).sort();
  const items = [];
  for (const file of files) {
    let data;
    try {
      data = JSON.parse(await readFile(path.join(CATALOG_DIR, file), 'utf8'));
    } catch {
      continue;
    }
    if (!data.path || !data.title) continue;
    items.push({
      path: data.path.endsWith('/') ? data.path : `${data.path}/`,
      title: cleanTitle(data.title),
      description: decodeEntities(data.description || '').replace(/\s+/g, ' ').trim(),
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
    });
  }
  return items.sort((a, b) => a.path.localeCompare(b.path, 'es'));
}

async function loadPosts(dir, base) {
  const files = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort();
  const posts = [];
  for (const file of files) {
    const raw = await readFile(path.join(dir, file), 'utf8');
    const { data, body } = parseFrontmatter(raw);
    if (data.draft === 'true' || data.draft === true) continue;
    const slug = file.replace(/\.md$/, '');
    posts.push({
      slug,
      path: `/${base}/${slug}/`,
      title: cleanTitle(data.title || slug),
      excerpt: decodeEntities(data.excerpt || '').trim(),
      publishedAt: data.publishedAt || '',
      source: data.source || '',
      sourceUrl: data.sourceUrl || '',
      body,
    });
  }
  return posts.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
}

function buildIntro({ catalogCount, blogCount, noticiasCount, full = false }) {
  const lines = [
    '# Notofilia',
    '',
    '> Private virtual catalog of historical banknotes and coins (numismatics & notaphily). Spanish-first. Pieces are **not for sale**. Illustrated catalog, guides, news, and glossary for collectors and researchers.',
    '>',
    '> Colección privada virtual de billetes y monedas históricas (numismática y notafilia). Sitio en español. Las piezas **no están a la venta**.',
    '',
    'Notofilia.com es un catálogo digital y colección privada virtual centrada en papel moneda histórico —especialmente Colombia, Puerto Rico, Ecuador, billete obsoleto de EE. UU., emisiones federales estadounidenses y billetes de polímero de ~30 países— más monedas coloniales españolas en oro y un subconjunto de pop art / exonumia.',
    '',
    '**Qué es:** ficha catalográfica por pieza (anverso/reverso, contexto histórico, rareza, referencias tipo Pick/Friedberg cuando aplica), guías evergreen, noticias curadas, glosario bilingüe (+90 términos) y perfiles históricos ligados a emisiones.',
    '',
    '**Qué no es:** tienda, casa de subastas, tasador en línea ni servicio de compraventa. El pie de página reitera: *«Todos los billetes mostrados en este sitio pertenecen a mi colección privada. Ninguno está a la venta.»*',
    '',
    '**Idioma:** contenido principal en español (`lang=es`). La home tiene toggle ES/EN. Citar en el idioma de la página fuente.',
    '',
    '**Cómo citar:** atribuir a Notofilia / Notofilia.com e incluir la URL canónica `https://www.notofilia.com/...`. Preferir fichas de `/coleccion/` y artículos de `/blog/` como fuentes primarias del sitio; las `/noticias/` suelen resumir fuentes externas (respetar el enlace `sourceUrl` cuando exista).',
    '',
    '**Markdown para agentes:** si el cliente envía `Accept: text/markdown`, el middleware de Cloudflare Pages puede devolver Markdown en lugar de HTML.',
    '',
    `**Inventario (build):** ~${catalogCount} fichas de catálogo · ${blogCount} guías de blog · ${noticiasCount} noticias · glosario · perfiles.`,
    '',
  ];

  if (full) {
    lines.push(
      'Este archivo es la versión completa (`llms-full.txt`): incluye el inventario de catálogo y el texto de las guías/noticias. Para un índice corto use [`llms.txt`](https://www.notofilia.com/llms.txt).',
      '',
    );
  } else {
    lines.push(
      'Índice curado según [llmstxt.org](https://llmstxt.org/). Inventario completo y cuerpos editoriales: [`llms-full.txt`](https://www.notofilia.com/llms-full.txt).',
      '',
    );
  }

  return lines.join('\n');
}

function buildCoreSections({ catalog, blog, noticias, full }) {
  const byPath = new Map(catalog.map((c) => [c.path, c]));
  const hubs = HUB_ORDER.map((h) => {
    const entry = byPath.get(h.path);
    return {
      ...h,
      description: entry?.description || h.label,
      title: entry?.title || h.label,
    };
  }).filter((h) => byPath.has(h.path) || h.path === '/coleccion/');

  const lines = [];

  lines.push('## Sitio principal', '');
  lines.push(linkLine('Inicio', abs('/'), 'Home: definiciones de numismática y notafilia, últimas noticias y guías.'));
  lines.push(linkLine('Catálogo (índice)', abs('/coleccion/'), 'Entrada al catálogo; billete obsoleto EE. UU. y hub de secciones.'));
  lines.push(linkLine('Blog', abs('/blog/'), 'Guías evergreen originales de notafilia y numismática.'));
  lines.push(linkLine('Noticias', abs('/noticias/'), 'Noticias curadas con enlace a la fuente original cuando aplica.'));
  lines.push(linkLine('Glosario', abs('/glosario/'), 'Más de 90 términos de numismática y notafilia (ES/EN).'));
  lines.push(linkLine('Contacto', abs('/contacto/'), 'Formulario (Web3Forms + Turnstile). Email: info@notofilia.com.'));
  lines.push(linkLine('J.S.G. Boggs', abs('/j-s-g-boggs/'), 'Perfil del artista de los «Boggs bills» dibujados a mano.'));
  lines.push('');

  lines.push('## Catálogo — secciones', '');
  for (const h of hubs) {
    lines.push(linkLine(h.title || h.label, abs(h.path), clip(h.description || '', 140)));
  }
  lines.push('');

  if (full) {
    lines.push('## Catálogo — fichas', '');
    lines.push(
      'Cada URL es una ficha de la colección privada (fotos, contexto, rareza). Ninguna pieza está a la venta.',
      '',
    );
    let currentSection = null;
    for (const item of catalog) {
      const isHub = HUB_ORDER.some((h) => h.path === item.path);
      if (isHub) continue;
      const section = sectionForPath(item.path);
      if (section !== currentSection) {
        currentSection = section;
        const hubMeta = HUB_ORDER.find((h) => h.path === section);
        // H3 is outside the strict llmstxt.org H2 file-list pattern; used only in llms-full
        // as section dividers inside a long inventory.
        lines.push(`### ${hubMeta?.label || section}`, '');
      }
      lines.push(linkLine(item.title, abs(item.path), clip(item.description, 160)));
    }
    lines.push('');
  } else {
    // Highlight a few high-signal leaves for the short index (hubs already listed above).
    const highlights = [
      '/coleccion/colombia/banco-de-la-republica-50000-pesos/',
      '/coleccion/colombia/2000-pesos-error-mariposa/',
      '/coleccion/puerto-rico/billete-de-canje-1-peso-1895/',
      '/coleccion/ecuador/100-sucres-1993/',
      '/coleccion/veinte-dolares-hawaii-1934/',
      '/coleccion/un-dolar-norte-africa-1935a/',
      '/coleccion/polimero-mundial/samoa-2-tala/',
      '/coleccion/pop-art/pele-bicycle-kick-the-king/',
    ];
    lines.push('## Catálogo — piezas destacadas', '');
    for (const p of highlights) {
      const item = byPath.get(p);
      if (!item) continue;
      lines.push(linkLine(item.title, abs(item.path), clip(item.description, 120)));
    }
    lines.push(
      '',
      `Listado completo de ${catalog.length} fichas: [llms-full.txt](${SITE}/llms-full.txt) · API: [GET /api/catalog](${SITE}/api/catalog) · índice JSON: [${SITE}/data/catalog-index.json](${SITE}/data/catalog-index.json).`,
      '',
    );
  }

  lines.push('## Guías del blog', '');
  for (const post of blog) {
    lines.push(linkLine(post.title, abs(post.path), clip(post.excerpt, 140)));
  }
  lines.push('');

  if (full) {
    lines.push('## Texto completo — blog', '');
    for (const post of blog) {
      lines.push(`### ${post.title}`, '');
      lines.push(`URL canónica: ${abs(post.path)}`, '');
      if (post.excerpt) lines.push(`> ${post.excerpt}`, '');
      lines.push(post.body, '', '---', '');
    }
  }

  lines.push('## Noticias', '');
  for (const post of noticias) {
    const src = post.source ? ` Fuente: ${post.source}.` : '';
    lines.push(linkLine(post.title, abs(post.path), clip(`${post.excerpt}${src}`, 140)));
  }
  lines.push('');

  if (full) {
    lines.push('## Texto completo — noticias', '');
    for (const post of noticias) {
      lines.push(`### ${post.title}`, '');
      lines.push(`URL canónica: ${abs(post.path)}`, '');
      if (post.excerpt) lines.push(`> ${post.excerpt}`, '');
      if (post.sourceUrl) {
        lines.push(`Fuente externa: [${post.source || post.sourceUrl}](${post.sourceUrl})`, '');
      }
      lines.push(post.body, '', '---', '');
    }
  }

  lines.push('## APIs y agentes', '');
  lines.push(linkLine('OpenAPI', abs('/openapi.json'), 'Catálogo, health, comentarios y registro de agentes.'));
  lines.push(linkLine('Catalog search API', abs('/api/catalog'), 'GET ?q=&limit= — búsqueda sobre título/ruta/keywords.'));
  lines.push(linkLine('Catalog index JSON', abs('/data/catalog-index.json'), 'Índice plano generado en build.'));
  lines.push(linkLine('Health', abs('/api/health'), 'Estado del servicio.'));
  lines.push(linkLine('MCP (Streamable HTTP)', abs('/mcp'), 'Herramientas de solo lectura: catalog.search, site.info, health.check.'));
  lines.push(linkLine('MCP server card', abs('/.well-known/mcp/server-card.json'), 'Descubrimiento MCP.'));
  lines.push(linkLine('Agent index', abs('/.well-known/agent-index.json'), 'Índice DNS-AID / agentes publicados.'));
  lines.push(linkLine('API Catalog (RFC 9727)', abs('/.well-known/api-catalog'), 'Linkset de servicios.'));
  lines.push(linkLine('Auth notes', abs('/auth.md'), 'Notas de autenticación para agentes.'));
  lines.push(linkLine('Sitemap', abs('/sitemap_index.xml'), 'Mapa completo de URLs indexables.'));
  lines.push('');

  lines.push('## Optional', '');
  if (!full) {
    lines.push(linkLine('llms-full.txt', abs('/llms-full.txt'), 'Inventario completo + texto de blog y noticias.'));
  } else {
    lines.push(linkLine('llms.txt', abs('/llms.txt'), 'Índice corto curado (preferir si el contexto es limitado).'));
  }
  lines.push(linkLine('Política de privacidad y cookies', abs('/politica-privacidad-cookies/'), 'GDPR / LOPDGDD / Ley 1581 Colombia.'));
  lines.push(linkLine('Facebook', 'https://www.facebook.com/NOTOFILIA/', 'Perfil social.'));
  lines.push(linkLine('Instagram', 'https://www.instagram.com/notofilia2026/', 'Perfil social.'));
  lines.push(linkLine('X / Twitter', 'https://x.com/notofilia', 'Perfil social.'));
  lines.push(linkLine('LinkedIn', 'https://www.linkedin.com/company/notofilia/about/', 'Página de empresa.'));
  lines.push('');

  return lines.join('\n');
}

const catalog = await loadCatalog();
const blog = await loadPosts(BLOG_DIR, 'blog');
const noticias = await loadPosts(NOTICIAS_DIR, 'noticias');
const counts = {
  catalogCount: catalog.length,
  blogCount: blog.length,
  noticiasCount: noticias.length,
};

const llmsTxt = `${buildIntro({ ...counts, full: false })}\n${buildCoreSections({ catalog, blog, noticias, full: false })}\n`;
const llmsFull = `${buildIntro({ ...counts, full: true })}\n${buildCoreSections({ catalog, blog, noticias, full: true })}\n`;

const targets = [
  ['llms.txt', llmsTxt],
  ['llms-full.txt', llmsFull],
  // Common misspellings / user-facing aliases (same bytes as the standard names).
  ['llm.txt', llmsTxt],
  ['llm-full.txt', llmsFull],
];

for (const [name, body] of targets) {
  await writeFile(path.join(PUBLIC, name), body, 'utf8');
}

const kb = (n) => `${(Buffer.byteLength(n, 'utf8') / 1024).toFixed(1)} KiB`;
console.log(
  `Generated llms.txt (${kb(llmsTxt)}) + llms-full.txt (${kb(llmsFull)}) ` +
    `from ${catalog.length} catalog · ${blog.length} blog · ${noticias.length} noticias.`,
);
