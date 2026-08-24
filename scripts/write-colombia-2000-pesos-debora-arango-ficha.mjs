/**
 * Generator for the Banco de la República 2.000 pesos Débora Arango ficha
 * (Pick 458 type; this piece catalogued as unfinished / proof-type).
 *
 * Usage: node scripts/write-colombia-2000-pesos-debora-arango-ficha.mjs
 *
 * Image dimensions default until the user-submitted sleeve photo is encoded
 * (scripts/process-colombia-2000-pesos-debora-arango-image.mjs).
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango/';
const EN_PATH = '/en/collection/colombia/banco-de-la-republica-2000-pesos-debora-arango/';
const IMG = '/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango';
const ZOOM_ID = 'colombia-banco-de-la-republica-2000-pesos-debora-arango';
const OUT = path.join(
  process.cwd(),
  'src/content/catalog/colombia--banco-de-la-republica-2000-pesos-debora-arango.json',
);

const SOURCE_CANDIDATES = [
  path.join(process.cwd(), 'public/uploads/Colombia 2000 pesos - Error.png'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango.png'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango.jpg'),
  path.join(process.cwd(), 'public/uploads/Colombia - BDR 2000pesos Debora Arango.png'),
  path.join(process.cwd(), 'public/uploads/Colombia - BDR 2000pesos Debora Arango.jpg'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-source.png'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-source.jpg'),
];

let IMG_WIDTH = 1400;
let IMG_HEIGHT = 1800;
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
  'Prueba o pliego inacabado de 2.000 pesos del Banco de la República con Débora Arango, en funda: anverso impreso arriba; reverso sin impresión abajo, con hilo BRC a través del papel y series tachadas';
const ALT_EN =
  'Unfinished or proof-type Banco de la República 2,000-peso note with Débora Arango, in a sleeve: printed face at top; unprinted back below, with the BRC thread showing through the paper and serials blocked';

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
  const enlargeAria = lang === 'es' ? 'Ampliar imagen del billete' : 'Enlarge image of the banknote';
  const caption =
    lang === 'es'
      ? 'Anverso impreso (arriba) y reverso sin impresión (abajo), en funda — Colección de Notofilia.com'
      : 'Printed face (top) and unprinted reverse (bottom), in a sleeve — Notofilia.com Collection';
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
  const dialogLabel = isEs ? 'Billete ampliado' : 'Enlarged banknote';
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
  const backHref = isEs ? '/coleccion/colombia/' : '/en/collection/colombia/';
  const backLabel = isEs ? 'Catálogo de Colombia' : 'Colombia catalog';
  const screen = isEs
    ? 'Banco de la República — Dos Mil Pesos, prueba (Débora Arango)'
    : 'Banco de la República — Two Thousand Pesos, proof (Débora Arango)';
  const eyebrow = isEs
    ? 'Prueba / inacabado &middot; Bogotá, Colombia &middot; 19.08.2015'
    : 'Proof / unfinished &middot; Bogotá, Colombia &middot; 19.08.2015';
  const subtitle = isEs
    ? 'Dos Mil Pesos &middot; Débora Arango Pérez &middot; P-458 &middot; anverso impreso, reverso en blanco'
    : 'Two Thousand Pesos &middot; Débora Arango Pérez &middot; P-458 &middot; face printed, reverse unprinted';
  const alt = isEs ? ALT_ES : ALT_EN;
  const tab = newTab(isEs);
  const unconfirmed = isEs
    ? '<span style="font-style:italic;">no confirmado</span>'
    : '<span style="font-style:italic;">unconfirmed</span>';
  const oroHref = isEs
    ? '/coleccion/colombia/banco-de-la-republica-2000-pesos-oro/'
    : '/en/collection/colombia/banco-de-la-republica-2000-pesos-oro/';
  const errorHref = isEs
    ? '/coleccion/colombia/2000-pesos-error-mariposa/'
    : '/en/collection/colombia/2000-pesos-butterfly-error/';
  const blogHref = isEs ? '/blog/personajes-billetes-colombia/' : '/en/blog/figures-on-colombia-banknotes/';
  const colombiaHref = isEs ? '/coleccion/colombia/' : '/en/collection/colombia/';

  const URLS = {
    press: 'https://www.banrep.gov.co/es/comunicado-29-11-2016',
    site: 'https://www.banrep.gov.co/billetes/2-mil/index.html',
    leaflet: 'https://d7vvencdc5xbh.cloudfront.net/sites/default/files/paginas/2-plegable.pdf',
    circular: 'https://www.banrep.gov.co/sites/default/files/paginas/ceos_dte-201_Asunto_52_abr_8_2024.pdf',
    foronum: 'https://www.foronum.com/catalogo-billetes/colombia/2000-pesos-2016-debora-arango-p458',
  };

  const rows = isEs
    ? [
        ['País', 'Colombia'],
        ['Entidad Emisora', 'El Banco de la República, Bogotá, Colombia'],
        ['Denominación', 'Dos Mil Pesos'],
        [
          'Tipo de Emisión',
          'Identificación provisional de la colección: pliego inacabado o de tipo prueba del Pick 458. Anverso impreso; reverso sin impresión; números de serie bloqueados. No es un billete de circulación emitido ni un specimen rotulado SPECIMEN.',
        ],
        ['Material', 'Papel de algodón 100 % (sustrato del tipo BanRep)'],
        ['Impresor', 'Imprenta de Billetes — Banco de la República'],
        [
          'Fecha de tipo',
          '19 de agosto de 2015: primera edición impresa del tipo, según el Emisor.<sup style="font-size:12px;">1,2</sup> En este ejemplar el reverso no está impreso, así que esa fecha no se lee en el pliego; se usa como fecha de catálogo del tipo.',
        ],
        [
          'Serie / Número',
          'Bloqueados (barras negras en las zonas de serie). No se transcribe un serial. No se interpretan como un efecto de la foto.',
        ],
        [
          'Firmas',
          'Cargos leídos en el ejemplar: Gerente General y Gerente Ejecutivo. Nombres de <em>esta</em> pieza: ' +
            unconfirmed +
            '. El tipo de 2015 lleva, en fuentes del Emisor, a José Darío Uribe Escobar y José Tolosa Buitrago; no se atribuyen aquí a este pliego.<sup style="font-size:12px;">2</sup>',
        ],
        [
          'Dimensiones',
          'BanRep: 128 &times; 66 mm.<sup style="font-size:12px;">1,2</sup> Medición directa de este ejemplar en funda: ' +
            unconfirmed,
        ],
        [
          'Marca de agua',
          'Tipo: retrato de Débora Arango y cifra 2 al trasluz.<sup style="font-size:12px;">1,2</sup> Visible con nitidez en esta foto: ' +
            unconfirmed,
        ],
        ['Referencia de Catálogo', 'Pick 458 (tipo). Sufijo 458a / 458b / etc. de este ejemplar: ' + unconfirmed],
        ['Tirada', unconfirmed],
        [
          'Variedades conocidas',
          'Circular DTE-201 Asunto 52 lista ediciones y series posteriores (AA–CC y, desde 2021, firmas de Leonardo Villar Gómez y Alberto Ocampo Roa).<sup style="font-size:12px;">4</sup> Variedad de este ejemplar: ' +
            unconfirmed,
        ],
        [
          'Fechas de circulación',
          'El tipo emitido circula desde el 29 de noviembre de 2016.<sup style="font-size:12px;">1</sup> Este pliego, inacabado, no se trata como un ejemplar puesto en circulación.',
        ],
        [
          'Base de la rareza',
          'Identificación provisional: prueba o inacabado (anverso solo, series bloqueadas) del tipo P-458. Tirada y confirmación de archivo BanRep: ' +
            unconfirmed +
            '. Población NGC/PCGS: no aplica (no encapsulado).',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular, en funda. Anverso impreso y legible. Reverso sin impresión de paisaje: se ve el hilo BRC y el anverso al trasluz. Series bloqueadas. Identificación: provisional.',
        ],
        ['Fecha de última revisión factual', '24 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Colombia'],
        ['Issuing Entity', 'El Banco de la República, Bogotá, Colombia'],
        ['Denomination', 'Two Thousand Pesos'],
        [
          'Type of Issue',
          'Provisional collection identification: unfinished or proof-type sheet of Pick 458. Face printed; reverse unprinted; serial numbers blocked. Not an issued circulating note and not a SPECIMEN-overprinted official specimen.',
        ],
        ['Material', '100% cotton paper (BanRep type substrate)'],
        ['Printer', 'Banknote Printing Works — Banco de la República'],
        [
          'Type date',
          '19 August 2015: first printed edition of the type, per the issuer.<sup style="font-size:12px;">1,2</sup> The reverse of this piece is unprinted, so that date is not read on the sheet; it is the catalogue date of the type.',
        ],
        [
          'Series / Number',
          'Blocked (black bars in the serial areas). No serial is transcribed. Not treated as a photograph artifact.',
        ],
        [
          'Signatures',
          'Offices read on this specimen: General Manager and Executive Manager. Names on <em>this</em> piece: ' +
            unconfirmed +
            '. The 2015 type, per the issuer, carries José Darío Uribe Escobar and José Tolosa Buitrago; those names are not assigned to this sheet.<sup style="font-size:12px;">2</sup>',
        ],
        [
          'Dimensions',
          'BanRep: 128 &times; 66 mm.<sup style="font-size:12px;">1,2</sup> Direct measurement of this sleeved specimen: ' +
            unconfirmed,
        ],
        [
          'Watermark',
          'Type: Débora Arango portrait and numeral 2 in transmitted light.<sup style="font-size:12px;">1,2</sup> Clearly visible in this photo: ' +
            unconfirmed,
        ],
        ['Catalog Reference', 'Pick 458 (type). Suffix 458a / 458b / etc. for this piece: ' + unconfirmed],
        ['Print run', unconfirmed],
        [
          'Known varieties',
          'Circular DTE-201 Subject 52 lists later editions and series (AA–CC and, from 2021, signatures of Leonardo Villar Gómez and Alberto Ocampo Roa).<sup style="font-size:12px;">4</sup> Variety of this specimen: ' +
            unconfirmed,
        ],
        [
          'Circulation dates',
          'The issued type has circulated since 29 November 2016.<sup style="font-size:12px;">1</sup> This unfinished sheet is not treated as a note released into circulation.',
        ],
        [
          'Basis of rarity',
          'Provisional identification: unfinished or proof-type (face only, serials blocked) of P-458. Print run and BanRep archive confirmation: ' +
            unconfirmed +
            '. NGC/PCGS population: not applicable (not slabbed).',
        ],
        [
          'State of the specimen shown',
          'Unslabbed, in a sleeve. Face printed and readable. Reverse without landscape printing: BRC thread and show-through of the face. Serials blocked. Identification: provisional.',
        ],
        ['Date of last factual review', '24 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          `<strong style="color:#1c1a15;">Identificación provisional:</strong> Colombia — Banco de la República — 2.000 pesos — 19.08.2015 — Débora Arango — P-458 — pliego inacabado o de tipo prueba, anverso impreso / reverso sin impresión, series bloqueadas. El 19.08.2015 es la primera edición impresa del tipo en fuentes del Emisor, no una fecha leída en el reverso de esta pieza.<sup style="font-size:12px;">1,2</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">El tipo emitido:</strong> BanRep puso el 2.000 pesos de Débora Arango en circulación el 29 de noviembre de 2016. El reverso de tipo es Caño Cristales.<sup style="font-size:12px;">1,2</sup> Este ejemplar no se cataloga como un billete emitido de esa circulación.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">No confundir:</strong> no es el <a href="${oroHref}">2.000 pesos oro</a>, ni el <a href="${errorHref}">error de la mariposa (Santander)</a>, ni un specimen con sobrecarga SPECIMEN. Más contexto en el <a href="${blogHref}">blog de personajes</a> y el <a href="${colombiaHref}">catálogo Colombia</a>.`,
          true,
        ),
      ]
    : [
        sectionP(
          `<strong style="color:#1c1a15;">Provisional identification:</strong> Colombia — Banco de la República — 2,000 pesos — 19.08.2015 — Débora Arango — P-458 — unfinished or proof-type sheet, face printed / reverse unprinted, serial numbers blocked. 19.08.2015 is the type’s first printed edition in issuer sources, not a date read on this sheet’s reverse.<sup style="font-size:12px;">1,2</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">The issued type:</strong> BanRep put the Débora Arango 2,000-peso note into circulation on 29 November 2016. The type reverse is Caño Cristales.<sup style="font-size:12px;">1,2</sup> This piece is not catalogued as an issued circulating note of that release.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Not to be confused with:</strong> the <a href="${oroHref}">2,000 pesos oro</a>, the <a href="${errorHref}">Santander butterfly error</a>, or a SPECIMEN-overprinted official specimen. More context in the <a href="${blogHref}">figures post</a> and the <a href="${colombiaHref}">Colombia catalog</a>.`,
          true,
        ),
      ];

  const details = isEs
    ? [
        bullet(
          '<strong style="color:#1c1a15;">Texto principal:</strong> «2 MIL PESOS» / «DOS MIL PESOS»; emisor «BANCO DE LA REPÚBLICA COLOMBIA»; leyenda «ARTISTA 1907–2005» junto al retrato.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Retrato y figura:</strong> Débora Arango a la derecha (retrato) y de pie al centro, traje estampado, manos entrelazadas.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Elemento ópticamente variable:</strong> flor / árbol de leche en cobre-oro a la izquierda de la figura, según el tipo del Emisor.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Tacto:</strong> marcas diagonales en los extremos y 2 en braille en el tipo; visibles en los bordes de esta foto.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Firmas:</strong> rotuladas «GERENTE GENERAL» y «GERENTE EJECUTIVO». Nombres: no confirmado.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverso:</strong> sin impresión del paisaje de Caño Cristales. Se ve el hilo BRC con aves y, al trasluz, el anverso.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Series:</strong> bloqueadas con barras negras. Presentación: funda transparente, sin encapsulado.',
        ),
      ]
    : [
        bullet(
          '<strong style="color:#1c1a15;">Main text:</strong> “2 MIL PESOS” / “DOS MIL PESOS”; issuer “BANCO DE LA REPÚBLICA COLOMBIA”; legend “ARTISTA 1907–2005” beside the portrait.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Portrait and figure:</strong> Débora Arango at right (portrait) and standing at centre in a patterned suit, hands clasped.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Optically variable device:</strong> milk-tree / flower in copper-gold to the left of the figure, per the issuer’s type.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Tactile marks:</strong> diagonal marks at the ends and a braille 2 on the type; edge marks are visible in this photo.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Signatures:</strong> labelled “GERENTE GENERAL” and “GERENTE EJECUTIVO.” Names: unconfirmed.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverse:</strong> no Caño Cristales landscape printing. The BRC thread with birds is visible, and the face shows through.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Serials:</strong> blocked with black bars. Presentation: clear sleeve, not slabbed.',
        ),
      ];

  const notes = isEs
    ? [
        noteP(
          `1. <a href="${URLS.press}" target="_blank" rel="noopener noreferrer">BanRep — comunicado del 29 de noviembre de 2016${tab}</a>: puesta en circulación; 128 &times; 66 mm; algodón 100 %; quinto billete de la familia nueva.`,
        ),
        noteP(
          `2. <a href="${URLS.site}" target="_blank" rel="noopener noreferrer">BanRep — micrositio del billete de 2 mil pesos${tab}</a>: diseño, seguridad, árbol de leche, Caño Cristales, entrevista en <cite>Débora en plural</cite> (MAMM, 2008).`,
        ),
        noteP(
          `3. <a href="${URLS.leaflet}" target="_blank" rel="noopener noreferrer">BanRep — plegable PDF (2 mil pesos)${tab}</a>: resumen de características de la denominación.`,
        ),
        noteP(
          `4. <a href="${URLS.circular}" target="_blank" rel="noopener noreferrer">Circular DTE-201 Asunto 52 (PDF, abril 2024)${tab}</a>: ediciones y series posteriores del tipo.`,
        ),
        noteP(
          `5. <a href="${URLS.foronum}" target="_blank" rel="noopener noreferrer">Foronum — tipo P#458 / FO#2623${tab}</a>: ficha de catálogo secundaria. El sufijo de este ejemplar: no confirmado.`,
          true,
        ),
      ]
    : [
        noteP(
          `1. <a href="${URLS.press}" target="_blank" rel="noopener noreferrer">BanRep — press release of 29 November 2016${tab}</a>: first circulation; 128 &times; 66 mm; 100% cotton; fifth note of the new family (Spanish page).`,
        ),
        noteP(
          `2. <a href="${URLS.site}" target="_blank" rel="noopener noreferrer">BanRep — 2,000-peso note microsite${tab}</a>: design, security, milk tree, Caño Cristales, interview excerpt in <cite>Débora en plural</cite> (MAMM, 2008). Spanish page.`,
        ),
        noteP(
          `3. <a href="${URLS.leaflet}" target="_blank" rel="noopener noreferrer">BanRep — leaflet PDF (2,000 pesos)${tab}</a>: denomination feature summary.`,
        ),
        noteP(
          `4. <a href="${URLS.circular}" target="_blank" rel="noopener noreferrer">Circular DTE-201 Subject 52 (PDF, April 2024)${tab}</a>: later editions and series of the type.`,
        ),
        noteP(
          `5. <a href="${URLS.foronum}" target="_blank" rel="noopener noreferrer">Foronum — type P#458 / FO#2623${tab}</a>: secondary catalogue card. Suffix for this piece: unconfirmed.`,
          true,
        ),
      ];

  return `<div lang="${lang}" style="width:100%; min-height:100vh; background:#0a0a09; font-family:'Cormorant Garamond', serif; box-sizing:border-box;">

  <main data-pagefind-meta="url:${pagePath}" id="main-content" tabindex="-1" data-screen-label="${screen}" style="max-width:1180px; margin:0 auto; padding:56px 24px 80px; outline:none;">

    <a href="${backHref}" style="display:inline-block; color:#e7ddc4; text-decoration:none; font-size:15px; letter-spacing:0.08em; margin-bottom:24px;">&larr; ${backLabel}</a>

    <div style="background:#d8d2cd; border:1px solid rgba(10,10,9,0.08); border-radius:3px; padding:clamp(28px,4vw,64px); box-shadow:0 30px 70px rgba(0,0,0,0.45);">

      <div style="display:flex; flex-direction:column; align-items:center;">

        <div style="text-align:center; max-width:720px; margin:0 auto 40px;">
          <span style="display:block; font-size:14px; letter-spacing:0.22em; text-transform:uppercase; color:#5c4e33; margin-bottom:14px;">${eyebrow}</span>

          <h1 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(28px,4vw,44px); line-height:1.08; letter-spacing:0.01em; color:#1c1a15; margin:0 0 12px;">El Banco de la República</h1>

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
  title: '2.000 pesos Débora Arango, prueba (P-458) | Notofilia',
  description:
    'Identificación provisional: 2.000 pesos Débora Arango, 19.08.2015, P-458, inacabado, reverso en blanco, series tapadas.',
  keywords: [
    'banco de la república',
    '2000 pesos',
    'débora arango',
    'pick 458',
    'prueba',
    'inacabado',
    'notafilia colombiana',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: '2.000 pesos Débora Arango — prueba inacabada (P-458)',
  ogDescription:
    'Identificación provisional: anverso impreso, reverso en blanco, series tapadas. Tipo 19.08.2015.',
  ogImage: `${IMG}.jpg`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Colombia', item: `${SITE}/coleccion/colombia/` },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'El Banco de la República — Dos Mil Pesos, prueba (Débora Arango)',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'El Banco de la República — Dos Mil Pesos, prueba inacabada (Débora Arango Pérez)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Identificación provisional: pliego inacabado o de tipo prueba del 2.000 pesos Débora Arango (P-458). Anverso impreso, reverso sin imprimir, series tapadas. Fecha de tipo 19.08.2015.',
        dateCreated: '2015-08-19',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/colombia/#page` },
        identifier: 'NF.colombia.banco-de-la-republica-2000-pesos-debora-arango',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '458' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'Imprenta de Billetes — Banco de la República' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'Prueba / inacabado (identificación provisional); en funda; no encapsulado' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.colombia.banco-de-la-republica-2000-pesos-debora-arango',
    kind: 'banknote',
    title: 'El Banco de la República',
    subtitle: 'Dos Mil Pesos · Débora Arango Pérez · P-458 · prueba / inacabado',
    dateOrSeries: '19.08.2015 (fecha de tipo)',
    country: 'Colombia',
    issuer: 'El Banco de la República, Bogotá, Colombia',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colombia', href: '/coleccion/colombia/' },
      { name: 'El Banco de la República — Dos Mil Pesos, prueba (Débora Arango)' },
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
      denomination: 'Dos Mil Pesos',
      currency: 'Peso colombiano',
      issuer: 'El Banco de la República, Bogotá, Colombia',
      printer: 'Imprenta de Billetes — Banco de la República',
      issueDate: '19.08.2015 (1.ª edición impresa del tipo; no leída en este pliego)',
      series: 'bloqueada (barras negras; no se transcribe)',
      serialNumber: 'bloqueado (no se interpreta como artefacto de foto)',
      signatures: 'Cargos: Gerente General y Gerente Ejecutivo. Nombres de este ejemplar: no confirmado',
      catalogNumber: 'Pick 458 (tipo; sufijo de este ejemplar no confirmado)',
      material: 'Papel de algodón 100 %',
      dimensions: '128 × 66 mm (BanRep); medición de este ejemplar: no confirmado',
      watermark: 'Tipo: retrato de Débora Arango y cifra 2; visibilidad en esta foto: no confirmado',
      condition: 'Prueba / inacabado (identificación provisional), en funda transparente; no encapsulado',
      status: 'proof',
      printRun: 'no confirmado. BanRep no publica tirada del tipo emitido ni de material de prueba o inacabado.',
      knownVarieties:
        'Este pliego: anverso impreso / reverso sin imprimir, series tapadas. Del tipo emitido (contexto): ediciones AA–CC; firmas Villar/Ocampo desde 2021. Sufijos Pick 458a/b: no confirmado.',
      circulationDates:
        'Este pliego no circuló. El tipo emitido (P-458) entra en circulación el 29 de noviembre de 2016 y sigue vigente. 19.08.2015 = 1.ª edición impresa del tipo, no fecha de este ejemplar.',
      rarityBasis:
        'Identificación provisional de material inacabado / tipo prueba. No hay cifra de BanRep ni archivo público que confirme origen o cantidad. El tipo emitido es corriente. Población NGC/PCGS: no aplica.',
      shownSpecimenState:
        'Sin encapsular, en funda. Anverso impreso y legible. Reverso sin impresión de paisaje: hilo BRC y anverso al trasluz. Series tapadas de fábrica o de control. Identificación: provisional. Grado numérico: no confirmado.',
      factualReviewDate: '2026-08-24',
    },
    render: 'astro-static',
    eyebrow: 'Prueba / inacabado · Bogotá, Colombia · 19.08.2015',
    resourced: true,
    context: {
      historical:
        'Identificación provisional: pliego inacabado o de tipo prueba del P-458 (Débora Arango), 19.08.2015 como fecha de tipo. Anverso impreso; reverso sin imprimir; series tapadas. No es un billete emitido en circulación ni un specimen con sobrecarga SPECIMEN. El tipo emitido circula desde el 29 de noviembre de 2016.',
      design:
        'Anverso: retrato y figura de Débora Arango, 2 MIL PESOS / DOS MIL PESOS, árbol de leche OVI, marcas táctiles. Reverso de tipo (no impreso en esta pieza): Caño Cristales, aves, cita de Débora en plural (MAMM, 2008). En esta foto se lee el hilo BRC al trasluz.',
      varieties:
        'Pick 458 (tipo). Este pliego: anverso solo, series bloqueadas. Circular DTE-201 Asunto 52: series AA–CC y firmas posteriores del tipo emitido. Sufijo y edición de este pliego: no confirmado.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (funda transparente, anverso y reverso apilados)',
        note: 'Identificación provisional: anverso impreso, reverso sin imprimir, series tapadas (no artefacto de foto). Cargos Gerente General y Gerente Ejecutivo. Hilo BRC al trasluz. No es specimen rotulado SPECIMEN ni billete emitido.',
      },
      {
        kind: 'printer',
        label: 'Imprenta de Billetes — Banco de la República',
        note: 'Impresor oficial del tipo, según micrositio y plegable del Emisor; pie de imprenta del reverso no se lee en esta foto',
      },
      {
        kind: 'central_bank',
        label: 'BanRep — comunicado 29 de noviembre de 2016',
        url: 'https://www.banrep.gov.co/es/comunicado-29-11-2016',
        note: 'Puesta en circulación; 128 × 66 mm; algodón 100 %; quinto billete de la familia nueva',
      },
      {
        kind: 'central_bank',
        label: 'BanRep — micrositio del billete de 2 mil pesos',
        url: 'https://www.banrep.gov.co/billetes/2-mil/index.html',
        note: 'Diseño, seguridad, árbol de leche, Caño Cristales, cita de Débora en plural (MAMM, 2008)',
      },
      {
        kind: 'central_bank',
        label: 'BanRep — plegable PDF (2 mil pesos)',
        url: 'https://d7vvencdc5xbh.cloudfront.net/sites/default/files/paginas/2-plegable.pdf',
        note: 'Resumen de características de la denominación',
      },
      {
        kind: 'central_bank',
        label: 'Circular DTE-201 Asunto 52 (abril 2024)',
        url: 'https://www.banrep.gov.co/sites/default/files/paginas/ceos_dte-201_Asunto_52_abr_8_2024.pdf',
        note: 'Ediciones y series posteriores del tipo',
      },
      {
        kind: 'catalog',
        label: 'Foronum — P#458 / FO#2623',
        url: 'https://www.foronum.com/catalogo-billetes/colombia/2000-pesos-2016-debora-arango-p458',
        note: 'Ficha de catálogo secundaria. Sufijo de este ejemplar: no confirmado',
      },
    ],
    related: [
      { href: '/coleccion/colombia/', title: 'Catálogo de Colombia' },
      { href: '/coleccion/colombia/banco-de-la-republica-2000-pesos-oro/', title: 'Dos Mil Pesos Oro' },
      { href: '/coleccion/colombia/2000-pesos-error-mariposa/', title: 'Error de la mariposa (Santander)' },
      { href: '/blog/personajes-billetes-colombia/', title: 'Personajes en los billetes de Colombia' },
    ],
  },
  legacyFile: 'billete-colombia-banco-de-la-republica-2000-pesos-debora-arango.dc.html',
  sourceHash: createHash('sha1').update('banco-de-la-republica-2000-pesos-debora-arango-v2-unfinished').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '2,000-peso Débora Arango proof (P-458) | Notofilia',
      description:
        'Provisional ID: Colombia 2,000-peso Débora Arango, 19.08.2015, P-458, unfinished, blank reverse, blocked serials.',
      ogTitle: '2,000-peso Débora Arango — unfinished proof (P-458)',
      ogDescription:
        'Provisional identification: face printed, reverse unprinted, serials blocked. Type date 19.08.2015.',
      template: buildTemplate('en'),
      recordTitle: 'El Banco de la República',
      eyebrow: 'Proof / unfinished · Bogotá, Colombia · 19.08.2015',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
