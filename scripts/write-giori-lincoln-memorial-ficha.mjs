/**
 * Generator for the Magna/Giori Lincoln Memorial grass-green uniface test note
 * (Rothberg RGMB1/0NSU). Distinct from /coleccion/giori-press-test-note/
 * (cancelled Lincoln/Washington/Grant portraits).
 *
 * Usage: node scripts/write-giori-lincoln-memorial-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/giori-press-test-note-lincoln-memorial/';
const EN_PATH = '/en/collection/giori-press-test-note-lincoln-memorial/';
const IMG = '/uploads/magna-giori-lincoln-memorial-rgmb1-0nsu';
const ZOOM_ID = 'giori-press-test-note-lincoln-memorial';
const OUT = path.join(process.cwd(), 'src/content/catalog/giori-press-test-note-lincoln-memorial.json');

const SOURCE_CANDIDATES = [
  path.join(process.cwd(), 'public/uploads/magna-giori-lincoln-memorial-rgmb1-0nsu.png'),
  path.join(process.cwd(), 'public/uploads/magna-giori-lincoln-memorial-rgmb1-0nsu.jpg'),
];

let IMG_WIDTH = 1537;
let IMG_HEIGHT = 1023;
for (const candidate of SOURCE_CANDIDATES) {
  if (!existsSync(candidate)) continue;
  try {
    const meta = await sharp(candidate).metadata();
    if (meta.width && meta.height) {
      IMG_WIDTH = meta.width;
      IMG_HEIGHT = meta.height;
      console.log(`Using image dimensions from ${candidate}: ${IMG_WIDTH}x${IMG_HEIGHT}`);
    }
    break;
  } catch {
    /* encode later */
  }
}

const styles =
  "body { margin: 0; }\n    a { color: #6b521f; text-decoration: underline; text-decoration-color: rgba(138,109,59,0.35); }\n    a:hover { color: #5c4826; }\n    ::selection { background: rgba(138,109,59,0.25); }";

const ALT_ES =
  'Nota de prueba Magna/Giori uniface: reverso compuesto del Lincoln Memorial en verde hierba (arriba) y dorso en blanco (abajo)';
const ALT_EN =
  'Magna/Giori uniface test note: Lincoln Memorial composite back in grass green (top) and blank reverse (bottom)';

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
      ? 'Cara impresa (arriba) y dorso en blanco (abajo) — Colección de Notofilia.com'
      : 'Printed face (top) and blank back (bottom) — Notofilia.com Collection';
  return `<button
            data-zoom-trigger="${ZOOM_ID}"
            aria-label="${enlargeAria}"
            style="all:unset; display:block; width:100%; position:relative; cursor:zoom-in;"
          >
            <picture>
              <source srcset="${IMG}-640.webp 640w, ${IMG}.webp ${IMG_WIDTH}w" sizes="(max-width: 640px) 100vw, 760px" type="image/webp" />
              <img
                src="${IMG}.jpg"
                alt="${alt.replace(/"/g, '&quot;')}"
                width="${IMG_WIDTH}"
                height="${IMG_HEIGHT}"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                style="display:block; width:100%; height:auto;"
              />
            </picture>
            <span style="position:absolute; bottom:22px; right:22px; display:flex; align-items:center; gap:8px; background:rgba(10,10,9,0.82); color:#d8d2cd; font-size:13px; letter-spacing:0.08em; padding:8px 14px; border-radius:999px;">
              <span style="width:6px; height:6px; background:#d8d2cd; transform:rotate(45deg);"></span>
              ${enlarge}
            </span>
          </button>
          <span style="font-size:13px; letter-spacing:0.08em; color:#5c4e33; text-align:center; font-style:italic;">${caption}</span>`;
}

function zoomDialog(lang, alt) {
  const isEs = lang === 'es';
  const close = isEs ? 'Cerrar' : 'Close';
  const zoomOut = isEs ? 'Alejar' : 'Zoom out';
  const zoomIn = isEs ? 'Acercar' : 'Zoom in';
  const hint = isEs
    ? 'Arrastra para mover &middot; Rueda del ratón para ampliar'
    : 'Drag to move &middot; Mouse wheel to zoom';
  const dialogLabel = isEs ? 'Nota de prueba ampliada' : 'Enlarged test note';
  return `<div
              role="dialog"
              aria-modal="true"
              aria-label="${dialogLabel}"
              data-zoom-dialog="${ZOOM_ID}" hidden
             class="catalog-zoom-dialog">
              <button
                data-zoom-close
                aria-label="${close}"
                style="position:absolute; top:24px; right:28px; background:transparent; border:1px solid rgba(231,222,201,0.4); color:#d8d2cd; font-size:22px; line-height:1; width:44px; height:44px; border-radius:50%; cursor:pointer;"
              >&times;</button>
              <div style="position:absolute; top:24px; left:28px; display:flex; align-items:center; gap:6px; background:rgba(10,10,9,0.5); border:1px solid rgba(231,222,201,0.25); border-radius:999px; padding:6px;">
                <button type="button" data-zoom-out disabled aria-label="${zoomOut}" style="width:38px; height:38px; border-radius:50%; border:none; background:transparent; color:#d8d2cd; font-size:20px; cursor:pointer;">&minus;</button>
                <span data-zoom-percent style="min-width:56px; text-align:center; font-size:14px; color:#e7ddc4; letter-spacing:0.05em;">100%</span>
                <button type="button" data-zoom-in aria-label="${zoomIn}" style="width:38px; height:38px; border-radius:50%; border:none; background:transparent; color:#d8d2cd; font-size:20px; cursor:pointer;">&#43;</button>
              </div>
              <div style="overflow:hidden; max-width:100vw; max-height:100vh; width:100vw; height:100vh; touch-action:none;">
                <picture>
                  <source srcset="${IMG}.webp" type="image/webp" />
                  <img
                    src="${IMG}.jpg"
                    alt="${alt.replace(/"/g, '&quot;')}"
                    width="${IMG_WIDTH}"
                    height="${IMG_HEIGHT}"
                    draggable="false"
                    data-zoom-image
                    style="display:block; max-width:100vw; max-height:100vh; width:100vw; height:100vh; object-fit:contain; cursor:zoom-in; user-select:none;"
                  />
                </picture>
              </div>
              <span style="position:absolute; bottom:16px; left:50%; transform:translateX(-50%); font-size:14px; letter-spacing:0.06em; color:#b7ab8a; font-style:italic; pointer-events:none;">${hint}</span>
            </div>`;
}

function bullet(text) {
  return `<li style="display:flex; gap:12px; align-items:baseline;">
                <span style="width:6px; height:6px; min-width:6px; background:#5c4e33; transform:rotate(45deg); position:relative; top:-3px;"></span>
                <span style="font-size:19px; line-height:1.6; color:#332e22;">${text}</span>
              </li>`;
}

function noteP(html, last = false) {
  return `<p style="font-size:14px; line-height:1.6; color:#5c4e33; margin:0${last ? '' : ' 0 6px'};">${html}</p>`;
}

function sectionP(html, last = false) {
  return `<p style="font-size:19px; line-height:1.65; color:#332e22; margin:0${last ? '' : ' 0 12px'};">${html}</p>`;
}

function buildTemplate(lang) {
  const isEs = lang === 'es';
  const pagePath = isEs ? ES_PATH : EN_PATH;
  const hubHref = isEs
    ? '/coleccion/departamento-del-tesoro-de-ee-uu/'
    : '/en/collection/us-department-of-the-treasury/';
  const hubLabel = isEs ? 'Departamento del Tesoro de EE. UU.' : 'U.S. Department of the Treasury';
  const portraitsHref = isEs
    ? '/coleccion/giori-press-test-note/'
    : '/en/collection/giori-press-test-note/';
  const screen = isEs
    ? 'Estados Unidos — Nota de prueba Giori, Lincoln Memorial, verde uniface'
    : 'United States — Giori test note, Lincoln Memorial, green uniface';
  const eyebrow = isEs
    ? 'Nota de prueba de imprenta &middot; Estados Unidos &middot; c. 1970'
    : 'Printer’s test note &middot; United States &middot; c. 1970';
  const subtitle = isEs
    ? 'Lincoln Memorial &middot; verde hierba &middot; uniface &middot; RGMB1/0NSU'
    : 'Lincoln Memorial &middot; grass green &middot; uniface &middot; RGMB1/0NSU';
  const alt = isEs ? ALT_ES : ALT_EN;
  const tab = newTab(isEs);
  const unconfirmed = isEs
    ? '<span style="font-style:italic;">no confirmado</span>'
    : '<span style="font-style:italic;">unconfirmed</span>';

  const URLS = {
    bep: 'https://www.bep.gov',
    esylum: 'https://www.coinbooks.org/esylum_v15n53a10.html',
    ochs: 'https://www.ochs.org',
    nnp: 'https://nnp.wustl.edu/library/periodical/15296',
    auction:
      'https://www.greatcollections.com/Coin/1834670/ND-ca1970s-Giori-Test-Note-Magna-Press-Lincoln-Memorial-PMG-Gem-Uncirculated-66-EPQ',
  };

  const rows = isEs
    ? [
        ['País', 'Estados Unidos'],
        [
          'Origen',
          'Nota de prueba del proceso intaglio Giori / Magna, asociada en la literatura a ensayos de prensa para el Bureau of Engraving and Printing. Impresor del ejemplar: ' +
            unconfirmed,
        ],
        ['Denominación', 'Ninguna — no es curso legal ni un billete de la Reserva Federal'],
        ['Tipo de Emisión', 'Nota de prueba de imprenta (<em>press test note</em>), uniface'],
        ['Fecha Aproximada', 'Década de 1970 (sin fecha impresa)'],
        ['Número de Serie', 'Ninguno — el ejemplar no lleva series (Rothberg 0NSU)'],
        ['Material', 'Papel'],
        [
          'Dimensiones',
          'El formato de los billetes estadounidenses de tamaño pequeño es 156 &times; 66 mm. Medición propia: ' +
            unconfirmed,
        ],
        [
          'Referencia de Catálogo',
          'Sin número Friedberg ni Pick. Identificación de coleccionista: Magna/Giori Press Test Note · Lincoln Memorial Composite Back · Grass Green · Uniface · Rothberg RGMB1/0NSU',
        ],
        ['Tirada', unconfirmed],
        [
          'Variedades conocidas',
          'Este ejemplar: reverso compuesto del Lincoln Memorial en verde hierba, uniface. Distinto de la <a href="' +
            portraitsHref +
            '">nota Giori de tres retratos</a> (Lincoln, Washington y Grant cancelados) ya en este catálogo. La literatura describe también tipos con Jefferson al centro y ensayos en verde, gris y pardo.<sup style="font-size:12px;">2,3</sup> Censo: ' +
            unconfirmed,
        ],
        ['Fechas de circulación', 'Nunca emitida. No tuvo curso legal'],
        [
          'Base de la rareza',
          'Nota de prueba técnica, no un billete emitido. Parte de la familia Giori/Magna asociada al tesoro de Edgar L. Pigman (Geneva, Nueva York) y a una hoja donada al Ontario County Historical Society.<sup style="font-size:12px;">2,3</sup> Tirada y censo: ' +
            unconfirmed +
            '. Población NGC/PCGS de <em>este</em> ejemplar: no aplica (no encapsulado).',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular. Cara impresa en verde hierba con el Lincoln Memorial; dorso en blanco. Presentación: anverso y reverso apilados sobre fondo claro.',
        ],
        ['Fecha de última revisión factual', '25 de agosto de 2026', true],
      ]
    : [
        ['Country', 'United States'],
        [
          'Origin',
          'Giori / Magna intaglio press test note, associated in the literature with press trials for the Bureau of Engraving and Printing. Printer of this specimen: ' +
            unconfirmed,
        ],
        ['Denomination', 'None — not legal tender and not a Federal Reserve note'],
        ['Type of Issue', 'Printer’s test note (<em>press test note</em>), uniface'],
        ['Approximate Date', '1970s (no printed date)'],
        ['Serial Number', 'None — the piece carries no serials (Rothberg 0NSU)'],
        ['Material', 'Paper'],
        [
          'Dimensions',
          'U.S. small-size notes measure 156 &times; 66 mm. Direct measurement of this specimen: ' +
            unconfirmed,
        ],
        [
          'Catalog Reference',
          'No Friedberg or Pick number. Collector identification: Magna/Giori Press Test Note · Lincoln Memorial Composite Back · Grass Green · Uniface · Rothberg RGMB1/0NSU',
        ],
        ['Print run', unconfirmed],
        [
          'Known varieties',
          'This piece: Lincoln Memorial composite back in grass green, uniface. Distinct from the <a href="' +
            portraitsHref +
            '">three-portrait Giori note</a> (cancelled Lincoln, Washington, and Grant) already in this catalog. The literature also describes Jefferson-center types and green, grey, and brown trials.<sup style="font-size:12px;">2,3</sup> Census: ' +
            unconfirmed,
        ],
        ['Circulation dates', 'Never issued. Never legal tender'],
        [
          'Basis of rarity',
          'A technical test note, not an issued bill. Part of the Giori/Magna family linked to the Edgar L. Pigman hoard (Geneva, New York) and to a sheet donated to the Ontario County Historical Society.<sup style="font-size:12px;">2,3</sup> Print run and census: ' +
            unconfirmed +
            '. NGC/PCGS population of <em>this</em> specimen: not applicable (not slabbed).',
        ],
        [
          'State of the specimen shown',
          'Unslabbed. Printed face in grass green with the Lincoln Memorial; blank back. Presentation: stacked faces on a light ground.',
        ],
        ['Date of last factual review', '25 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en la Nota' : 'Key Details Visible on the Note';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          `<strong style="color:#1c1a15;">Identificación:</strong> Magna/Giori Press Test Note · Lincoln Memorial Composite Back · Grass Green · Uniface · Rothberg RGMB1/0NSU. No es la <a href="${portraitsHref}">nota Giori de tres retratos cancelados</a> ya catalogada.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">La prensa Giori:</strong> Gualtiero Giori desarrolló una prensa intaglio capaz de aplicar varios colores en una sola pasada. El Bureau of Engraving and Printing encargó equipos de este tipo; la literatura local de Ontario County atribuye ensayos de los años 1970 a una prensa construida en Geneva, Nueva York, por American Can Company bajo contrato de American Bank Note Company, con planchas «nonsense» del BEP.<sup style="font-size:12px;">1,2,3</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Tesoro Pigman y OCHS:</strong> en 2012 Smitty’s Coin and Currency anunció el tesoro de Edgar L. Pigman (ingeniero de American Can, 1932–2008). Terry Smith donó una hoja al Ontario County Historical Society; <cite>The E-Sylum</cite> reimprimió el artículo de <cite>Chronicles</cite> (Wilma Townsend).<sup style="font-size:12px;">2,3</sup> Este ejemplar no se identifica como esa hoja de museo.`,
          true,
        ),
      ]
    : [
        sectionP(
          `<strong style="color:#1c1a15;">Identification:</strong> Magna/Giori Press Test Note · Lincoln Memorial Composite Back · Grass Green · Uniface · Rothberg RGMB1/0NSU. Not the <a href="${portraitsHref}">three-portrait cancelled Giori note</a> already catalogued.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">The Giori press:</strong> Gualtiero Giori developed an intaglio press that could lay several colours in one pass. The Bureau of Engraving and Printing ordered such equipment; Ontario County literature attributes 1970s trials to a press built in Geneva, New York, by American Can Company under an American Bank Note Company contract, using BEP “nonsense” plates.<sup style="font-size:12px;">1,2,3</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Pigman hoard and OCHS:</strong> in 2012 Smitty’s Coin and Currency announced the Edgar L. Pigman hoard (American Can engineer, 1932–2008). Terry Smith donated a sheet to the Ontario County Historical Society; <cite>The E-Sylum</cite> reprinted the <cite>Chronicles</cite> article (Wilma Townsend).<sup style="font-size:12px;">2,3</sup> This specimen is not identified as that museum sheet.`,
          true,
        ),
      ];

  const details = isEs
    ? [
        bullet(
          '<strong style="color:#1c1a15;">Motivo central:</strong> Lincoln Memorial en un arco, tomado del reverso del billete de cinco dólares; a la derecha, «WASHINGTON, D.C.».',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Leyenda inferior:</strong> «THE UNITED STATES OF AMERICA» en capitales con sombra, del reverso del dólar de un dólar.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Cifras de prueba:</strong> «1» en las esquinas superiores; bloques y barras de registro, incluido un rectángulo sólido sobre el memorial.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Color:</strong> verde hierba (<em>grass green</em>) en una sola cara. El dorso de este ejemplar está en blanco (uniface).',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Series:</strong> ninguna. Presentación: cara impresa y dorso apilados, sin encapsulado.',
        ),
      ]
    : [
        bullet(
          '<strong style="color:#1c1a15;">Central motif:</strong> Lincoln Memorial in an arch, taken from the back of the five-dollar note; at right, “WASHINGTON, D.C.”',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Lower legend:</strong> “THE UNITED STATES OF AMERICA” in shadowed capitals, from the back of the one-dollar note.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Test numerals:</strong> “1” in the upper corners; register blocks and bars, including a solid rectangle over the memorial.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Colour:</strong> grass green on one face only. The back of this specimen is blank (uniface).',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Serials:</strong> none. Presentation: stacked printed face and blank back, not slabbed.',
        ),
      ];

  const notes = isEs
    ? [
        noteP(
          `1. <a href="${URLS.bep}" target="_blank" rel="noopener noreferrer">Bureau of Engraving and Printing${tab}</a>: imprenta federal de papel moneda; contexto del encargo de prensas Giori, no una ficha de este tipo.`,
        ),
        noteP(
          `2. <a href="${URLS.esylum}" target="_blank" rel="noopener noreferrer">The E-Sylum 15:53 (23 dic. 2012) — American Can Company and the Giori test notes${tab}</a>: reimpresión de <cite>Chronicles</cite> (Ontario County Historical Society; Wilma Townsend) sobre el tesoro Pigman y la hoja donada al museo.`,
        ),
        noteP(
          `3. <a href="${URLS.ochs}" target="_blank" rel="noopener noreferrer">Ontario County Historical Society${tab}</a> y <a href="${URLS.nnp}" target="_blank" rel="noopener noreferrer">Newman Numismatic Portal — periódico 15296${tab}</a>: institución que conserva una hoja; portal que indexa el mismo artículo.`,
        ),
        noteP(
          `4. <a href="${URLS.auction}" target="_blank" rel="noopener noreferrer">GreatCollections — Magna Press Lincoln Memorial (PMG 66 EPQ)${tab}</a>: ficha de subasta de un tipo comparable (verde hierba / dorso en blanco / sin serie). No es este ejemplar.`,
          true,
        ),
      ]
    : [
        noteP(
          `1. <a href="${URLS.bep}" target="_blank" rel="noopener noreferrer">Bureau of Engraving and Printing${tab}</a>: federal currency printer; context for Giori press orders, not a card for this type.`,
        ),
        noteP(
          `2. <a href="${URLS.esylum}" target="_blank" rel="noopener noreferrer">The E-Sylum 15:53 (23 Dec. 2012) — American Can Company and the Giori test notes${tab}</a>: reprint of <cite>Chronicles</cite> (Ontario County Historical Society; Wilma Townsend) on the Pigman hoard and the sheet given to the museum.`,
        ),
        noteP(
          `3. <a href="${URLS.ochs}" target="_blank" rel="noopener noreferrer">Ontario County Historical Society${tab}</a> and <a href="${URLS.nnp}" target="_blank" rel="noopener noreferrer">Newman Numismatic Portal — periodical 15296${tab}</a>: the museum that holds a sheet; the portal that indexes the same article.`,
        ),
        noteP(
          `4. <a href="${URLS.auction}" target="_blank" rel="noopener noreferrer">GreatCollections — Magna Press Lincoln Memorial (PMG 66 EPQ)${tab}</a>: auction card for a comparable type (grass green / blank back / no serial). Not this specimen.`,
          true,
        ),
      ];

  return `<div lang="${lang}" style="width:100%; min-height:100vh; background:#0a0a09; font-family:'Cormorant Garamond', serif; box-sizing:border-box;">

  <main data-pagefind-meta="url:${pagePath}" id="main-content" tabindex="-1" data-screen-label="${screen}" style="max-width:1180px; margin:0 auto; padding:56px 24px 80px; outline:none;">

    <a href="${hubHref}" style="display:inline-block; color:#e7ddc4; text-decoration:none; font-size:15px; letter-spacing:0.08em; margin-bottom:24px;">&larr; ${hubLabel}</a>

    <div style="background:#d8d2cd; border:1px solid rgba(10,10,9,0.08); border-radius:3px; padding:clamp(28px,4vw,64px); box-shadow:0 30px 70px rgba(0,0,0,0.45);">

      <div style="display:flex; flex-direction:column; align-items:center;">

        <div style="text-align:center; max-width:720px; margin:0 auto 40px;">
          <span style="display:block; font-size:14px; letter-spacing:0.22em; text-transform:uppercase; color:#5c4e33; margin-bottom:14px;">${eyebrow}</span>

          <h1 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(28px,4vw,44px); line-height:1.08; letter-spacing:0.01em; color:#1c1a15; margin:0 0 12px;">${isEs ? 'Nota de prueba Giori: Lincoln Memorial' : 'Giori test note: Lincoln Memorial'}</h1>

          <p style="font-size:clamp(19px,2vw,23px); font-style:italic; color:#4a4331; margin:0;">${subtitle}</p>
        </div>

        <div style="width:100%; max-width:760px; display:flex; flex-direction:column; gap:14px; margin:0 auto 56px;">
          ${pictureBlock(lang, alt)}
<div style="display:flex; flex-direction:column;">
            ${rows.map(([label, value, last]) => metaRow(label, value, Boolean(last))).join('\n            ')}
          </div>


          ${zoomDialog(lang, alt)}
        </div>

        <div style="width:100%; max-width:760px;">
          <section style="margin-top:44px;">
            <h2 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${contextTitle}</h2>
            ${context.join('\n            ')}
          </section>

          <section style="margin-top:36px;">
            <h2 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${detailsTitle}</h2>
            <ul style="list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px;">
              ${details.join('\n              ')}
            </ul>
          </section>
          <div style="width:100%; margin:44px auto 0; padding-top:20px; border-top:1px solid rgba(10,10,9,0.12);">
            <h2 style="font-size:13px; letter-spacing:0.14em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 10px; font-style:normal;">${notesTitle}</h2>
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
  title: 'Giori Lincoln Memorial, verde uniface | Notofilia',
  description:
    'Nota de prueba Magna/Giori: reverso Lincoln Memorial en verde hierba, uniface. Rothberg RGMB1/0NSU. Colección Notofilia.',
  keywords: [
    'giori press test note',
    'lincoln memorial',
    'magna press',
    'rothberg rgmb1',
    'nota de prueba',
    'bureau of engraving and printing',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Giori Lincoln Memorial, verde uniface',
  ogDescription:
    'Nota de prueba Magna/Giori: Lincoln Memorial en verde hierba, uniface. Rothberg RGMB1/0NSU.',
  ogImage: `${IMG}.jpg`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Departamento del Tesoro de EE. UU.',
            item: `${SITE}/coleccion/departamento-del-tesoro-de-ee-uu/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Nota de prueba Giori: Lincoln Memorial',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Nota de prueba Giori: Lincoln Memorial (verde hierba, uniface, RGMB1/0NSU)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Nota de prueba Magna/Giori uniface: reverso compuesto del Lincoln Memorial en verde hierba. Rothberg RGMB1/0NSU. Sin curso legal.',
        dateCreated: 'c. 1970s',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/departamento-del-tesoro-de-ee-uu/#page` },
        identifier: 'NF.giori-press-test-note-lincoln-memorial',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Rothberg', value: 'RGMB1/0NSU' },
          { '@type': 'PropertyValue', name: 'Tipo', value: 'Press test note, uniface, grass green' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'Sin encapsular; dorso en blanco' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.giori-press-test-note-lincoln-memorial',
    kind: 'banknote',
    title: 'Nota de prueba Giori: Lincoln Memorial',
    subtitle: 'Lincoln Memorial · verde hierba · uniface · RGMB1/0NSU',
    dateOrSeries: 'c. 1970',
    country: 'Estados Unidos',
    issuer: 'Bureau of Engraving and Printing (planchas de ensayo; no es emisión de curso legal)',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Departamento del Tesoro de EE. UU.', href: '/coleccion/departamento-del-tesoro-de-ee-uu/' },
      { name: 'Nota de prueba Giori: Lincoln Memorial' },
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
      denomination: 'Ninguna — no es curso legal',
      currency: 'ninguna',
      issuer: 'Bureau of Engraving and Printing (ensayo; no emisión)',
      printer: 'no confirmado (literatura: ensayos Giori/Magna / American Can, Geneva, NY)',
      issueDate: 'c. 1970 (sin fecha impresa)',
      series: 'ninguna',
      serialNumber: 'ninguno (Rothberg 0NSU)',
      catalogNumber: 'Rothberg RGMB1/0NSU; sin Friedberg ni Pick',
      material: 'Papel',
      dimensions: '156 × 66 mm (formato small-size EE. UU.); medición de este ejemplar: no confirmado',
      condition: 'Uniface, verde hierba; no encapsulado',
      status: 'proof',
      printRun: 'no confirmado',
      knownVarieties:
        'Este pliego: Lincoln Memorial composite back, grass green, uniface. Distinto de la nota Giori de tres retratos cancelados. Literatura: tipos Jefferson al centro; verde, gris y pardo. Censo: no confirmado.',
      circulationDates: 'Nunca emitida. No tuvo curso legal.',
      rarityBasis:
        'Nota de prueba técnica asociada al tesoro Pigman y a una hoja en OCHS. Tirada y censo: no confirmado. Población NGC/PCGS de este ejemplar: no aplica.',
      shownSpecimenState:
        'Sin encapsular. Cara impresa en verde hierba con el Lincoln Memorial; dorso en blanco. Anverso y reverso apilados. Grado numérico: no confirmado.',
      factualReviewDate: '2026-08-25',
    },
    render: 'astro-static',
    eyebrow: 'Nota de prueba de imprenta · Estados Unidos · c. 1970',
    resourced: true,
    context: {
      historical:
        'Nota de prueba Magna/Giori uniface, reverso compuesto del Lincoln Memorial en verde hierba, c. 1970. Rothberg RGMB1/0NSU. Distinta de la nota Giori de tres retratos. Literatura: ensayos en Geneva, NY (American Can / Pigman) para el BEP; hoja donada a OCHS.',
      design:
        'Cara impresa: Lincoln Memorial, WASHINGTON, D.C., THE UNITED STATES OF AMERICA, cifras 1 y bloques de registro en verde hierba. Dorso en blanco.',
      varieties:
        'RGMB1/0NSU (este tipo). Otros Giori: tres retratos cancelados; Jefferson al centro; colores verde, gris y pardo. Censo: no confirmado.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (cara impresa y dorso apilados)',
        note: 'Uniface: Lincoln Memorial en verde hierba; dorso en blanco; sin series. No encapsulado. Distinto de la nota Giori de tres retratos.',
      },
      {
        kind: 'printer',
        label: 'Bureau of Engraving and Printing',
        url: 'https://www.bep.gov',
        note: 'Imprenta federal; contexto del encargo de prensas Giori, no una ficha de este tipo',
      },
      {
        kind: 'museum',
        label: 'Ontario County Historical Society — Chronicles / tesoro Pigman (vía E-Sylum)',
        url: 'https://www.coinbooks.org/esylum_v15n53a10.html',
        note: 'Wilma Townsend; donación de Terry Smith de una hoja Giori; historia de Edgar L. Pigman y American Can en Geneva, NY',
      },
      {
        kind: 'museum',
        label: 'Ontario County Historical Society',
        url: 'https://www.ochs.org',
        note: 'Museo que conserva una hoja donada; no es este ejemplar',
      },
      {
        kind: 'catalog',
        label: 'Newman Numismatic Portal — periódico 15296',
        url: 'https://nnp.wustl.edu/library/periodical/15296',
        note: 'Indexación del mismo artículo de Chronicles / E-Sylum',
      },
      {
        kind: 'auction',
        label: 'GreatCollections — Magna Press Lincoln Memorial (PMG 66 EPQ)',
        url: 'https://www.greatcollections.com/Coin/1834670/ND-ca1970s-Giori-Test-Note-Magna-Press-Lincoln-Memorial-PMG-Gem-Uncirculated-66-EPQ',
        note: 'Tipo comparable: grass green / blank back / no serial. No es este ejemplar',
      },
    ],
    related: [
      { href: '/coleccion/giori-press-test-note/', title: 'Nota Giori de tres retratos (Lincoln, Washington y Grant)' },
      { href: '/coleccion/departamento-del-tesoro-de-ee-uu/', title: 'Departamento del Tesoro de EE. UU.' },
      { href: '/coleccion/estados-unidos/', title: 'Catálogo de Estados Unidos' },
    ],
  },
  legacyFile: 'billete-giori-press-test-note-lincoln-memorial.dc.html',
  sourceHash: createHash('sha1').update('giori-press-test-note-lincoln-memorial-rgmb1-0nsu-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Giori Lincoln Memorial green uniface | Notofilia',
      description:
        'Magna/Giori press test note: Lincoln Memorial composite back in grass green, uniface. Rothberg RGMB1/0NSU.',
      ogTitle: 'Giori Lincoln Memorial green uniface',
      ogDescription:
        'Magna/Giori test note: Lincoln Memorial in grass green, uniface. Rothberg RGMB1/0NSU. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'Giori test note: Lincoln Memorial',
      eyebrow: 'Printer’s test note · United States · c. 1970',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
