/**
 * Magna/Giori press test note — Lincoln Memorial composite, grass green, uniface.
 * Rothberg type label RGMB1/0NSU (collector code on the file; not Friedberg).
 * Distinct from /coleccion/giori-press-test-note/ (cancelled portraits).
 *
 * Usage: node scripts/write-giori-lincoln-memorial-uniface-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/giori-press-test-note-lincoln-memorial-uniface/';
const EN_PATH = '/en/collection/giori-press-test-note-lincoln-memorial-uniface/';
const SIBLING_ES = '/coleccion/giori-press-test-note/';
const SIBLING_EN = '/en/collection/giori-press-test-note/';
const IMG = '/uploads/us-giori-press-test-note-lincoln-memorial-uniface';
const ZOOM_ID = 'us-giori-press-test-note-lincoln-memorial-uniface';
const OUT = path.join(process.cwd(), 'src/content/catalog/giori-press-test-note-lincoln-memorial-uniface.json');

const SOURCE_CANDIDATES = [`${process.cwd()}${IMG}.png`, `${process.cwd()}${IMG}.jpg`.replace(SITE, '')].map(
  () => path.join(process.cwd(), 'public/uploads/us-giori-press-test-note-lincoln-memorial-uniface.png'),
);

let IMG_WIDTH = 1600;
let IMG_HEIGHT = 1200;
const dimFile = path.join(process.cwd(), 'public/uploads/us-giori-press-test-note-lincoln-memorial-uniface.png');
if (existsSync(dimFile)) {
  const meta = await sharp(dimFile).metadata();
  if (meta.width && meta.height) {
    IMG_WIDTH = meta.width;
    IMG_HEIGHT = meta.height;
    console.log(`Using image dimensions ${IMG_WIDTH}x${IMG_HEIGHT}`);
  }
}

const styles =
  "body { margin: 0; }\n    a { color: #6b521f; text-decoration: underline; text-decoration-color: rgba(138,109,59,0.35); }\n    a:hover { color: #5c4826; }\n    ::selection { background: rgba(138,109,59,0.25); }";

const ALT_ES =
  'Nota de prueba Magna/Giori uniface: Memorial Lincoln en verde hierba arriba; reverso en blanco abajo. Sin series. Colección Notofilia';
const ALT_EN =
  'Magna/Giori uniface test note: grass-green Lincoln Memorial composite at top; blank reverse below. No serials. Notofilia collection';

function newTab(isEs) {
  return isEs
    ? '<span style="font-style:italic; font-weight:400;"> (se abre en una pestaña nueva)</span>'
    : '<span style="font-style:italic; font-weight:400;"> (opens in a new tab)</span>';
}

function metaRow(label, value, last = false) {
  const borderBottom = last ? ' border-bottom:1px solid rgba(10,10,9,0.12);' : '';
  return `<div style="display:grid; grid-template-columns:minmax(8rem,200px) 1fr; gap:6px 20px; padding:14px 0; border-top:1px solid rgba(10,10,9,0.12);${borderBottom}">
            <span style="font-size:14px; letter-spacing:0.1em; text-transform:uppercase; color:#5c4e33;">${label}</span>
            <span style="font-size:19px; color:#221f19;">${value}</span>
          </div>`;
}

function pictureBlock(lang, alt) {
  const enlarge = lang === 'es' ? 'Ampliar' : 'Enlarge';
  const enlargeAria = lang === 'es' ? 'Ampliar imagen de la nota de prueba' : 'Enlarge image of the test note';
  const caption =
    lang === 'es'
      ? 'Cara impresa (arriba) y reverso en blanco (abajo) — Colección de Notofilia.com'
      : 'Printed side (top) and blank reverse (bottom) — Notofilia.com Collection';
  return `<button data-zoom-trigger="${ZOOM_ID}" aria-label="${enlargeAria}" style="all:unset; display:block; width:100%; position:relative; cursor:zoom-in;">
            <picture>
              <source srcset="${IMG}-640.webp 640w, ${IMG}.webp ${IMG_WIDTH}w" sizes="(max-width: 640px) 100vw, 760px" type="image/webp" />
              <img src="${IMG}.jpg" alt="${alt.replace(/"/g, '&quot;')}" width="${IMG_WIDTH}" height="${IMG_HEIGHT}" loading="eager" fetchpriority="high" decoding="async" style="display:block; width:100%; height:auto;" />
            </picture>
            <span style="position:absolute; bottom:22px; right:22px; display:flex; align-items:center; gap:8px; background:rgba(10,10,9,0.82); color:#d8d2cd; font-size:13px; letter-spacing:0.08em; padding:8px 14px; border-radius:999px;">
              <span style="width:6px; height:6px; background:#d8d2cd; transform:rotate(45deg);"></span>${enlarge}
            </span>
          </button>
          <span style="font-size:13px; letter-spacing:0.08em; color:#5c4e33; text-align:center; font-style:italic;">${caption}</span>`;
}

function zoomDialog(lang, alt) {
  const isEs = lang === 'es';
  return `<div role="dialog" aria-modal="true" aria-label="${isEs ? 'Nota ampliada' : 'Enlarged note'}" data-zoom-dialog="${ZOOM_ID}" hidden class="catalog-zoom-dialog">
              <button data-zoom-close aria-label="${isEs ? 'Cerrar' : 'Close'}" style="position:absolute; top:24px; right:28px; background:transparent; border:1px solid rgba(231,222,201,0.4); color:#d8d2cd; font-size:22px; line-height:1; width:44px; height:44px; border-radius:50%; cursor:pointer;">&times;</button>
              <div style="position:absolute; top:24px; left:28px; display:flex; align-items:center; gap:6px; background:rgba(10,10,9,0.5); border:1px solid rgba(231,222,201,0.25); border-radius:999px; padding:6px;">
                <button type="button" data-zoom-out disabled aria-label="${isEs ? 'Alejar' : 'Zoom out'}" style="width:38px; height:38px; border-radius:50%; border:none; background:transparent; color:#d8d2cd; font-size:20px; cursor:pointer;">&minus;</button>
                <span data-zoom-percent style="min-width:56px; text-align:center; font-size:14px; color:#e7ddc4; letter-spacing:0.05em;">100%</span>
                <button type="button" data-zoom-in aria-label="${isEs ? 'Acercar' : 'Zoom in'}" style="width:38px; height:38px; border-radius:50%; border:none; background:transparent; color:#d8d2cd; font-size:20px; cursor:pointer;">&#43;</button>
              </div>
              <div style="overflow:hidden; max-width:100vw; max-height:100vh; width:100vw; height:100vh; touch-action:none;">
                <picture>
                  <source srcset="${IMG}.webp" type="image/webp" />
                  <img src="${IMG}.jpg" alt="${alt.replace(/"/g, '&quot;')}" width="${IMG_WIDTH}" height="${IMG_HEIGHT}" draggable="false" data-zoom-image style="display:block; max-width:100vw; max-height:100vh; width:100vw; height:100vh; object-fit:contain; cursor:zoom-in; user-select:none;" />
                </picture>
              </div>
              <span style="position:absolute; bottom:16px; left:50%; transform:translateX(-50%); font-size:14px; letter-spacing:0.06em; color:#b7ab8a; font-style:italic; pointer-events:none;">${isEs ? 'Arrastra para mover &middot; Rueda del ratón para ampliar' : 'Drag to move &middot; Mouse wheel to zoom'}</span>
            </div>`;
}

function bullet(text) {
  return `<li style="display:flex; gap:12px; align-items:baseline;"><span style="width:6px; height:6px; min-width:6px; background:#5c4e33; transform:rotate(45deg); position:relative; top:-3px;"></span><span style="font-size:19px; line-height:1.6; color:#332e22;">${text}</span></li>`;
}
function noteP(html, last = false) {
  return `<p style="font-size:14px; line-height:1.6; color:#5c4e33; margin:0${last ? '' : ' 0 6px'};">${html}</p>`;
}
function sectionP(html, last = false) {
  return `<p style="font-size:19px; line-height:1.65; color:#332e22; margin:0${last ? '' : ' 0 12px'};">${html}</p>`;
}

function buildTemplate(lang) {
  const isEs = lang === 'es';
  const tab = newTab(isEs);
  const unconfirmed = isEs
    ? '<span style="font-style:italic;">no confirmado</span>'
    : '<span style="font-style:italic;">unconfirmed</span>';
  const sibling = isEs ? SIBLING_ES : SIBLING_EN;
  const backHref = isEs ? '/coleccion/departamento-del-tesoro-de-ee-uu/' : '/en/collection/us-department-of-the-treasury/';
  const backLabel = isEs ? 'Departamento del Tesoro de EE. UU.' : 'U.S. Department of the Treasury';
  const usHref = isEs ? '/coleccion/estados-unidos/' : '/en/collection/united-states/';
  const usLabel = isEs ? 'catálogo de Estados Unidos' : 'United States catalog';

  const URLS = {
    bep: 'https://www.bep.gov',
    esylum: 'https://www.coinbooks.org/esylum_v15n53a10.html',
    ochs: 'https://www.ochs.org',
  };

  const rows = isEs
    ? [
        ['País', 'Estados Unidos'],
        ['Tipo de Emisión', 'Nota de prueba de prensa (press test note), uniface, sin curso legal. Distinta de la <a href="' + sibling + '">nota Giori con retratos cancelados</a> de esta colección.'],
        ['Sujeto', 'Memorial Lincoln (collage / composite back), tinta verde hierba'],
        ['Impresor / prensa', 'Literatura de exonumia: pruebas asociadas a prensas Giori (y, en el comercio, «Magna Press»). Planta de Geneva, N.Y. / American Can Company en fuentes del Ontario County Historical Society. Atribución de <em>esta</em> hoja a ese lote: ' + unconfirmed],
        ['Material', 'Papel (sustrato de esta pieza: ' + unconfirmed + ')'],
        ['Fecha', 'c. 1970s en fichas de casa de subastas y dealers para el tipo Magna/Giori Lincoln Memorial. Fecha leída en este pliego: no hay'],
        ['Serie / Número', 'Ninguno visible. El código de archivo del ejemplar es Rothberg RGMB1/0NSU (etiqueta de coleccionista / dealer; no es Friedberg ni Pick)'],
        ['Dimensiones', 'Medición directa de este ejemplar: ' + unconfirmed],
        ['Referencia de Catálogo', 'Sin Friedberg ni Pick. Tipo: nota de prueba Giori / Magna, Memorial Lincoln, uniface, verde hierba. Código Rothberg transcrito del archivo: RGMB1/0NSU'],
        ['Tirada', unconfirmed],
        ['Variedades conocidas', 'La familia Giori de prueba incluye caras con retratos cancelados (Lincoln–Washington–Grant u otras) y reversos-collage con el Memorial Lincoln. Este ejemplar: solo la cara del Memorial, reverso en blanco. Prefijos Rothberg cercanos (p. ej. RGMBW1/0NS) aparecen en fichas de dealers; no se unifican aquí.'],
        ['Fechas de circulación', 'No circuló. No es dinero de curso legal.'],
        ['Base de la rareza', 'Material de prueba de prensa, no un tipo de circulación. Tirada y archivo BEP de esta variedad: ' + unconfirmed + '. Población NGC/PCGS de <em>este</em> ejemplar: no aplica (no encapsulado).'],
        ['Estado del ejemplar mostrado', 'Sin encapsular. Una cara impresa en verde; la otra en blanco. Presentación: ambas caras apiladas.'],
        ['Fecha de última revisión factual', '25 de agosto de 2026', true],
      ]
    : [
        ['Country', 'United States'],
        ['Type of Issue', 'Press test note, uniface, not legal tender. Distinct from the <a href="' + sibling + '">Giori note with cancelled portraits</a> in this collection.'],
        ['Subject', 'Lincoln Memorial (composite / collage back), grass-green ink'],
        ['Printer / press', 'Exonumia literature ties these trials to Giori presses (dealers also say “Magna Press”). Geneva, N.Y. / American Can Company appears in Ontario County Historical Society sources. Attribution of <em>this</em> sheet to that hoard: ' + unconfirmed],
        ['Material', 'Paper (substrate of this piece: ' + unconfirmed + ')'],
        ['Date', 'c. 1970s in auction/dealer cards for the Magna/Giori Lincoln Memorial type. Date read on this sheet: none'],
        ['Series / Number', 'None visible. The file label is Rothberg RGMB1/0NSU (collector/dealer code; not Friedberg or Pick)'],
        ['Dimensions', 'Direct measurement of this specimen: ' + unconfirmed],
        ['Catalog Reference', 'No Friedberg or Pick number. Type: Giori / Magna test note, Lincoln Memorial, uniface, grass green. Rothberg code transcribed from the file: RGMB1/0NSU'],
        ['Print run', unconfirmed],
        ['Known varieties', 'The Giori test family includes cancelled-portrait faces and Lincoln Memorial collage backs. This piece: Memorial side only, reverse blank. Nearby Rothberg prefixes (e.g. RGMBW1/0NS) appear on dealer tickets; they are not merged here.'],
        ['Circulation dates', 'Did not circulate. Not legal tender.'],
        ['Basis of rarity', 'Press-test material, not a circulating type. Print run and BEP archive for this variety: ' + unconfirmed + '. NGC/PCGS population of <em>this</em> piece: not applicable (not slabbed).'],
        ['State of the specimen shown', 'Unslabbed. One side printed in green; the other blank. Presentation: stacked faces.'],
        ['Date of last factual review', '25 August 2026', true],
      ];

  const context = isEs
    ? [
        sectionP(`<strong style="color:#1c1a15;">Identificación:</strong> Estados Unidos — nota de prueba Magna/Giori — Memorial Lincoln (composite back) — verde hierba — uniface — Rothberg RGMB1/0NSU. El código se transcribe del archivo del ejemplar, no de un catálogo Friedberg.`),
        sectionP(`<strong style="color:#1c1a15;">El tipo:</strong> a mediados del siglo XX Gualtiero Giori desarrolló prensas intaglio de varios colores. El BEP encargó pruebas; parte de la literatura de 2012 (Ontario County Historical Society, reimpresa en <cite>The E-Sylum</cite>) sitúa pruebas de Geneva, N.Y., ligadas a American Can Company / Edgar L. Pigman. No se afirma que <em>esta</em> hoja salga de ese lote.<sup style="font-size:12px;">1,2</sup>`),
        sectionP(`<strong style="color:#1c1a15;">No confundir:</strong> no es la <a href="${sibling}">nota Giori con Lincoln, Washington y Grant cancelados</a>, ni un billete de 5 dólares de circulación. Más contexto en el <a href="${usHref}">${usLabel}</a>.`, true),
      ]
    : [
        sectionP(`<strong style="color:#1c1a15;">Identification:</strong> United States — Magna/Giori press test note — Lincoln Memorial (composite back) — grass green — uniface — Rothberg RGMB1/0NSU. The code is transcribed from the specimen filename, not from Friedberg.`),
        sectionP(`<strong style="color:#1c1a15;">The type:</strong> in the mid-twentieth century Gualtiero Giori developed multi-colour intaglio presses. The BEP ordered trials; 2012 Ontario County Historical Society notes (reprinted in <cite>The E-Sylum</cite>) place Geneva, N.Y. trials with American Can Company / Edgar L. Pigman. This sheet is not assigned to that hoard.<sup style="font-size:12px;">1,2</sup>`),
        sectionP(`<strong style="color:#1c1a15;">Not to be confused with:</strong> the <a href="${sibling}">Giori note with cancelled Lincoln, Washington, and Grant portraits</a>, or an issued $5 Federal Reserve Note. More context in the <a href="${usHref}">${usLabel}</a>.`, true),
      ];

  const details = isEs
    ? [
        bullet('<strong style="color:#1c1a15;">Cara impresa:</strong> Memorial Lincoln al centro; «THE UNITED STATES OF AMERICA» abajo; «WASHINGTON, D.C.» a la derecha; marco lineal; bloques y fragmentos de «ONE» en las esquinas — collage de planchas, no un reverso de 5 dólares emitido.'),
        bullet('<strong style="color:#1c1a15;">Color:</strong> una tinta verde hierba (grass green) en esta foto.'),
        bullet('<strong style="color:#1c1a15;">Reverso:</strong> en blanco (uniface).'),
        bullet('<strong style="color:#1c1a15;">Series:</strong> no hay. Sin sello ni firmas de tesorero.'),
      ]
    : [
        bullet('<strong style="color:#1c1a15;">Printed side:</strong> Lincoln Memorial at centre; “THE UNITED STATES OF AMERICA” below; “WASHINGTON, D.C.” at right; linear frame; blocks and “ONE” fragments in the corners — a plate collage, not an issued $5 reverse.'),
        bullet('<strong style="color:#1c1a15;">Colour:</strong> a single grass-green ink in this photo.'),
        bullet('<strong style="color:#1c1a15;">Reverse:</strong> blank (uniface).'),
        bullet('<strong style="color:#1c1a15;">Serials:</strong> none. No Treasury seal or signatures.'),
      ];

  const notes = isEs
    ? [
        noteP(`1. <a href="${URLS.esylum}" target="_blank" rel="noopener noreferrer">The E-Sylum — American Can Company and the Giori test notes${tab}</a>: reimpresión de <cite>Chronicles</cite> (Ontario County Historical Society), 23 de diciembre de 2012.`),
        noteP(`2. <a href="${URLS.ochs}" target="_blank" rel="noopener noreferrer">Ontario County Historical Society${tab}</a>: museo citado en esa nota; no se inspeccionó aquí una ficha de inventario de <em>esta</em> pieza.`),
        noteP(`3. <a href="${URLS.bep}" target="_blank" rel="noopener noreferrer">Bureau of Engraving and Printing${tab}</a>: impresor federal de referencia; no publica un catálogo de esta variedad.`, true),
      ]
    : [
        noteP(`1. <a href="${URLS.esylum}" target="_blank" rel="noopener noreferrer">The E-Sylum — American Can Company and the Giori test notes${tab}</a>: reprint of <cite>Chronicles</cite> (Ontario County Historical Society), 23 December 2012.`),
        noteP(`2. <a href="${URLS.ochs}" target="_blank" rel="noopener noreferrer">Ontario County Historical Society${tab}</a>: museum cited in that note; no inventory card for <em>this</em> piece was checked here.`),
        noteP(`3. <a href="${URLS.bep}" target="_blank" rel="noopener noreferrer">Bureau of Engraving and Printing${tab}</a>: the federal printer of record; it does not publish a catalogue of this variety.`, true),
      ];

  return `<div lang="${lang}" style="width:100%; min-height:100vh; background:#0a0a09; font-family:'Cormorant Garamond', serif; box-sizing:border-box;">
  <main data-pagefind-meta="url:${isEs ? ES_PATH : EN_PATH}" id="main-content" tabindex="-1" data-screen-label="${isEs ? 'Nota de prueba Giori — Memorial Lincoln, uniface' : 'Giori test note — Lincoln Memorial, uniface'}" style="max-width:1180px; margin:0 auto; padding:56px 24px 80px; outline:none;">
    <a href="${backHref}" style="display:inline-block; color:#e7ddc4; text-decoration:none; font-size:15px; letter-spacing:0.08em; margin-bottom:24px;">&larr; ${backLabel}</a>
    <div style="background:#d8d2cd; border:1px solid rgba(10,10,9,0.08); border-radius:3px; padding:clamp(28px,4vw,64px); box-shadow:0 30px 70px rgba(0,0,0,0.45);">
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="text-align:center; max-width:720px; margin:0 auto 40px;">
          <span style="display:block; font-size:14px; letter-spacing:0.22em; text-transform:uppercase; color:#5c4e33; margin-bottom:14px;">${isEs ? 'Nota de prueba de prensa &middot; Estados Unidos &middot; c. 1970s' : 'Press test note &middot; United States &middot; c. 1970s'}</span>
          <h1 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(28px,4vw,44px); line-height:1.08; letter-spacing:0.01em; color:#1c1a15; margin:0 0 12px;">${isEs ? 'Nota de prueba Giori' : 'Giori press test note'}</h1>
          <p style="font-size:clamp(19px,2vw,23px); font-style:italic; color:#4a4331; margin:0;">${isEs ? 'Memorial Lincoln &middot; uniface &middot; verde hierba &middot; RGMB1/0NSU' : 'Lincoln Memorial &middot; uniface &middot; grass green &middot; RGMB1/0NSU'}</p>
        </div>
        <div style="width:100%; max-width:760px; display:flex; flex-direction:column; gap:14px; margin:0 auto 56px;">
          ${pictureBlock(lang, isEs ? ALT_ES : ALT_EN)}
          <div style="display:flex; flex-direction:column;">
            ${rows.map(([label, value, last]) => metaRow(label, value, Boolean(last))).join('\n            ')}
          </div>
          ${zoomDialog(lang, isEs ? ALT_ES : ALT_EN)}
        </div>
        <div style="width:100%; max-width:760px;">
          <section style="margin-top:44px;">
            <h2 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context'}</h2>
            ${context.join('\n            ')}
          </section>
          <section style="margin-top:36px;">
            <h2 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${isEs ? 'Detalles Clave Visibles en la Nota' : 'Key Details Visible on the Note'}</h2>
            <ul style="list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px;">${details.join('')}</ul>
          </section>
          <div style="width:100%; margin:44px auto 0; padding-top:20px; border-top:1px solid rgba(10,10,9,0.12);">
            <h2 style="font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 10px; font-style:normal;">${isEs ? 'Notas' : 'Notes'}</h2>
            ${notes.join('\n            ')}
          </div>
        </div>
      </div>
    </div>
  </main>
</div>`;
}

const data = {
  path: ES_PATH,
  title: 'Giori Lincoln Memorial, uniface | Notofilia',
  description: 'Nota de prueba Magna/Giori: Memorial Lincoln en verde, uniface. Rothberg RGMB1/0NSU.',
  keywords: ['giori press test note', 'magna press', 'lincoln memorial', 'rothberg rgmb1', 'uniface', 'nota de prueba'],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Giori Lincoln Memorial — uniface',
  ogDescription: 'Prueba Magna/Giori uniface: Memorial Lincoln en verde hierba, reverso en blanco. RGMB1/0NSU.',
  ogImage: `${IMG}.jpg`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Departamento del Tesoro de EE. UU.', item: `${SITE}/coleccion/departamento-del-tesoro-de-ee-uu/` },
          { '@type': 'ListItem', position: 3, name: 'Nota de prueba Giori — Memorial Lincoln, uniface', item: `${SITE}${ES_PATH}` },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Nota de prueba Giori — Memorial Lincoln, uniface (RGMB1/0NSU)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description: 'Nota de prueba Magna/Giori uniface con el Memorial Lincoln en verde hierba. Sin curso legal. Código Rothberg RGMB1/0NSU.',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/departamento-del-tesoro-de-ee-uu/#page` },
        identifier: 'NF.giori-press-test-note-lincoln-memorial-uniface',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Rothberg', value: 'RGMB1/0NSU' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'Prueba de prensa uniface; no encapsulado' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.giori-press-test-note-lincoln-memorial-uniface',
    kind: 'banknote',
    title: 'Nota de prueba Giori',
    subtitle: 'Memorial Lincoln · uniface · verde hierba · RGMB1/0NSU',
    dateOrSeries: 'c. 1970s (tipo; no leída en el pliego)',
    country: 'Estados Unidos',
    issuer: 'Prueba de prensa (BEP / Giori); sin emisor de circulación',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Departamento del Tesoro de EE. UU.', href: '/coleccion/departamento-del-tesoro-de-ee-uu/' },
      { name: 'Nota de prueba Giori — Memorial Lincoln, uniface' },
    ],
    images: {
      stacked: {
        src: `${IMG}.jpg`,
        srcWebp: `${IMG}.webp`,
        alt: ALT_ES,
        altEn: ALT_EN,
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
      },
      defaultView: 'stacked',
    },
    metadata: {
      denomination: 'Ninguna — nota de prueba, sin curso legal',
      currency: 'Ninguna',
      issuer: 'Prueba de prensa (BEP / Giori); sin emisor de circulación',
      printer: 'Prensa Giori / Magna (atribución de tipo; planta Geneva, N.Y. no confirmada para esta hoja)',
      issueDate: 'c. 1970s (tipo; no leída en este pliego)',
      series: 'ninguna visible',
      serialNumber: 'ninguno. Código de archivo: Rothberg RGMB1/0NSU',
      signatures: 'ninguna',
      catalogNumber: 'Rothberg RGMB1/0NSU (etiqueta; no Friedberg/Pick)',
      material: 'Papel; sustrato de este ejemplar: no confirmado',
      dimensions: 'no confirmado',
      watermark: 'no confirmado en esta foto',
      condition: 'Prueba uniface; no encapsulado',
      status: 'proof',
      printRun: 'no confirmado',
      knownVarieties:
        'Este pliego: Memorial Lincoln, uniface, verde hierba. Distinto de la nota Giori de retratos cancelados. Códigos Rothberg cercanos no se unifican aquí.',
      circulationDates: 'No circuló. No es curso legal.',
      rarityBasis:
        'Prueba de prensa. Tirada y archivo BEP: no confirmado. Población NGC/PCGS de este ejemplar: no aplica.',
      shownSpecimenState: 'Sin encapsular. Cara verde impresa; reverso en blanco. Ambas caras apiladas.',
      factualReviewDate: '2026-08-25',
    },
    render: 'astro-static',
    eyebrow: 'Nota de prueba de prensa · Estados Unidos · c. 1970s',
    resourced: true,
    context: {
      historical:
        'Nota de prueba Magna/Giori, Memorial Lincoln, uniface, verde hierba. RGMB1/0NSU del archivo. Distinta de la Giori de retratos cancelados. No se atribuye esta hoja al lote Pigman.',
      design: 'Collage del Memorial Lincoln y leyendas de 1/5 dólares. Reverso en blanco.',
      varieties: 'Uniface Memorial vs. retratos cancelados. Rothberg RGMB1/0NSU transcrito del archivo.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (cara impresa y reverso en blanco)',
        note: 'Uniface verde hierba; Memorial Lincoln; sin series. Archivo etiquetado Rothberg RGMB1/0NSU. No es specimen SPECIMEN ni billete emitido.',
      },
      {
        kind: 'museum',
        label: 'Ontario County Historical Society / The E-Sylum (23 dic. 2012)',
        url: 'https://www.coinbooks.org/esylum_v15n53a10.html',
        note: 'Contexto de pruebas Giori en Geneva, N.Y. (American Can / Pigman). No identifica esta hoja.',
      },
      {
        kind: 'central_bank',
        label: 'Bureau of Engraving and Printing',
        url: 'https://www.bep.gov',
        note: 'Impresor federal de referencia; no cataloga esta variedad',
      },
    ],
    related: [
      { href: SIBLING_ES, title: 'Nota Giori con retratos cancelados' },
      { href: '/coleccion/departamento-del-tesoro-de-ee-uu/', title: 'Departamento del Tesoro de EE. UU.' },
      { href: '/coleccion/estados-unidos/', title: 'Catálogo de Estados Unidos' },
    ],
  },
  legacyFile: 'billete-giori-press-test-note-lincoln-memorial-uniface.dc.html',
  sourceHash: createHash('sha1').update('giori-lincoln-memorial-uniface-rgmb1-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Giori Lincoln Memorial uniface | Notofilia',
      description: 'Magna/Giori test note: grass-green Lincoln Memorial, uniface. Rothberg RGMB1/0NSU.',
      ogTitle: 'Giori Lincoln Memorial — uniface',
      ogDescription: 'Magna/Giori uniface trial: grass-green Lincoln Memorial, blank reverse. RGMB1/0NSU.',
      template: buildTemplate('en'),
      recordTitle: 'Giori press test note',
      eyebrow: 'Press test note · United States · c. 1970s',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
