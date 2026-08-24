/**
 * Post-build production HTML gate.
 * Reads dist/ (no HTTP). Fails the process if unresolved templates,
 * placeholders, or SEO/a11y defects would ship.
 */
import { existsSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const SITE = 'https://www.notofilia.com';
const SITE_HOSTS = new Set(['www.notofilia.com', 'notofilia.com']);

/**
 * Allowlist — legitimate syntax that must not false-positive.
 * Region kinds are stripped before template / placeholder / identifier scans.
 * Skip-paths are never crawled as HTML documents.
 */
const ALLOWLIST = [
  // HTML comments <!-- --> are not rendered.
  'html-comments',
  // <code> / <pre> may document template syntax in editorial copy.
  'code-and-pre',
  // JS in <script> (not text/x-dc HTML templates): zoomPercent getters, etc.
  'javascript-scripts',
  // JSON-LD strings are not visible page copy.
  'json-ld',
  // Client runtime — not a document, never crawl as a page.
  'skip-path:/support.js',
];

const SKIP_PAGE_PATHS = new Set(
  ALLOWLIST.filter((item) => item.startsWith('skip-path:')).map((item) => item.slice('skip-path:'.length)),
);

const NOTE_IDENTIFIERS = [
  'note.label',
  'note.alt',
  'note.denomination',
  'note.date',
  'note.serial',
  'note.catalogRef',
  'note.condition',
  'zoomPercent',
];

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const findings = [];
const fail = (pagePath, reason) => findings.push({ path: pagePath, reason });

const normalizePath = (value) => {
  const pathname = value.startsWith('http') ? new URL(value).pathname : value;
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

const hasFileExtension = (pathname) => /\.[a-z0-9]{1,8}$/i.test(pathname.split('/').pop() ?? '');

const existsCache = new Map();
const fileExists = (abs) => {
  if (!existsCache.has(abs)) {
    try {
      existsCache.set(abs, statSync(abs).isFile());
    } catch {
      existsCache.set(abs, false);
    }
  }
  return existsCache.get(abs);
};

const distDir = path.join(root, 'dist');
if (!existsSync(distDir)) {
  console.error('- /: dist/ is missing; run the production build before this check');
  process.exit(1);
}

const sitemapXml = await readFile(path.join(root, 'public/sitemap.xml'), 'utf8');
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => normalizePath(match[1]));
const sitemap = new Set(sitemapPaths);

const redirectLines = (await readFile(path.join(root, 'public/_redirects'), 'utf8'))
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));
const redirects = redirectLines.map((line) => {
  const [from, to, status] = line.split(/\s+/);
  return { from, to, status, line };
}).filter((rule) => rule.from && rule.to && rule.status);

const rewrites = new Map(
  redirects.filter(({ status }) => status === '200').map((rule) => [normalizePath(rule.from), rule]),
);
const redirectFrom = new Set();
for (const rule of redirects) {
  if (rule.status === '301' || rule.status === '200') {
    redirectFrom.add(rule.from);
    redirectFrom.add(normalizePath(rule.from));
    if (rule.from.endsWith('/')) redirectFrom.add(rule.from.slice(0, -1));
    else redirectFrom.add(`${rule.from}/`);
  }
}

const htmlCache = new Map();

function distRelativeForRoute(route) {
  const raw = route.split('#')[0].split('?')[0];
  const isFile = hasFileExtension(raw);
  const normalized = isFile ? (raw.startsWith('/') ? raw : `/${raw}`) : normalizePath(raw);
  const rewrite = rewrites.get(normalizePath(raw)) || rewrites.get(normalized);
  if (rewrite) return rewrite.to.replace(/^\//, '');
  if (normalized === '/') return 'index.html';
  if (isFile) return raw.replace(/^\//, '');
  return path.join(normalized.replace(/^\//, ''), 'index.html');
}

async function htmlForRoute(route) {
  const relative = distRelativeForRoute(route);
  const file = path.join(root, 'dist', relative);
  if (!htmlCache.has(file)) {
    try {
      htmlCache.set(file, await readFile(file, 'utf8'));
    } catch {
      htmlCache.set(file, '');
    }
  }
  return { html: htmlCache.get(file), file, relative };
}

function isDcHtmlTemplate(body) {
  return /^\s*</.test(body) || /<(?:div|span|p|h[1-6]|img|section|article|header|main|table|figure|picture)\b/i.test(body);
}

function maskAllowlisted(html) {
  let out = html;
  if (ALLOWLIST.includes('html-comments')) {
    out = out.replace(/<!--[\s\S]*?-->/g, '');
  }
  if (ALLOWLIST.includes('code-and-pre')) {
    out = out.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, '');
    out = out.replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, '');
  }
  out = out.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, body) => {
    const type = attrs.match(/\btype\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
    const isJsonLd = /application\/ld\+json/i.test(type);
    const isDc = /text\/x-dc/i.test(type);
    if (isJsonLd && ALLOWLIST.includes('json-ld')) {
      return `<script${attrs}></script>`;
    }
    if (isDc && isDcHtmlTemplate(body)) return full;
    if (ALLOWLIST.includes('javascript-scripts')) {
      return `<script${attrs}></script>`;
    }
    return full;
  });
  return out;
}

function stripTags(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function attr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(re);
  if (!match) return null;
  return match[2] ?? match[3] ?? match[4] ?? '';
}

function hasAttr(tag, name) {
  const attrs = tag.replace(/^<\/?/, ' ').replace(/\/?>$/, ' ');
  return new RegExp(`\\s${name}(?:\\s|=|/)`, 'i').test(attrs);
}

function baseHrefOf(html) {
  const tag = html.match(/<base\b[^>]*>/i)?.[0];
  const href = tag ? attr(tag, 'href') : null;
  return href && href.trim() ? href.trim() : '/';
}

function resolveLocalUrl(raw, pagePath, baseHref) {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: 'empty' };
  if (/\{\{|\{\%/.test(trimmed)) return { kind: 'skip' };
  if (/^(data:|blob:|javascript:|mailto:|tel:)/i.test(trimmed)) return { kind: 'skip' };
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) return { kind: 'skip' };
  const bare = trimmed.split('#')[0].split('?')[0];
  if (!bare) return { kind: 'skip' };
  try {
    const origin = SITE;
    if (!baseHref || baseHref === '/') {
      const resolved = new URL(bare, `${origin}/`);
      return { kind: 'local', pathname: resolved.pathname };
    }
    const pageBase = new URL(pagePath.endsWith('/') || hasFileExtension(pagePath) ? pagePath : `${pagePath}/`, origin);
    const resolved = new URL(bare, new URL(baseHref, pageBase).href);
    return { kind: 'local', pathname: resolved.pathname };
  } catch {
    return { kind: 'local', pathname: bare.startsWith('/') ? bare : `/${bare}` };
  }
}

function splitSrcset(value) {
  return value
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function localAssetExists(pathname) {
  const decoded = decodeURIComponent(pathname);
  const rel = decoded.replace(/^\//, '').replace(/\/+$/, '');
  if (!rel) return fileExists(path.join(root, 'dist', 'index.html'));
  const candidates = [
    path.join(root, 'dist', rel),
    path.join(root, 'public', rel),
  ];
  if (!hasFileExtension(`/${rel}`)) {
    candidates.push(
      path.join(root, 'dist', rel, 'index.html'),
      path.join(root, 'public', rel, 'index.html'),
      path.join(root, 'dist', `${rel}.html`),
      path.join(root, 'public', `${rel}.html`),
    );
  }
  return candidates.some(fileExists);
}

function rewriteTargetExists(route) {
  const rule = rewrites.get(normalizePath(route)) || rewrites.get(route);
  if (!rule) return false;
  const rel = rule.to.replace(/^\//, '');
  return fileExists(path.join(root, 'dist', rel)) || fileExists(path.join(root, 'public', rel));
}

function isLiveInternalPath(pathname) {
  if (redirectFrom.has(pathname) || redirectFrom.has(normalizePath(pathname))) {
    if (rewrites.has(normalizePath(pathname))) return rewriteTargetExists(pathname);
    return true;
  }
  if (localAssetExists(pathname)) return true;
  if (!hasFileExtension(pathname) && localAssetExists(normalizePath(pathname))) return true;
  return rewriteTargetExists(pathname);
}

function parseInternalHref(href) {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(trimmed)) return null;
  if (/\{\{|\{\%/.test(trimmed)) return null;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('//')) {
    try {
      const url = new URL(trimmed.startsWith('//') ? `https:${trimmed}` : trimmed);
      if (!SITE_HOSTS.has(url.hostname)) return null;
      return url.pathname || '/';
    } catch {
      return null;
    }
  }
  if (trimmed.startsWith('/')) return trimmed.split('#')[0].split('?')[0] || '/';
  return null;
}

function htmlLang(html) {
  const tag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
  return (attr(tag, 'lang') ?? '').trim();
}

function firstTitle(html) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  return match ? decodeEntities(match[1]).replace(/\s+/g, ' ').trim() : null;
}

function metaDescription(html) {
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const desc = tags.find((tag) => /\bname\s*=\s*["']description["']/i.test(tag));
  if (!desc) return null;
  const content = attr(desc, 'content');
  return content == null ? '' : decodeEntities(content).trim();
}

function canonicalHref(html) {
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  const canonical = tags.find((tag) => /\brel\s*=\s*["']canonical["']/i.test(tag));
  return canonical ? attr(canonical, 'href') : null;
}

function hreflangAlts(html) {
  const tags = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]);
  return tags
    .filter((tag) => /\brel\s*=\s*["']alternate["']/i.test(tag) && /\bhreflang\s*=/i.test(tag))
    .map((tag) => ({ hreflang: attr(tag, 'hreflang') ?? '', href: attr(tag, 'href') ?? '' }));
}

function h1Texts(html) {
  return [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));
}

function isHiddenElement(tag, name) {
  if (hasAttr(tag, 'hidden') || hasAttr(tag, 'data-pagefind-ignore')) return true;
  if (name === 'dialog' && hasAttr(tag, 'hidden')) return true;
  return false;
}

function walkMedia(html, onImg, onSource) {
  const stack = [];
  const re = /<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/g;
  let match;
  while ((match = re.exec(html))) {
    const raw = match[0];
    const name = match[1].toLowerCase();
    const closing = raw.startsWith('</');
    const selfClosing = raw.endsWith('/>') || VOID_TAGS.has(name);
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].name === name) {
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const hiddenHere = isHiddenElement(raw, name);
    const hidden = hiddenHere || stack.some((el) => el.hidden);
    if (name === 'img') onImg(raw, hidden);
    if (name === 'source') onSource(raw, hidden);
    if (!selfClosing) stack.push({ name, hidden: hiddenHere || hidden });
  }
}

function isEnglishPath(pagePath) {
  return pagePath === '/en/' || pagePath.startsWith('/en/');
}

function isCatalogSectionIndex(route, catalogRoutes) {
  if (route === '/coleccion/') return true;
  if (!route.startsWith('/coleccion/')) return false;
  return catalogRoutes.some((other) => other !== route && other.startsWith(route));
}

const catalogRoutes = sitemapPaths.filter((p) => p.startsWith('/coleccion/'));
const catalogItemTitles = new Map();

const pages = [];
const seenPaths = new Set();
const addPage = (pagePath) => {
  if (SKIP_PAGE_PATHS.has(pagePath) || seenPaths.has(pagePath)) return;
  seenPaths.add(pagePath);
  pages.push(pagePath);
};

for (const route of sitemapPaths) addPage(route);

for (const rule of redirects) {
  if (rule.status !== '200') continue;
  if (!/\.dc\.html$/i.test(rule.to)) continue;
  const dcPath = rule.to.startsWith('/') ? rule.to : `/${rule.to}`;
  addPage(dcPath);
}

const scannedFiles = new Set();

for (const pagePath of pages) {
  const { html, file } = await htmlForRoute(pagePath);
  if (!html) {
    fail(pagePath, 'missing built HTML (no dist file after redirects)');
    continue;
  }
  if (scannedFiles.has(file)) continue;
  scannedFiles.add(file);

  const scanned = maskAllowlisted(html);
  const visible = stripTags(scanned.replace(/\{\{[\s\S]*?\}\}/g, ' ').replace(/\{%[\s\S]*?%\}/g, ' '));
  const baseHref = baseHrefOf(html);

  const mustache = [
    ...new Set([
      ...(scanned.match(/\{\{[\s\S]*?\}\}/g) ?? []),
      ...(scanned.match(/\{%[\s\S]*?%\}/g) ?? []),
    ].map((token) => token.replace(/\s+/g, ' ').trim())),
  ];
  for (const token of mustache) fail(pagePath, `unresolved template token ${token}`);

  for (const token of scanned.match(/\[[A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 .,'/_-]{2,}\]/g) ?? []) {
    const inner = token.slice(1, -1);
    if (!/\s/.test(inner) && !/(EMAIL|CONTACTO|PLACEHOLDER|TODO|FIXME|XXXX)/.test(inner)) continue;
    fail(pagePath, `placeholder ${token}`);
  }

  for (const ident of NOTE_IDENTIFIERS) {
    const re = new RegExp(`\\b${ident.replace('.', '\\.')}\\b`);
    if (re.test(visible)) fail(pagePath, `leftover identifier ${ident} in visible text`);
  }

  const title = firstTitle(html);
  if (title == null || title === '') fail(pagePath, 'empty <title>');

  const description = metaDescription(html);
  if (description == null || description === '') fail(pagePath, 'empty meta description');

  const headings = h1Texts(html);
  if (headings.length === 0) fail(pagePath, 'missing <h1>');
  else {
    if (headings.length > 1) fail(pagePath, `multiple <h1> elements (${headings.length})`);
    for (const heading of headings) {
      if (!heading) fail(pagePath, 'empty <h1>');
    }
  }

  walkMedia(scanned, (tag, hidden) => {
    const src = attr(tag, 'src');
    if (src == null || !src.trim()) {
      if (!hidden) fail(pagePath, 'empty img src');
      return;
    }
    const resolved = resolveLocalUrl(src, pagePath, baseHref);
    if (resolved.kind === 'local' && !localAssetExists(resolved.pathname)) {
      fail(pagePath, `broken image ${resolved.pathname}`);
    }
    const srcset = attr(tag, 'srcset');
    if (srcset) {
      for (const candidate of splitSrcset(srcset)) {
        const item = resolveLocalUrl(candidate, pagePath, baseHref);
        if (item.kind === 'local' && !localAssetExists(item.pathname)) {
          fail(pagePath, `broken image ${item.pathname}`);
        }
      }
    }
  }, (tag, _hidden) => {
    const srcset = attr(tag, 'srcset');
    if (srcset == null || !srcset.trim()) return;
    for (const candidate of splitSrcset(srcset)) {
      const item = resolveLocalUrl(candidate, pagePath, baseHref);
      if (item.kind === 'local' && !localAssetExists(item.pathname)) {
        fail(pagePath, `broken image ${item.pathname}`);
      }
    }
  });

  if (!canonicalHref(html)?.trim()) fail(pagePath, 'missing canonical <link rel="canonical">');

  const alts = hreflangAlts(html);
  if (alts.length) {
    for (const alt of alts) {
      if (!alt.href.trim()) {
        fail(pagePath, `hreflang ${alt.hreflang || '(empty)'} has empty href`);
        continue;
      }
      let altPath;
      try {
        altPath = normalizePath(alt.href);
      } catch {
        fail(pagePath, `hreflang ${alt.hreflang} href is not a sitemap URL (${alt.href})`);
        continue;
      }
      const selfPath = hasFileExtension(pagePath) ? pagePath : normalizePath(pagePath);
      if (altPath !== selfPath && altPath !== pagePath && !sitemap.has(altPath)) {
        fail(pagePath, `hreflang ${alt.hreflang} href is not a sitemap URL (${alt.href})`);
      }
    }
  }

  const lang = htmlLang(html).toLowerCase();
  if (isEnglishPath(pagePath)) {
    if (!lang.startsWith('en')) fail(pagePath, `html lang must be en (found ${lang || '(missing)'})`);
  } else if (!lang.startsWith('es')) {
    fail(pagePath, `html lang must be es (found ${lang || '(missing)'})`);
  }

  const linkHtml = maskAllowlisted(html);
  for (const tag of linkHtml.match(/<a\b[^>]*>/gi) ?? []) {
    const href = attr(tag, 'href');
    if (href == null) continue;
    const dest = parseInternalHref(href);
    if (!dest) continue;
    if (!isLiveInternalPath(dest)) fail(pagePath, `internal link 404: ${dest}`);
  }

  if (
    pagePath.startsWith('/coleccion/')
    && !hasFileExtension(pagePath)
    && !isCatalogSectionIndex(normalizePath(pagePath), catalogRoutes)
    && title
  ) {
    const list = catalogItemTitles.get(title) ?? [];
    list.push(normalizePath(pagePath));
    catalogItemTitles.set(title, list);
  }
}

for (const [title, paths] of catalogItemTitles) {
  const unique = [...new Set(paths)];
  if (unique.length < 2) continue;
  const [first, ...rest] = unique.sort();
  fail(first, `duplicate catalog <title> "${title}" also at ${rest.join(', ')}`);
}

const uniqueFindings = [];
const seen = new Set();
for (const item of findings) {
  const key = `${item.path}\0${item.reason}`;
  if (seen.has(key)) continue;
  seen.add(key);
  uniqueFindings.push(item);
}

if (uniqueFindings.length) {
  console.error(`Production HTML check failed with ${uniqueFindings.length} issue${uniqueFindings.length === 1 ? '' : 's'}:\n`);
  for (const item of uniqueFindings) console.error(`- ${item.path}: ${item.reason}`);
  process.exit(1);
}

console.log(`Production HTML check passed: ${pages.length} pages scanned.`);
