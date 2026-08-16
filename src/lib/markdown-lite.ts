/**
 * Small Markdown → HTML helper for bilingual post bodies.
 * Server-only. Handles the subset used in blog/noticias (headings, lists,
 * emphasis, links, and passthrough HTML figures).
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(text: string): string {
  const parts: string[] = [];
  let rest = text;
  while (rest.length > 0) {
    const match = rest.match(
      /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_|`([^`]+)`/,
    );
    if (!match || match.index == null) {
      parts.push(escapeHtml(rest));
      break;
    }
    if (match.index > 0) parts.push(escapeHtml(rest.slice(0, match.index)));
    if (match[1] != null && match[2] != null) {
      parts.push(
        `<img src="${escapeHtml(match[2])}" alt="${escapeHtml(match[1])}" loading="lazy" decoding="async" />`,
      );
    } else if (match[3] != null && match[4] != null) {
      const href = match[4];
      const external = /^https?:\/\//i.test(href);
      const extra = external
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      const hint = external
        ? ' <span data-i18n data-en="(opens in a new tab)">(se abre en una pestaña nueva)</span>'
        : '';
      parts.push(
        `<a href="${escapeHtml(href)}"${extra}>${inline(match[3])}${hint}</a>`,
      );
    } else if (match[5] != null) {
      parts.push(`<strong>${inline(match[5])}</strong>`);
    } else if (match[6] != null) {
      parts.push(`<em>${inline(match[6])}</em>`);
    } else if (match[7] != null) {
      parts.push(`<em>${inline(match[7])}</em>`);
    } else if (match[8] != null) {
      parts.push(`<code>${escapeHtml(match[8])}</code>`);
    }
    rest = rest.slice(match.index + match[0].length);
  }
  return parts.join('');
}

function restoreListItems(block: string): string[] {
  const trimmed = block.trim();
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    return trimmed.split(/\s+(?=[-*] )/).map((item) => item.replace(/^[-*] /, '').trim());
  }
  if (/^\d+\.\s/.test(trimmed)) {
    return trimmed.split(/\s+(?=\d+\.\s)/).map((item) => item.replace(/^\d+\.\s/, '').trim());
  }
  return [];
}

function blockToHtml(block: string): string {
  const trimmed = block.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('<')) return trimmed;
  const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
  if (heading && !trimmed.includes('\n')) {
    const level = heading[1].length;
    return `<h${level}>${inline(heading[2])}</h${level}>`;
  }
  const items = restoreListItems(trimmed);
  if (items.length > 0) {
    const ordered = /^\d+\.\s/.test(trimmed);
    const tag = ordered ? 'ol' : 'ul';
    return `<${tag}>${items.map((item) => `<li>${inline(item)}</li>`).join('')}</${tag}>`;
  }
  return `<p>${inline(trimmed)}</p>`;
}

/** Convert a Markdown string (original or translated) to HTML. */
export function markdownToHtml(md: string): string {
  if (!md) return '';
  return md
    .split(/\n{2,}/)
    .map(blockToHtml)
    .filter(Boolean)
    .join('\n');
}
