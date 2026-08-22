/**
 * Build-time Spanish → English markup for catalog HTML templates.
 * Wraps translated text nodes in [data-i18n] so the header pill can swap them.
 * Server-only — do not import from client islands.
 */
import fs from 'node:fs';
import path from 'node:path';

const DICT_PATH = path.join(process.cwd(), 'src/i18n/catalog-es-en.json');
const SUPPLEMENT_PATH = path.join(process.cwd(), 'src/i18n/catalog-es-en-supplement.json');

const DICT = {
  ...(JSON.parse(fs.readFileSync(DICT_PATH, 'utf8')) as Record<string, string>),
  ...(fs.existsSync(SUPPLEMENT_PATH)
    ? (JSON.parse(fs.readFileSync(SUPPLEMENT_PATH, 'utf8')) as Record<string, string>)
    : {}),
} as Record<string, string>;

export function lookupEn(spanish: string | undefined): string | undefined {
  if (!spanish) return undefined;
  const trimmed = spanish.replace(/\s+/g, ' ').trim();
  if (!trimmed) return undefined;
  const direct = DICT[trimmed] ?? DICT[spanish.trim()];
  if (direct && direct.length > 0) return direct;
  return undefined;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function wrapTextNode(text: string): string {
  const lead = text.match(/^\s*/)?.[0] ?? '';
  const trail = text.match(/\s*$/)?.[0] ?? '';
  const core = text.slice(lead.length, text.length - trail.length);
  if (!core) return text;
  const normalized = core.replace(/\s+/g, ' ').trim();
  const en = lookupEn(normalized) ?? lookupEn(core);
  if (!en || en === core) return text;
  return `${lead}<span data-i18n data-en="${escapeAttr(en)}">${core}</span>${trail}`;
}

const SKIP_BLOCKS = /<(script|style|noscript|code|pre)\b[\s\S]*?<\/\1>/gi;

/** Inject data-i18n spans into catalog HTML using the Spanish→English dictionary. */
export function withI18nMarkup(html: string): string {
  if (!html) return html;
  const skipped: string[] = [];
  const withHoles = html.replace(SKIP_BLOCKS, (block) => {
    skipped.push(block);
    return `\u0000SKIP${skipped.length - 1}\u0000`;
  });
  const wrapped = withHoles.replace(/>([^<]+)</g, (full, text: string) => {
    if (!text.trim()) return full;
    return `>${wrapTextNode(text)}<`;
  });
  return wrapped.replace(/\u0000SKIP(\d+)\u0000/g, (_, index) => skipped[Number(index)] ?? '');
}

export function i18nPair(spanish: string): { 'data-i18n'?: true; 'data-en'?: string } {
  const en = lookupEn(spanish);
  if (!en || en === spanish) return {};
  return { 'data-i18n': true, 'data-en': en };
}

/**
 * Replace Spanish Markdown blocks with their English dictionary entries.
 * Blocks are split on blank lines, matching the extraction used to build the dict.
 */
export function translateMarkdown(md: string): string {
  if (!md) return md;
  return md
    .split(/(\n{2,})/)
    .map((part) => {
      if (/^\n+$/.test(part)) return part;
      const normalized = part.replace(/\s+/g, ' ').trim();
      return lookupEn(normalized) ?? part;
    })
    .join('');
}
