/**
 * Generator for the Banco de la República 2.000 pesos Débora Arango ficha
 * (current family, Pick 458 type).
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
  'Billete colombiano de 2.000 pesos con Débora Arango Pérez, fotografiado en funda transparente: anverso arriba con retrato y figura de la artista, reverso abajo con hilo BRC visible a través del papel';
const ALT_EN =
  'Colombian 2,000-peso note featuring Débora Arango Pérez, photographed in a clear sleeve: obverse at top with the artist’s portrait and standing figure, reverse below with the BRC security thread visible through the paper';

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
      ? 'Anverso (arriba) y reverso (abajo) — Colección de Notofilia.com'
      : 'Obverse (top) and reverse (bottom) — Notofilia.com Collection';
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
    ? 'Banco de la República — Dos Mil Pesos (Débora Arango)'
    : 'Banco de la República — Two Thousand Pesos (Débora Arango)';
  const eyebrow = isEs
    ? 'Familia actual &middot; Bogotá, Colombia &middot; desde 2016'
    : 'Current family &middot; Bogotá, Colombia &middot; from 2016';
  const subtitle = isEs
    ? 'Dos Mil Pesos &middot; Débora Arango Pérez &middot; tipo Pick 458'
    : 'Two Thousand Pesos &middot; Débora Arango Pérez &middot; Pick type 458';
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
          'Billete de circulación de la familia actual (2016), tipo Pick 458. Curso legal vigente. No es specimen ni error de imprenta.',
        ],
        ['Material', 'Papel de algodón 100 %'],
        ['Impresor', 'Imprenta de Billetes — Banco de la República'],
        [
          'Puesta en circulación',
          '29 de noviembre de 2016 (quinto billete de la familia nueva). Primera edición impresa del tipo: 19 de agosto de 2015.<sup style="font-size:12px;">1,2</sup> Fecha de edición de <em>este</em> pliego: ' +
            unconfirmed,
        ],
        ['Serie / Número', unconfirmed + ' (zonas de serie oscurecidas en esta foto; no se transcribe un serial)'],
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
          'Desde el 29 de noviembre de 2016; sigue siendo de curso legal.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Base de la rareza',
          'Tipo corriente de la familia de billetes actual, no un error ni una prueba. Población encapsulada NGC/PCGS de este ejemplar: no aplica (no está encapsulado en la foto).',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular, en funda transparente. Anverso legible; reverso lavado en la toma (hilo BRC y aves visibles). Serie y fecha de edición de este pliego: no confirmado. Las barras oscuras sobre las zonas de serie son un efecto de la foto o de la funda, no una atribución de specimen.',
        ],
        ['Fecha de última revisión factual', '24 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Colombia'],
        ['Issuing Entity', 'El Banco de la República, Bogotá, Colombia'],
        ['Denomination', 'Two Thousand Pesos'],
        [
          'Type of Issue',
          'Circulating note of the current family (2016), Pick type 458. Still legal tender. Not a specimen and not a printing error.',
        ],
        ['Material', '100% cotton paper'],
        ['Printer', 'Banknote Printing Works — Banco de la República'],
        [
          'First circulation',
          '29 November 2016 (fifth note of the new family). First printed edition of the type: 19 August 2015.<sup style="font-size:12px;">1,2</sup> Edition date of <em>this</em> sheet: ' +
            unconfirmed,
        ],
        ['Series / Number', unconfirmed + ' (serial areas are darkened in this photo; no serial is transcribed)'],
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
          'From 29 November 2016; still legal tender.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Basis of rarity',
          'Ordinary type of the current banknote family, not an error or a proof. NGC/PCGS population for this specimen: not applicable (not slabbed in the photo).',
        ],
        [
          'State of the specimen shown',
          'Unslabbed, in a clear sleeve. Face readable; reverse washed in this shot (BRC thread and birds visible). Series and edition date of this sheet: unconfirmed. Dark bars over the serial areas are a capture or sleeve effect, not a specimen attribution.',
        ],
        ['Date of last factual review', '24 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          `<strong style="color:#1c1a15;">El 2.000 pesos de la familia 2016:</strong> el Banco de la República puso esta denominación en circulación el 29 de noviembre de 2016, quinto billete de la familia nueva. El anverso rinde homenaje a la pintora antioqueña Débora Arango Pérez (1907–2005); el reverso de tipo representa Caño Cristales (Meta).<sup style="font-size:12px;">1,2</sup> Sigue siendo de curso legal.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">No confundir con otros 2.000 pesos:</strong> esta ficha no es el <a href="${oroHref}">2.000 pesos oro</a> ni el <a href="${errorHref}">error de la mariposa (Santander)</a>. Más contexto en el <a href="${blogHref}">blog de personajes en los billetes de Colombia</a> y en el <a href="${colombiaHref}">catálogo Colombia</a>.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Este ejemplar:</strong> fotografiado en funda. El anverso se lee; el reverso de la toma está lavado y no se usa para afirmar un paisaje nítido de Caño Cristales. Serie, serial y fecha de edición de este pliego: no confirmado. No es un specimen: las barras oscuras sobre las zonas de serie son un efecto de la foto o de la funda.`,
          true,
        ),
      ]
    : [
        sectionP(
          `<strong style="color:#1c1a15;">The 2016-family 2,000 pesos:</strong> Banco de la República put this denomination into circulation on 29 November 2016, the fifth note of the new family. The face honours painter Débora Arango Pérez (1907–2005); the type reverse shows Caño Cristales (Meta).<sup style="font-size:12px;">1,2</sup> It remains legal tender.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Not the other 2,000-peso notes:</strong> this record is not the <a href="${oroHref}">2,000 pesos oro</a> note or the <a href="${errorHref}">Santander butterfly error</a>. More context in the <a href="${blogHref}">figures on Colombia banknotes</a> post and the <a href="${colombiaHref}">Colombia catalog</a>.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">This specimen:</strong> photographed in a sleeve. The face reads; the reverse in this shot is washed and is not used to claim a sharp Caño Cristales view. Series, serial, and edition date of this sheet: unconfirmed. It is not a specimen: dark bars over the serial areas are a capture or sleeve effect.`,
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
          '<strong style="color:#1c1a15;">Reverso en esta foto:</strong> hilo vertical con «BRC» y siluetas de aves; el paisaje de Caño Cristales no se resuelve con nitidez a través de la funda.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Presentación:</strong> funda de coleccionista transparente. Sin encapsulado. Serial: no confirmado.',
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
          '<strong style="color:#1c1a15;">Reverse in this photo:</strong> vertical thread with “BRC” and bird silhouettes; the Caño Cristales landscape does not resolve sharply through the sleeve.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Presentation:</strong> clear collector sleeve. Not slabbed. Serial: unconfirmed.',
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
  title: '2.000 pesos Débora Arango (P-458) | Notofilia',
  description:
    'Billete colombiano de 2.000 pesos con Débora Arango (familia 2016, Pick 458). Circulación desde 2016; serie de este ejemplar no confirmada.',
  keywords: [
    'banco de la república',
    '2000 pesos',
    'débora arango',
    'pick 458',
    'caño cristales',
    'familia 2016',
    'notafilia colombiana',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Banco de la República — 2.000 pesos, Débora Arango',
  ogDescription:
    'Tipo Pick 458 de la familia 2016. Curso legal desde noviembre de 2016. Colección Notofilia.',
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
            name: 'El Banco de la República — Dos Mil Pesos (Débora Arango)',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'El Banco de la República — Dos Mil Pesos (Débora Arango Pérez)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Billete de 2.000 pesos del Banco de la República, familia 2016, tipo Pick 458, con retrato de Débora Arango Pérez. Curso legal desde el 29 de noviembre de 2016.',
        dateCreated: '2016-11-29',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/colombia/#page` },
        identifier: 'NF.colombia.banco-de-la-republica-2000-pesos-debora-arango',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '458' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'Imprenta de Billetes — Banco de la República' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'Circulado, en funda; no encapsulado' },
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
    subtitle: 'Dos Mil Pesos · Débora Arango Pérez · tipo Pick 458',
    dateOrSeries: 'desde 2016',
    country: 'Colombia',
    issuer: 'El Banco de la República, Bogotá, Colombia',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colombia', href: '/coleccion/colombia/' },
      { name: 'El Banco de la República — Dos Mil Pesos (Débora Arango)' },
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
      issueDate: '29 de noviembre de 2016 (puesta en circulación del tipo)',
      series: 'no confirmado',
      serialNumber: 'no confirmado',
      signatures: 'Cargos: Gerente General y Gerente Ejecutivo. Nombres de este ejemplar: no confirmado',
      catalogNumber: 'Pick 458 (tipo; sufijo de este ejemplar no confirmado)',
      material: 'Papel de algodón 100 %',
      dimensions: '128 × 66 mm (BanRep); medición de este ejemplar: no confirmado',
      watermark: 'Tipo: retrato de Débora Arango y cifra 2; visibilidad en esta foto: no confirmado',
      condition: 'Circulado, en funda transparente; no encapsulado',
      status: 'circulated',
      printRun: 'no confirmado',
      knownVarieties:
        'Ediciones y series en circular DTE-201 Asunto 52 (AA–CC y cambios de firma desde 2021). Variedad de este ejemplar: no confirmado',
      circulationDates: 'Desde el 29 de noviembre de 2016; curso legal vigente',
      rarityBasis:
        'Tipo corriente de la familia actual; no es error ni prueba. Población NGC/PCGS de este ejemplar: no aplica',
      shownSpecimenState:
        'Sin encapsular, en funda. Anverso legible; reverso lavado en la foto. Serie y fecha de edición de este pliego: no confirmado',
      factualReviewDate: '2026-08-24',
    },
    render: 'astro-static',
    eyebrow: 'Familia actual · Bogotá, Colombia · desde 2016',
    resourced: true,
    context: {
      historical:
        'Quinto billete de la familia 2016, en circulación desde el 29 de noviembre de 2016. Anverso: Débora Arango Pérez. Reverso de tipo: Caño Cristales. Curso legal vigente. No es el 2.000 pesos oro ni el error de la mariposa.',
      design:
        'Anverso: retrato y figura de Débora Arango, 2 MIL PESOS / DOS MIL PESOS, árbol de leche OVI, marcas táctiles. Reverso de tipo: Caño Cristales, aves, cita de Débora en plural (MAMM, 2008). En esta foto el reverso está lavado; se lee el hilo BRC.',
      varieties:
        'Pick 458 (tipo). Circular DTE-201 Asunto 52: series AA–CC y firmas posteriores. Sufijo y edición de este pliego: no confirmado.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (funda transparente, anverso y reverso apilados)',
        note: 'Anverso: Débora Arango, 2 MIL PESOS, BANCO DE LA REPÚBLICA COLOMBIA, cargos Gerente General y Gerente Ejecutivo. Reverso de la foto: hilo BRC y aves; paisaje no nítido. Serial: no confirmado. No es specimen.',
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
  sourceHash: createHash('sha1').update('banco-de-la-republica-2000-pesos-debora-arango-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Colombia 2,000 pesos Débora Arango (P-458) | Notofilia',
      description:
        'Colombian 2,000-peso note with Débora Arango (2016 family, Pick 458). In circulation since 2016; this specimen’s series is unconfirmed.',
      ogTitle: 'Banco de la República — 2,000 pesos, Débora Arango',
      ogDescription:
        'Pick type 458 of the 2016 family. Legal tender since November 2016. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'El Banco de la República',
      eyebrow: 'Current family · Bogotá, Colombia · from 2016',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
