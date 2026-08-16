/**
 * Freeze a Designer Canvas catalog template into static HTML.
 *
 * Multi-note pages stored the ficha fields in DCLogic (`noteData`, etc.) and
 * rendered them with `<sc-for>` + Mustache. The first Phase 3 pass deleted
 * those bindings instead of expanding the loops, which emptied the fichas
 * and left the zoom overlay covering the page.
 */
const HANDLER_ATTR = /\s+on[A-Za-z]+="\{\{[^"]*\}\}"/g;

export function extractJsLiteral(source, name) {
  const re = new RegExp(`(?:^|\\n)\\s*(?:this\\.)?${name}\\s*=\\s*`);
  const match = source.match(re);
  if (!match) return undefined;
  const start = match.index + match[0].length;
  const first = source[start];
  if (first !== '[' && first !== '{') return undefined;

  let depth = 0;
  let inStr = null;
  let escape = false;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i];
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (char === '\\') {
        escape = true;
        continue;
      }
      if (char === inStr) inStr = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      inStr = char;
      continue;
    }
    if (char === '[' || char === '{') depth += 1;
    else if (char === ']' || char === '}') {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(start, i + 1);
        return Function(`"use strict"; return (${literal});`)();
      }
    }
  }
  return undefined;
}

function attr(attrs, name) {
  const match = attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`, 'i'));
  return match ? match[1] : '';
}

function listNameFromBinding(binding) {
  const match = String(binding || '').match(/\{\{\s*(\w+)\s*\}\}/);
  return match ? match[1] : String(binding || '').trim();
}

export function resolveList(logic, listName) {
  const candidates = [
    listName,
    listName.replace(/Notes$/, 'Data'),
    listName === 'notes' ? 'noteData' : null,
    listName.replace(/s$/, 'Data'),
  ].filter(Boolean);
  const seen = new Set();
  for (const name of candidates) {
    if (seen.has(name)) continue;
    seen.add(name);
    const value = extractJsLiteral(logic, name);
    if (Array.isArray(value)) return value;
  }
  return [];
}

export function collectNotes(template, logic) {
  const notes = [];
  const seen = new Set();
  const add = (item) => {
    if (!item || typeof item !== 'object') return;
    const key = String(item.key || item.jpg || JSON.stringify(item));
    if (seen.has(key)) return;
    seen.add(key);
    notes.push(item);
  };

  const openRe = /<sc-for\b([^>]*)>/gi;
  let match;
  while ((match = openRe.exec(template))) {
    const listName = listNameFromBinding(attr(match[1], 'list'));
    if (!listName) continue;
    for (const item of resolveList(logic, listName)) add(item);
  }

  const errorData = extractJsLiteral(logic, 'errorData');
  if (errorData) add(errorData);
  return notes;
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function absUploadPath(value) {
  if (typeof value !== 'string' || !value) return value;
  if (/^https?:\/\//i.test(value) || value.startsWith('/')) return value;
  if (value.startsWith('uploads/')) return `/${value}`;
  return value;
}

function substAlias(html, alias, record) {
  const re = new RegExp(`\\{\\{\\s*${alias}\\.([a-zA-Z0-9_]+)\\s*\\}\\}`, 'g');
  return html.replace(re, (_, key) => {
    const value = record?.[key];
    if (value == null || value === '') return '';
    if (typeof value === 'string') return absUploadPath(value);
    return String(value);
  });
}

function replaceTaggedBlocks(html, tag, replacer) {
  const openRe = new RegExp(`<${tag}\\b([^>]*)>`, 'gi');
  let out = '';
  let last = 0;
  let match;
  while ((match = openRe.exec(html))) {
    const openStart = match.index;
    const attrs = match[1];
    const innerStart = openRe.lastIndex;
    const closeTag = `</${tag}>`;
    const closeAt = html.toLowerCase().indexOf(closeTag.toLowerCase(), innerStart);
    if (closeAt === -1) break;
    const inner = html.slice(innerStart, closeAt);
    out += html.slice(last, openStart) + replacer(attrs, inner);
    last = closeAt + closeTag.length;
    openRe.lastIndex = last;
  }
  return out + html.slice(last);
}

function sliceBalancedDiv(html, openTag) {
  const start = html.indexOf(openTag);
  if (start === -1) return null;
  const lower = html.toLowerCase();
  let depth = 0;
  let i = start;
  while (i < html.length) {
    const nextOpen = lower.indexOf('<div', i);
    const nextClose = lower.indexOf('</div>', i);
    if (nextClose === -1) return null;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth += 1;
      i = nextOpen + 4;
      continue;
    }
    depth -= 1;
    const end = nextClose + 6;
    if (depth === 0) {
      return { start, end, html: html.slice(start, end) };
    }
    i = end;
  }
  return null;
}

function moveSpecTableBeforeImage(html) {
  const spec = sliceBalancedDiv(
    html,
    '<div style="display:flex; flex-direction:column; margin-top:8px;">',
  );
  const buttonRe = /<button\b[^>]*data-zoom-trigger[\s\S]*?<\/button>/i;
  const buttonMatch = html.match(buttonRe);
  if (!spec || !buttonMatch) return html;
  const buttonAt = html.indexOf(buttonMatch[0]);
  if (spec.start < buttonAt) return html;

  let block = spec.html;
  const after = html.slice(spec.end).match(/^\s*<p\b[\s\S]*?<\/p>/);
  let end = spec.end;
  if (after) {
    block += after[0];
    end += after[0].length;
  }

  html = html.slice(0, spec.start) + html.slice(end);
  const nextButtonAt = html.search(buttonRe);
  if (nextButtonAt === -1) return html;
  return `${html.slice(0, nextButtonAt)}${block}\n${html.slice(nextButtonAt)}`;
}

function noteTriggerHtml(itemHtml, note) {
  const key = String(note.key || 'note');
  const label = note.label || note.date || note.alt || 'billete';
  let html = itemHtml.replace(
    /\s+onClick="\{\{\s*note\.openZoom\s*\}\}"/g,
    ` data-zoom-trigger="${escapeAttr(key)}"`,
  );
  html = html.replace(
    /aria-label="Ampliar imagen del billete"/g,
    `aria-label="${escapeAttr(`Ampliar imagen del billete: ${label}`)}"`,
  );
  html = substAlias(html, 'note', note);
  return moveSpecTableBeforeImage(html);
}

function freezeZoomDialog(dialogHtml, note) {
  const key = String(note.key || 'note');
  const label = note.label || note.date || note.alt || 'Billete ampliado';
  let html = dialogHtml.replace(HANDLER_ATTR, '');
  html = html.replace(/\{\{\s*activeNoteJpg\s*\}\}/g, absUploadPath(note.jpg || '') || '');
  html = html.replace(/\{\{\s*activeNoteWebp\s*\}\}/g, absUploadPath(note.webp || note.jpg || '') || '');
  html = html.replace(/\{\{\s*imgTransform\s*\}\}/g, '');
  html = html.replace(/\{\{\s*imgCursor\s*\}\}/g, 'zoom-in');
  html = html.replace(/\{\{\s*zoomPercent\s*\}\}/g, '100%');
  html = html.replace(/\{\{\s*zoomOutDisabled\s*\}\}/g, 'true');
  html = html.replace(/\{\{\s*zoomInDisabled\s*\}\}/g, 'false');
  html = html.replace(/\{\{\s*[^}]+\s*\}\}/g, '');
  html = html.replace(
    /<div\s+role="dialog"[^>]*>/i,
    `<div data-zoom-dialog="${escapeAttr(key)}" hidden role="dialog" aria-modal="true" aria-label="${escapeAttr(`Billete ampliado: ${label}`)}" class="catalog-zoom-dialog">`,
  );
  html = html.replace(
    /aria-label="Billete ampliado"/i,
    `aria-label="${escapeAttr(`Billete ampliado: ${label}`)}"`,
  );
  html = html.replace(/aria-label="Alejar"/i, 'data-zoom-out aria-label="Alejar"');
  html = html.replace(/aria-label="Acercar"/i, 'data-zoom-in aria-label="Acercar"');
  html = html.replace(
    /(<span style="min-width:56px;[^"]*")/i,
    '$1 data-zoom-percent',
  );
  html = html.replace(/<img(\s)/i, '<img data-zoom-image$1');
  return html;
}

function prefixUploadPaths(html) {
  return html
    .replace(/(src|srcset)="uploads\//g, '$1="/uploads/')
    .replace(/(srcset)="([^"]*)"/g, (_, attr, value) => {
      const next = value.replace(/(^|[\s,])uploads\//g, '$1/uploads/');
      return `${attr}="${next}"`;
    });
}

function addNewWindowHints(html) {
  return html.replace(/<a\s([^>]*target="_blank"[^>]*)>([\s\S]*?)<\/a>/gi, (full, attrs, inner) => {
    if (/pestaña nueva|new tab|new window|nueva pestaña/i.test(inner)) return full;
    let nextAttrs = attrs;
    if (!/\brel=/i.test(nextAttrs)) {
      nextAttrs += ' rel="noopener noreferrer"';
    }
    return `<a ${nextAttrs}>${inner}<span style="font-style:italic; font-weight:400;"> (se abre en una pestaña nueva)</span></a>`;
  });
}

function hideZoomDialogs(html) {
  return html.replace(/<div(\s[^>]*role="dialog"[^>]*)>/gi, (full, attrs) => {
    if (/\bhidden\b/.test(attrs) && /data-zoom-dialog=/.test(attrs)) return full;
    let next = attrs;
    if (!/data-zoom-dialog=/.test(next)) {
      next += ' data-zoom-dialog="stacked"';
    }
    if (!/\bhidden\b/.test(next)) {
      next += ' hidden style="display:none"';
    }
    return `<div${next}>`;
  });
}

function firstUploads(template, logic) {
  const text = `${template}\n${logic}`;
  const uploads = [...text.matchAll(/uploads\/[a-zA-Z0-9._\/-]+\.(?:jpg|jpeg|png|webp)/g)].map(
    (match) => match[0],
  );
  return {
    jpg: uploads.find((item) => /\.jpe?g$/i.test(item) || /\.png$/i.test(item)),
    webp: uploads.find((item) => item.endsWith('.webp') && !item.includes('-640.')),
    webp640: uploads.find((item) => item.includes('-640.webp')),
  };
}

export function freezeTemplate(template, logic = '') {
  const notes = collectNotes(template, logic);
  const errorData = extractJsLiteral(logic, 'errorData');
  let html = template;

  if (/<sc-for/i.test(html)) {
    html = replaceTaggedBlocks(html, 'sc-for', (attrs, inner) => {
      const listName = listNameFromBinding(attr(attrs, 'list'));
      const items = resolveList(logic, listName);
      if (items.length === 0) {
        throw new Error(`catalog freeze: <sc-for list="${listName}"> expanded to zero items`);
      }
      return items.map((item) => noteTriggerHtml(inner, item)).join('\n');
    });
  }

  if (errorData) {
    html = html.replace(
      /\s+onClick="\{\{\s*errorNote\.openZoom\s*\}\}"/g,
      ` data-zoom-trigger="${escapeAttr(String(errorData.key || 'error'))}"`,
    );
    html = substAlias(html, 'errorNote', errorData);
  }

  if (notes.length) {
    html = replaceTaggedBlocks(html, 'sc-if', (attrs, inner) => {
      if (!/role="dialog"/i.test(inner)) return inner;
      return notes.map((note) => freezeZoomDialog(inner, note)).join('\n');
    });
  }

  html = html.replace(/<dc-import\s+name="BanknoteCard"[\s\S]*?(?:\/>|><\/dc-import>)/gi, '');
  html = html.replace(/<sc-if\b[^>]*>/gi, '');
  html = html.replace(/<\/sc-if>/gi, '');
  html = html.replace(HANDLER_ATTR, '');

  const uploads = firstUploads(template, logic);
  if (uploads.jpg) {
    html = html.replace(/\{\{\s*note\.jpg\s*\}\}/g, absUploadPath(uploads.jpg));
    html = html.replace(/\{\{\s*activeNoteJpg\s*\}\}/g, absUploadPath(uploads.jpg));
    html = html.replace(/\{\{\s*errorNote\.jpg\s*\}\}/g, absUploadPath(uploads.jpg));
  }
  if (uploads.webp) {
    html = html.replace(/\{\{\s*note\.webp\s*\}\}/g, absUploadPath(uploads.webp));
    html = html.replace(/\{\{\s*activeNoteWebp\s*\}\}/g, absUploadPath(uploads.webp));
    html = html.replace(/\{\{\s*errorNote\.webp\s*\}\}/g, absUploadPath(uploads.webp));
  }
  if (uploads.webp640) {
    html = html.replace(/\{\{\s*note\.webp640\s*\}\}/g, absUploadPath(uploads.webp640));
    html = html.replace(/\{\{\s*errorNote\.webp640\s*\}\}/g, absUploadPath(uploads.webp640));
  }

  html = html.replace(/\{\{\s*imgTransform\s*\}\}/g, '');
  html = html.replace(/\{\{\s*imgCursor\s*\}\}/g, 'zoom-in');
  html = html.replace(/\{\{\s*zoomPercent\s*\}\}/g, '100%');
  html = html.replace(/\{\{\s*zoomOpen\s*\}\}/g, 'false');
  html = html.replace(/\{\{\s*false\s*\}\}/g, 'false');
  html = html.replace(/\{\{\s*stopPropagation\s*\}\}/g, '');
  html = html.replace(/\{\{\s*zoomInDisabled\s*\}\}/g, 'false');
  html = html.replace(/\{\{\s*zoomOutDisabled\s*\}\}/g, 'true');
  html = html.replace(/\{\{\s*note\.[a-zA-Z0-9_]+\s*\}\}/g, '');
  html = html.replace(/\{\{\s*[^}]+\s*\}\}/g, '');

  html = prefixUploadPaths(html);
  html = hideZoomDialogs(html);
  html = addNewWindowHints(html);

  if (/<sc-for/i.test(html)) {
    throw new Error('catalog freeze left an unexpanded <sc-for> loop');
  }

  return html;
}

export function metadataFromNotes(notes, existing = {}) {
  const unique = (key) => [...new Set(notes.map((note) => note[key]).filter(Boolean).map(String))];
  const fill = (key, value) => {
    if (!value) return;
    if (existing[key]) return;
    existing[key] = value;
  };

  const dates = unique('date');
  const picks = [...unique('pick'), ...unique('catalogRef')].filter(Boolean);
  const denoms = unique('denomination');
  const printers = unique('printer');
  const conditions = unique('condition');

  fill('denomination', denoms.join(' · '));
  fill(
    'issueDate',
    dates.length === 0
      ? undefined
      : dates.length <= 4
        ? dates.join(' · ')
        : `${dates[0]} – ${dates[dates.length - 1]}`,
  );
  fill('catalogNumber', [...new Set(picks)].join(' · '));
  fill('printer', printers.join(' · '));
  fill('condition', conditions.join(' · '));
  return existing;
}
