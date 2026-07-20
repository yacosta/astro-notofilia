/**
 * Lightweight HTML → Markdown for Accept: text/markdown negotiation.
 * Strips chrome (nav/footer/script/style) and keeps main readable content.
 */

const BLOCK_TAGS = new Set([
  'p', 'div', 'section', 'article', 'main', 'header', 'footer', 'aside',
  'li', 'tr', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'table', 'figure', 'figcaption', 'br', 'hr',
]);

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function extractAttr(tag, name) {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const m = tag.match(re);
  return m ? (m[2] ?? m[3] ?? m[4] ?? '') : '';
}

function stripNoise(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--([\s\S]*?)-->/g, '')
    .replace(/<(nav|footer|aside|form|template|x-dc)\b[\s\S]*?<\/\1>/gi, '');
}

function extractMeta(html) {
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  const desc =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1] ||
    '';
  const ogImage =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i)?.[1] ||
    '';
  return { title: decodeEntities(title), description: decodeEntities(desc), image: ogImage };
}

function extractMain(html) {
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  if (main) return main[1];
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  if (article) return article[1];
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return body ? body[1] : html;
}

function htmlFragmentToMarkdown(fragment) {
  let out = '';
  const re = /<\/?([a-zA-Z0-9]+)(\s[^>]*)?>|([^<]+)/g;
  let m;
  let listDepth = 0;
  while ((m = re.exec(fragment))) {
    if (m[3] != null) {
      const text = decodeEntities(m[3]).replace(/\s+/g, ' ');
      if (text.trim()) out += text;
      continue;
    }
    const tag = m[1].toLowerCase();
    const open = !m[0].startsWith('</');
    const selfClosing = /\/>$/.test(m[0]) || tag === 'br' || tag === 'hr' || tag === 'img';
    if (tag === 'br') {
      out += '  \n';
      continue;
    }
    if (tag === 'hr') {
      out += '\n\n---\n\n';
      continue;
    }
    if (tag === 'img' && open) {
      const alt = extractAttr(m[0], 'alt') || 'image';
      const src = extractAttr(m[0], 'src');
      if (src) out += `![${decodeEntities(alt)}](${src})`;
      continue;
    }
    if (tag === 'a' && open) {
      const href = extractAttr(m[0], 'href');
      out += '[';
      // collect until </a>
      const start = re.lastIndex;
      const close = fragment.slice(start).match(/<\/a>/i);
      if (close) {
        const inner = fragment.slice(start, start + close.index);
        const label = decodeEntities(inner.replace(/<[^>]+>/g, '')).trim() || href;
        out += `${label}](${href || '#'})`;
        re.lastIndex = start + close.index + close[0].length;
      } else {
        out += ']()';
      }
      continue;
    }
    if (/^h[1-6]$/.test(tag) && open) {
      const level = Number(tag[1]);
      out += `\n\n${'#'.repeat(level)} `;
      continue;
    }
    if (tag === 'li' && open) {
      out += `\n${'  '.repeat(Math.max(listDepth - 1, 0))}- `;
      continue;
    }
    if ((tag === 'ul' || tag === 'ol') && open) listDepth += 1;
    if ((tag === 'ul' || tag === 'ol') && !open) listDepth = Math.max(0, listDepth - 1);
    if (tag === 'blockquote' && open) {
      out += '\n\n> ';
      continue;
    }
    if (tag === 'pre' && open) {
      out += '\n\n```\n';
      continue;
    }
    if (tag === 'pre' && !open) {
      out += '\n```\n\n';
      continue;
    }
    if (tag === 'code' && open && !selfClosing) {
      out += '`';
      continue;
    }
    if (tag === 'code' && !open) {
      out += '`';
      continue;
    }
    if (tag === 'strong' || tag === 'b') {
      out += '**';
      continue;
    }
    if (tag === 'em' || tag === 'i') {
      out += '*';
      continue;
    }
    if (BLOCK_TAGS.has(tag) && (!open || selfClosing)) {
      out += '\n\n';
    } else if (BLOCK_TAGS.has(tag) && open) {
      out += '\n\n';
    }
  }
  return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function htmlToMarkdown(html) {
  const meta = extractMeta(html);
  const cleaned = stripNoise(html);
  const main = extractMain(cleaned);
  const body = htmlFragmentToMarkdown(main);
  const front = ['---'];
  if (meta.title) front.push(`title: ${JSON.stringify(meta.title)}`);
  if (meta.description) front.push(`description: ${JSON.stringify(meta.description)}`);
  if (meta.image) front.push(`image: ${JSON.stringify(meta.image)}`);
  front.push('---', '');
  const parts = [];
  if (meta.title || meta.description || meta.image) parts.push(front.join('\n'));
  if (body) parts.push(body);
  return parts.join('\n') + '\n';
}

export function estimateTokens(text) {
  // Rough GPT-style estimate: ~4 chars/token for mixed ES/EN prose.
  return Math.max(1, Math.ceil(text.length / 4));
}

export function prefersMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  const parts = acceptHeader.split(',').map((p) => {
    const [type, ...params] = p.trim().split(';');
    let q = 1;
    for (const param of params) {
      const [k, v] = param.trim().split('=');
      if (k === 'q' && v) q = Number(v);
    }
    return { type: type.toLowerCase(), q: Number.isFinite(q) ? q : 1 };
  });
  const md = parts.find((p) => p.type === 'text/markdown');
  if (!md) return false;
  const html = parts.find((p) => p.type === 'text/html');
  const star = parts.find((p) => p.type === '*/*');
  const htmlQ = html?.q ?? (star ? star.q * 0.1 : 0);
  return md.q > 0 && md.q >= htmlQ;
}
