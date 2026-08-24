/**
 * Generator for the 1970s Giori Lincoln Memorial test note (green face, blank back).
 * Usage: node scripts/write-giori-lincoln-memorial-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/giori-test-note-lincoln-memorial/';
const EN_PATH = '/en/collection/giori-test-note-lincoln-memorial/';
const SLUG = 'us-giori-test-note-lincoln-memorial-green-1fa6c8b4';
const IMG = `/uploads/${SLUG}`;
const ZOOM_ID = 'giori-test-note-lincoln-memorial';
const OUT = path.join(process.cwd(), 'src/content/catalog/giori-test-note-lincoln-memorial.json');

const jpgPath = path.join(process.cwd(), `public/uploads/${SLUG}.jpg`);
let IMG_WIDTH = 1024;
let IMG_HEIGHT = 681;
if (existsSync(jpgPath)) {
  const meta = await sharp(jpgPath).metadata();
  if (meta.width && meta.height) {
    IMG_WIDTH = meta.width;
    IMG_HEIGHT = meta.height;
  }
}

const styles =
  "body { margin: 0; }\n    a { color: #6b521f; text-decoration: underline; text-decoration-color: rgba(138,109,59,0.35); }\n    a:hover { color: #5c4826; }\n    ::selection { background: rgba(138,109,59,0.25); }";

const ALT_ES =
  'Nota de prueba Giori de los años 1970: anverso verde con el Lincoln Memorial (arriba) y reverso en blanco (abajo)';
const ALT_EN =
  '1970s Giori test note: green obverse with the Lincoln Memorial (top) and blank reverse (bottom)';

function newTab(isEs) {
  return isEs
    ? '<span style="font-style:italic; font-weight:400;"> (se abre en una pestaña nueva)</span>'
    : '<span style="font-style:italic; font-weight:400;"> (opens in a new tab)</span>';
}

function extLink(href, label, isEs) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#6b521f;">${label}${newTab(isEs)}</a>`;
}

function intLink(href, label) {
  return `<a href="${href}" style="color:#6b521f;">${label}</a>`;
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
      ? 'Anverso (arriba) y reverso en blanco (abajo) — Colección de Notofilia.com'
      : 'Obverse (top) and blank reverse (bottom) — Notofilia.com Collection';
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

function p(text) {
  return `<p style="font-size:19px; line-height:1.65; color:#332e22; margin:0 0 12px;">${text}</p>`;
}

function noteP(text) {
  return `<p style="font-size:14px; line-height:1.6; color:#5c4e33; margin:0 0 6px;">${text}</p>`;
}

function buildTemplate(lang) {
  const isEs = lang === 'es';
  const pageUrl = isEs ? ES_PATH : EN_PATH;
  const hubHref = isEs
    ? '/coleccion/departamento-del-tesoro-de-ee-uu/'
    : '/en/collection/us-department-of-the-treasury/';
  const hubLabel = isEs
    ? '&larr; Departamento del Tesoro de EE. UU.'
    : '&larr; U.S. Department of the Treasury';
  const screen = isEs
    ? 'Estados Unidos — Nota de prueba Giori, Lincoln Memorial'
    : 'United States — Giori test note, Lincoln Memorial';
  const eyebrow = isEs
    ? 'Nota de prueba de imprenta &middot; Estados Unidos &middot; c. 1970'
    : 'Printer\'s test note &middot; United States &middot; c. 1970';
  const h1 = isEs ? 'Nota de prueba Giori: Lincoln Memorial' : 'Giori Test Note: Lincoln Memorial';
  const subtitle = isEs
    ? 'Anverso verde &middot; reverso en blanco &middot; sin denominación'
    : 'Green obverse &middot; blank reverse &middot; no denomination';
  const alt = isEs ? ALT_ES : ALT_EN;

  const rows = isEs
    ? [
        ['País', 'Estados Unidos'],
        [
          'Origen',
          'Nota de prueba del proceso intaglio Giori, asociada en la literatura especializada a ensayos de prensa para el Bureau of Engraving and Printing. Impresor del ejemplar: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Denominación', 'Ninguna — no es curso legal ni un billete de la Reserva Federal'],
        ['Tipo de Emisión', 'Nota de prueba de imprenta (<em>press test note</em>), uniface'],
        ['Fecha Aproximada', 'Década de 1970 (sin fecha impresa)'],
        ['Número de Serie', 'Ninguno — el ejemplar no lleva series'],
        ['Material', 'Papel'],
        [
          'Dimensiones',
          'El formato de los billetes estadounidenses de tamaño pequeño es 156 &times; 66 mm. Medición propia: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Referencia de Catálogo',
          'Sin número Friedberg ni Pick. En el comercio se describe como Giori test note, Lincoln Memorial, green front, blank back',
        ],
        ['Tirada', '<span style="font-style:italic;">no confirmado</span>'],
        [
          'Variedades conocidas',
          'Este ejemplar: anverso verde uniface con el Lincoln Memorial. Distinto de la nota Giori de tres retratos (Lincoln, Washington y Grant) ya en este catálogo. La literatura describe también tipos con Jefferson al centro y ensayos en verde, gris y pardo.<sup style="font-size:12px;">1,4</sup> Censo: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Fechas de circulación',
          'Nunca emitida. No tuvo curso legal',
        ],
        [
          'Base de la rareza',
          'Impresión de ensayo, fuera de Friedberg y Pick. El tipo uniface verde con Lincoln Memorial aparece en el comercio como pieza de los años 1970; población certificada: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular; anverso y reverso apilados sobre fondo blanco; talla dulce verde en el anverso; reverso completamente en blanco; sin series ni sello del Tesoro. Grado numérico: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Fecha de última revisión factual', '24 de agosto de 2026', true],
      ]
    : [
        ['Country', 'United States'],
        [
          'Origin',
          'Test note from the Giori intaglio process, linked in specialist literature to press trials for the Bureau of Engraving and Printing. Printer of this specimen: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Denomination', 'None — not legal tender and not a Federal Reserve note'],
        ['Type of Issue', 'Printer\'s test note (<em>press test note</em>), uniface'],
        ['Approximate Date', '1970s (no printed date)'],
        ['Serial Number', 'None — this specimen has no serials'],
        ['Material', 'Paper'],
        [
          'Dimensions',
          'U.S. small-size currency measures 156 &times; 66 mm. Own measurement: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Catalog Reference',
          'No Friedberg or Pick number. In the trade, described as a Giori test note, Lincoln Memorial, green front, blank back',
        ],
        ['Print Run', '<span style="font-style:italic;">unconfirmed</span>'],
        [
          'Known Varieties',
          'This specimen: uniface green obverse with the Lincoln Memorial. Distinct from the three-portrait Giori note (Lincoln, Washington, and Grant) already in this catalog. The literature also describes Jefferson-center types and green, gray, and brown trials.<sup style="font-size:12px;">1,4</sup> Census: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Circulation Dates', 'Never issued. Not legal tender'],
        [
          'Rarity Basis',
          'Trial printing, outside Friedberg and Pick. The uniface green Lincoln Memorial type appears in the trade as a 1970s piece; certified population: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Shown Specimen State',
          'Unencapsulated; obverse and reverse stacked on a white background; green intaglio on the face; fully blank back; no serials or Treasury seal. Numeric grade: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Date of Last Factual Review', '24 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const context = isEs
    ? [
        p(
          `<strong style="color:#1c1a15;">Una prueba, no un billete:</strong> el ejemplar reúne elementos grabados del papel moneda estadounidense —sobre todo el Lincoln Memorial del reverso del billete de 5 dólares y la leyenda THE UNITED STATES OF AMERICA— pero no lleva series, sello del Tesoro ni cláusula de curso legal. Es una nota de ensayo de prensa, no dinero.`,
        ),
        p(
          `<strong style="color:#1c1a15;">El proceso Giori:</strong> Gualtiero Giori desarrolló una prensa intaglio capaz de aplicar varios colores en una sola pasada. El Bureau of Engraving and Printing adoptó esa tecnología para la producción del dólar. Las notas de prueba Giori que circulan entre coleccionistas documentan ensayos de registro, densidad de tinta y planchas «sin sentido», no una emisión oficial.<sup style="font-size:12px;">1,4</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">Ginebra, Nueva York, y el lote Pigman:</strong> un artículo de 2012 de la Ontario County Historical Society, reproducido en <em>The E-Sylum</em>, sitúa el diseño de una prensa Giori en la planta de American Can Company en Geneva, Nueva York, a cargo del ingeniero Edgar L. Pigman, con planchas de prueba del BEP impresas en pliegos de 32. Ese relato describe sobre todo el tipo de tres retratos (Washington, Lincoln y Grant).<sup style="font-size:12px;">1,2</sup> No hay prueba de primera mano de que <em>este</em> ejemplar uniface se imprimiera en Geneva.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Este tipo, no el de tres retratos:</strong> el anverso verde con el Lincoln Memorial y el reverso en blanco es un tipo distinto de la ${intLink('/coleccion/giori-press-test-note/', 'nota Giori de Lincoln, Washington y Grant')} ya catalogada aquí. Ensayistas posteriores atribuyen algunas piezas verdes uniface a tiradas tardías en el norte del estado de Nueva York; esa atribución de taller para este ejemplar permanece <span style="font-style:italic;">no confirmada</span>.<sup style="font-size:12px;">4</sup>`,
        ),
      ]
    : [
        p(
          `<strong style="color:#1c1a15;">A test piece, not a banknote:</strong> the specimen gathers engraved elements of United States paper money —chiefly the Lincoln Memorial from the back of the $5 note and the legend THE UNITED STATES OF AMERICA— but it has no serials, Treasury seal, or legal-tender clause. It is a press trial, not money.`,
        ),
        p(
          `<strong style="color:#1c1a15;">The Giori process:</strong> Gualtiero Giori developed an intaglio press that could lay down several colors in a single pass. The Bureau of Engraving and Printing adopted that technology for dollar production. Giori test notes in collectors’ hands document trials of register, ink density, and “nonsense” plates, not an official issue.<sup style="font-size:12px;">1,4</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">Geneva, New York, and the Pigman hoard:</strong> a 2012 Ontario County Historical Society article, reprinted in <em>The E-Sylum</em>, places the design of a Giori press at the American Can Company plant in Geneva, New York, under engineer Edgar L. Pigman, with BEP trial plates printed in sheets of 32. That account mainly describes the three-portrait type (Washington, Lincoln, and Grant).<sup style="font-size:12px;">1,2</sup> There is no first-hand proof that <em>this</em> uniface specimen was printed in Geneva.`,
        ),
        p(
          `<strong style="color:#1c1a15;">This type, not the three-portrait note:</strong> the green Lincoln Memorial face and blank back are a different type from the ${intLink('/en/collection/giori-press-test-note/', 'Giori note with Lincoln, Washington, and Grant')} already in this catalog. Later essays attribute some green uniface pieces to later printings in upstate New York; a workshop attribution for this specimen remains <span style="font-style:italic;">unconfirmed</span>.<sup style="font-size:12px;">4</sup>`,
        ),
      ];

  const detailsTitle = isEs ? 'Detalles Clave Visibles en la Nota' : 'Key Details Visible on the Note';
  const details = isEs
    ? [
        bullet(
          `<strong style="color:#1c1a15;">Lincoln Memorial:</strong> grabado central del edificio, con columnas y frontón, bajo un arco de líneas. Es la viñeta del reverso del billete de 5 dólares, no el retrato de Lincoln.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Leyenda inferior:</strong> «THE UNITED STATES OF AMERICA» en capitales con sombra de bloque, a lo ancho del anverso.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">WASHINGTON, D.C.:</strong> a la derecha del Memorial, en capitales serif pequeñas.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">ONE en las esquinas:</strong> la palabra «ONE» estilizada arriba a la izquierda y a la derecha, tomada del vocabulario del billete de 1 dólar.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Barras de ensayo:</strong> bloque verde sólido a la izquierda del Memorial (densidad de tinta) y una franja superior con formas geométricas (registro).`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Reverso en blanco:</strong> el dorso no lleva impresión. El ejemplar es uniface.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Color:</strong> un solo verde de talla dulce sobre papel crema; sin sello, series ni cláusulas.`,
        ),
      ]
    : [
        bullet(
          `<strong style="color:#1c1a15;">Lincoln Memorial:</strong> central engraving of the building, with columns and pediment, under a line arch. It is the $5 reverse vignette, not Lincoln’s portrait.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Bottom legend:</strong> “THE UNITED STATES OF AMERICA” in capitals with a block shadow, across the face.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">WASHINGTON, D.C.:</strong> to the right of the Memorial, in small serif capitals.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">ONE in the corners:</strong> a stylized “ONE” at upper left and upper right, taken from the $1 note’s vocabulary.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Trial bars:</strong> a solid green block to the left of the Memorial (ink density) and an upper strip of geometric shapes (register).`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Blank reverse:</strong> the back carries no printing. The specimen is uniface.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Color:</strong> a single intaglio green on cream paper; no seal, serials, or clauses.`,
        ),
      ];

  const notesTitle = isEs ? 'Notas' : 'Notes';
  const notes = isEs
    ? [
        noteP(
          `1. ${extLink('https://www.coinbooks.org/esylum_v15n53a10.html', 'The E-Sylum — American Can Company and the Giori test notes', true)}: reproduce un artículo de 2012 de la Ontario County Historical Society (Wilma Townsend / Terry Smith) sobre la prensa diseñada por Edgar L. Pigman en Geneva, N.Y., planchas de prueba del BEP y pliegos de 32.`,
        ),
        noteP(
          `2. ${extLink('https://nnp.wustl.edu/library/periodical/15296', 'Newman Numismatic Portal — misma crónica de OCHS', true)}: digitaliza el texto sobre American Can, Pigman y las notas de prueba Giori.`,
        ),
        noteP(
          `3. Examen del ejemplar de la colección Notofilia: anverso verde uniface con Lincoln Memorial; reverso en blanco; sin series. Foto de origen del coleccionista, sin recorte.`,
        ),
        noteP(
          `4. ${extLink('https://img1.wsimg.com/blobby/go/02d670a2-d62a-43f2-8b0e-9753be994e2f/An%20Alternate%20Look%20at%20the%20%E2%80%9CGiori%E2%80%9D%20Jefferson%20Tes.pdf', 'An Alternate Look at the “Giori” Jefferson Test Notes', true)}: distingue el tipo de tres retratos (lote Pigman) de otras pruebas Giori; discute atribuciones de taller y fechas. Ensayo especializado, no un documento del BEP.`,
        ),
      ]
    : [
        noteP(
          `1. ${extLink('https://www.coinbooks.org/esylum_v15n53a10.html', 'The E-Sylum — American Can Company and the Giori test notes', false)}: reprints a 2012 Ontario County Historical Society article (Wilma Townsend / Terry Smith) on the press designed by Edgar L. Pigman in Geneva, N.Y., BEP trial plates, and sheets of 32.`,
        ),
        noteP(
          `2. ${extLink('https://nnp.wustl.edu/library/periodical/15296', 'Newman Numismatic Portal — same OCHS chronicle', false)}: digitizes the text on American Can, Pigman, and Giori test notes.`,
        ),
        noteP(
          `3. Examination of the Notofilia specimen: uniface green obverse with the Lincoln Memorial; blank reverse; no serials. Collector-submitted photograph, uncropped.`,
        ),
        noteP(
          `4. ${extLink('https://img1.wsimg.com/blobby/go/02d670a2-d62a-43f2-8b0e-9753be994e2f/An%20Alternate%20Look%20at%20the%20%E2%80%9CGiori%E2%80%9D%20Jefferson%20Tes.pdf', 'An Alternate Look at the “Giori” Jefferson Test Notes', false)}: distinguishes the three-portrait type (Pigman hoard) from other Giori trials; discusses workshop attributions and dates. A specialist essay, not a BEP document.`,
        ),
      ];

  const relatedTitle = isEs ? 'Sigue explorando' : 'Keep exploring';
  const related = isEs
    ? [
        ['/coleccion/departamento-del-tesoro-de-ee-uu/', 'Departamento del Tesoro de EE. UU.'],
        ['/coleccion/giori-press-test-note/', 'Nota Giori de tres retratos'],
        ['/coleccion/estados-unidos/', 'Catálogo de Estados Unidos'],
        ['/coleccion/un-dolar-sello-rojo-1928/', 'United States Note $1, sello rojo (1928)'],
        ['/coleccion/certificado-de-oro-10-dolares-1928/', 'Certificado de oro $10 (1928)'],
      ]
    : [
        ['/en/collection/us-department-of-the-treasury/', 'U.S. Department of the Treasury'],
        ['/en/collection/giori-press-test-note/', 'Three-portrait Giori test note'],
        ['/en/collection/united-states/', 'United States catalog'],
        ['/en/collection/one-dollar-red-seal-1928/', 'United States Note $1, red seal (1928)'],
        ['/en/collection/gold-certificate-10-dollars-1928/', 'Gold certificate $10 (1928)'],
      ];

  return `<div lang="${lang}" style="width:100%; min-height:100vh; background:#0a0a09; font-family:'Cormorant Garamond', serif; box-sizing:border-box;">

  <main data-pagefind-meta="url:${pageUrl}" id="main-content" tabindex="-1" data-screen-label="${screen}" style="max-width:1180px; margin:0 auto; padding:56px 24px 80px; outline:none;">

    <a href="${hubHref}" style="display:inline-block; color:#e7ddc4; text-decoration:none; font-size:15px; letter-spacing:0.08em; margin-bottom:24px;">${hubLabel}</a>

    <div style="background:#d8d2cd; border:1px solid rgba(10,10,9,0.08); border-radius:3px; padding:clamp(28px,4vw,64px); box-shadow:0 30px 70px rgba(0,0,0,0.45);">

      <div style="display:flex; flex-direction:column; align-items:center;">

        <div style="text-align:center; max-width:720px; margin:0 auto 40px;">
          <span style="display:block; font-size:14px; letter-spacing:0.22em; text-transform:uppercase; color:#5c4e33; margin-bottom:14px;">${eyebrow}</span>

          <h1 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(28px,4vw,44px); line-height:1.08; letter-spacing:0.01em; color:#1c1a15; margin:0 0 12px;">${h1}</h1>

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
    <aside aria-labelledby="related-reading-heading" style="width:100%; max-width:900px; margin:48px auto 0; padding-top:32px; border-top:1px solid rgba(231,222,201,0.18);">
      <h2 id="related-reading-heading" style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#b7ab8a; font-weight:600; margin:0 0 16px; font-style:normal;">${relatedTitle}</h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px;">
        ${related
          .map(
            ([href, title]) =>
              `<a href="${href}" style="display:block; padding:16px; border:1px solid rgba(231,222,201,0.22); color:#d8d2cd; text-decoration:none; line-height:1.45;">${title}</a>`,
          )
          .join('\n        ')}
      </div>
    </aside>
  </main>

</div>`;
}

const data = {
  path: ES_PATH,
  title: 'Nota Giori Lincoln Memorial, c. 1970 | Notofilia',
  description:
    'Nota de prueba Giori de los años 1970: anverso verde del Lincoln Memorial y reverso en blanco. Sin curso legal. Colección Notofilia.',
  keywords: [
    'giori test note',
    'lincoln memorial',
    'nota de prueba',
    'bureau of engraving and printing',
    'press test note',
    'uniface',
    'notafilia',
    'numismática de estados unidos',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Nota Giori Lincoln Memorial — anverso verde, c. 1970',
  ogDescription:
    'Nota de prueba Giori uniface: Lincoln Memorial en verde y reverso en blanco. Colección Notofilia.',
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
        name: 'Nota de prueba Giori — Lincoln Memorial, anverso verde, reverso en blanco',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Nota de prueba del proceso Giori, década de 1970: anverso verde con el Lincoln Memorial y reverso en blanco. Sin curso legal.',
        dateCreated: 'c. 1970s',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/departamento-del-tesoro-de-ee-uu/#page` },
        identifier: 'NF.giori-test-note-lincoln-memorial',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Tipo', value: 'Press test note, uniface' },
          { '@type': 'PropertyValue', name: 'Motivo', value: 'Lincoln Memorial' },
          { '@type': 'PropertyValue', name: 'Color', value: 'Verde (anverso); reverso en blanco' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.giori-test-note-lincoln-memorial',
    kind: 'banknote',
    title: 'Nota de prueba Giori: Lincoln Memorial',
    subtitle: 'Anverso verde · reverso en blanco · sin denominación',
    dateOrSeries: 'Nota de prueba de imprenta · Estados Unidos · c. 1970',
    country: 'Estados Unidos',
    issuer: 'Ensayo de prensa Giori (sin entidad emisora de curso legal)',
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
      currency: 'Ninguna',
      issuer: 'Ensayo de prensa Giori (sin entidad emisora de curso legal)',
      printer: 'Proceso Giori; taller del ejemplar no confirmado',
      issueDate: 'c. 1970s (sin fecha impresa)',
      series: 'Giori press test note, Lincoln Memorial green uniface',
      serialNumber: 'Ninguno',
      catalogNumber: 'Sin Friedberg ni Pick',
      material: 'Papel',
      dimensions: 'Formato de tamaño pequeño estadounidense 156 × 66 mm. Medición propia: no confirmado',
      condition: 'Sin encapsular; grado numérico no confirmado',
      status: 'other',
      printRun: 'no confirmado',
      knownVarieties:
        'Uniface verde con Lincoln Memorial (esta ficha). Distinto del tipo de tres retratos ya catalogado. Literatura: tipos con Jefferson al centro; ensayos en verde, gris y pardo. Censo: no confirmado',
      circulationDates: 'Nunca emitida. No tuvo curso legal',
      rarityBasis:
        'Impresión de ensayo, fuera de Friedberg y Pick. El tipo uniface verde con Lincoln Memorial aparece en el comercio como pieza de los años 1970. Población certificada: no confirmado',
      shownSpecimenState:
        'Sin encapsular; anverso y reverso apilados sobre fondo blanco; talla dulce verde; reverso en blanco; sin series ni sello. Grado numérico: no confirmado',
      factualReviewDate: '2026-08-24',
    },
    render: 'astro-static',
    eyebrow: 'Nota de prueba de imprenta · Estados Unidos · c. 1970',
    resourced: true,
    context: {
      historical:
        'Ensayo del proceso intaglio Giori asociado a pruebas de prensa para el BEP. El relato de American Can / Pigman en Geneva, N.Y., documenta sobre todo el tipo de tres retratos; la impresión de este uniface en Geneva no está confirmada.',
      design:
        'Anverso verde uniface con el Lincoln Memorial, THE UNITED STATES OF AMERICA, WASHINGTON, D.C., ONE en las esquinas y barras de ensayo. Reverso en blanco. Sin series ni sello.',
      varieties:
        'Este tipo (Lincoln Memorial verde, reverso en blanco) es distinto de la nota Giori de Lincoln, Washington y Grant. Otras pruebas Giori incluyen Jefferson al centro y colores verde, gris y pardo.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (Lincoln Memorial uniface verde)',
        note: 'Anverso verde con Memorial, leyenda THE UNITED STATES OF AMERICA y reverso en blanco; sin series; foto apilada sobre fondo blanco',
      },
      {
        kind: 'press',
        label: 'The E-Sylum — American Can Company and the Giori test notes',
        url: 'https://www.coinbooks.org/esylum_v15n53a10.html',
        note: 'Crónica OCHS 2012: Pigman, American Can en Geneva, N.Y., planchas BEP, pliegos de 32',
      },
      {
        kind: 'secondary',
        label: 'Newman Numismatic Portal — OCHS Giori test notes chronicle',
        url: 'https://nnp.wustl.edu/library/periodical/15296',
        note: 'Digitalización del mismo relato sobre American Can y las notas Giori',
      },
      {
        kind: 'secondary',
        label: 'An Alternate Look at the “Giori” Jefferson Test Notes',
        url: 'https://img1.wsimg.com/blobby/go/02d670a2-d62a-43f2-8b0e-9753be994e2f/An%20Alternate%20Look%20at%20the%20%E2%80%9CGiori%E2%80%9D%20Jefferson%20Tes.pdf',
        note: 'Distingue el tipo de tres retratos de otras pruebas Giori; atribuciones de taller no son documentos BEP',
      },
    ],
    related: [
      { href: '/coleccion/departamento-del-tesoro-de-ee-uu/', title: 'Departamento del Tesoro de EE. UU.' },
      { href: '/coleccion/giori-press-test-note/', title: 'Nota Giori de tres retratos' },
      { href: '/coleccion/estados-unidos/', title: 'Catálogo de Estados Unidos' },
      { href: '/coleccion/un-dolar-sello-rojo-1928/', title: 'United States Note $1, sello rojo (1928)' },
      { href: '/coleccion/certificado-de-oro-10-dolares-1928/', title: 'Certificado de oro $10 (1928)' },
    ],
  },
  legacyFile: 'billete-giori-test-note-lincoln-memorial.dc.html',
  sourceHash: createHash('sha1').update('giori-test-note-lincoln-memorial-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '1970s Giori Test Note, Lincoln Memorial | Notofilia',
      description:
        '1970s Giori press test note: green Lincoln Memorial face and blank back. Not legal tender. Notofilia collection.',
      ogTitle: 'Giori Test Note — Lincoln Memorial, green uniface',
      ogDescription:
        'Uniface Giori test note: green Lincoln Memorial obverse and blank reverse. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'Giori Test Note: Lincoln Memorial',
      eyebrow: 'Printer\'s test note · United States · c. 1970',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
