/**
 * Generator for the Banco de la República 2.000 pesos Débora Arango ficha
 * (Pick 458b; progressive / partial printing proof — incomplete face,
 * printed reverse, type date 2.08.2016 read on this sheet).
 *
 * Distinct from colombia--banco-de-la-republica-2000-pesos-debora-arango.json
 * (printed face / blank reverse / blocked serials). Do not overwrite that piece.
 *
 * Usage: node scripts/write-colombia-2000-pesos-debora-arango-prueba-anverso-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const SLUG = 'banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso';
const ES_PATH = `/coleccion/colombia/${SLUG}/`;
const EN_PATH = `/en/collection/colombia/${SLUG}/`;
const SIBLING_ES = '/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango/';
const SIBLING_EN = '/en/collection/colombia/banco-de-la-republica-2000-pesos-debora-arango/';
const IMG = '/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso';
const ZOOM_ID = 'colombia-banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso';
const OUT = path.join(
  process.cwd(),
  'src/content/catalog/colombia--banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso.json',
);

const SOURCE_CANDIDATES = [
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso.png'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso.jpg'),
];

let IMG_WIDTH = 1536;
let IMG_HEIGHT = 1024;
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
  'Prueba de impresión progresiva o parcial del 2.000 pesos del Banco de la República con Débora Arango (P-458b): anverso incompleto con silueta del retrato en blanco arriba; reverso de Caño Cristales impreso abajo, con hilo BRC y series AA visibles';
const ALT_EN =
  'Progressive or partial printing proof of the Banco de la República 2,000-peso note with Débora Arango (P-458b): incomplete face with an unprinted portrait silhouette at top; printed Caño Cristales reverse below, with the BRC thread and visible AA serials';

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
      ? 'Anverso incompleto (arriba) y reverso impreso (abajo) — Colección de Notofilia.com'
      : 'Incomplete face (top) and printed reverse (bottom) — Notofilia.com Collection';
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
    ? 'Banco de la República — Dos Mil Pesos, prueba anverso (Débora Arango, P-458b)'
    : 'Banco de la República — Two Thousand Pesos, face proof (Débora Arango, P-458b)';
  const eyebrow = isEs
    ? 'Prueba de impresión progresiva / parcial &middot; Bogotá, Colombia &middot; 2.08.2016'
    : 'Progressive / partial printing proof &middot; Bogotá, Colombia &middot; 2.08.2016';
  const subtitle = isEs
    ? 'Dos Mil Pesos &middot; Débora Arango Pérez &middot; P-458b &middot; anverso incompleto, reverso impreso'
    : 'Two Thousand Pesos &middot; Débora Arango Pérez &middot; P-458b &middot; incomplete face, printed reverse';
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
  const siblingHref = isEs ? SIBLING_ES : SIBLING_EN;
  const blogHref = isEs ? '/blog/personajes-billetes-colombia/' : '/en/blog/figures-on-colombia-banknotes/';
  const colombiaHref = isEs ? '/coleccion/colombia/' : '/en/collection/colombia/';

  const URLS = {
    press: 'https://www.banrep.gov.co/es/comunicado-29-11-2016',
    site: 'https://www.banrep.gov.co/billetes/2-mil/index.html',
    leaflet: 'https://d7vvencdc5xbh.cloudfront.net/sites/default/files/paginas/2-plegable.pdf',
    circular:
      'https://www.banrep.gov.co/sites/default/files/reglamentacion/archivos/ceos_dte-201_Asunto_52_abr_8_2024.pdf',
    numista: 'https://en.numista.com/catalogue/note204972.html',
    realbanknotes: 'https://www.realbanknotes.com/banknote/53881-Colombia-p458b-2000-Pesos-from-2016',
  };

  const rows = isEs
    ? [
        ['País', 'Colombia'],
        ['Entidad Emisora', 'El Banco de la República, Bogotá, Colombia'],
        ['Denominación', 'Dos Mil Pesos'],
        [
          'Tipo de Emisión',
          'Prueba de impresión progresiva o parcial del Pick 458b. Anverso con capas incompletas: silueta en blanco donde iría el retrato; bajoimpresión y algunos dispositivos (hojas, ave, figura de pie tenue). Reverso con Caño Cristales impreso. Series visibles. No es un billete de circulación emitido ni un specimen rotulado SPECIMEN. Distinto de la <a href="' +
            siblingHref +
            '">otra prueba P-458b de esta colección</a> (retrato impreso, reverso en blanco, series tapadas).',
        ],
        ['Material', 'Papel de algodón 100 % (sustrato del tipo BanRep)'],
        ['Impresor', 'Imprenta de Billetes — Banco de la República (leyenda leída en el reverso)'],
        [
          'Fecha de edición',
          '2 de agosto de 2016: leída en el borde del reverso («2 DE AGOSTO DE 2016»). Coincide con la fecha de edición del tipo P-458b (series AE y AF) en la Circular DTE-201 Asunto 52.<sup style="font-size:12px;">4</sup> La 1.ª edición impresa del tipo (P-458a) es el 19 de agosto de 2015.',
        ],
        [
          'Serie / Número',
          'Leídos en la foto: AA22293893 (ventana superior izquierda) y AA26293893 (ventana inferior derecha). Lectura de foto, no confirmación de archivo BanRep. El tipo P-458b emitido lleva series AE y AF; AA figura entre ediciones posteriores de la circular. Este prefijo no se usa aquí para afirmar que el pliego sea un billete emitido AE/AF.<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Firmas',
          'Cargos y nombres en <em>esta</em> foto del anverso incompleto: ' +
            unconfirmed +
            '. La 1.ª edición (19.08.2015) lleva, en fuentes del Emisor, a José Darío Uribe Escobar y José Tolosa Buitrago; la circular no nombra otras firmas para la edición del 2.08.2016. No se atribuyen aquí a este pliego.<sup style="font-size:12px;">2,4</sup>',
        ],
        [
          'Dimensiones',
          'BanRep: 128 &times; 66 mm.<sup style="font-size:12px;">1,2</sup> Medición directa de este ejemplar: ' +
            unconfirmed,
        ],
        [
          'Marca de agua',
          'Tipo: retrato de Débora Arango y cifra 2 al trasluz.<sup style="font-size:12px;">1,2</sup> Visible con nitidez en esta foto: ' +
            unconfirmed,
        ],
        [
          'Referencia de Catálogo',
          'Pick 458b (tipo 2.08.2016).<sup style="font-size:12px;">5,6</sup> El Pick 458a es la edición del 19.08.2015.',
        ],
        ['Tirada', unconfirmed],
        [
          'Variedades conocidas',
          'Circular DTE-201 Asunto 52: edición 2.08.2016 series AE (circulación desde el 16.02.2018) y AF (desde el 5.06.2018), y ediciones posteriores AA–CC.<sup style="font-size:12px;">4</sup> Este ejemplar: prueba progresiva / parcial (anverso incompleto, reverso impreso, series AA leídas en foto).',
        ],
        [
          'Fechas de circulación',
          'Este pliego no se cataloga como circulado. El tipo emitido entra en circulación el 29 de noviembre de 2016 (1.ª edición, 19.08.2015).<sup style="font-size:12px;">1,4</sup> La edición P-458b (2.08.2016) se pone a circular desde el 16 de febrero de 2018 (serie AE) y el 5 de junio de 2018 (serie AF).<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Base de la rareza',
          'Prueba de impresión progresiva o parcial del tipo P-458b (anverso incompleto, reverso impreso, series visibles). Tirada y confirmación de archivo BanRep: ' +
            unconfirmed +
            '. El tipo emitido es corriente. Población NGC/PCGS: no aplica (no encapsulado).',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular. Anverso con silueta del retrato sin imprimir y bajoimpresión visible. Reverso con paisaje de Caño Cristales, hilo BRC y leyenda de imprenta. Series AA leídas en foto. Identificación: prueba progresiva / parcial del P-458b.',
        ],
        ['Fecha de última revisión factual', '25 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Colombia'],
        ['Issuing Entity', 'El Banco de la República, Bogotá, Colombia'],
        ['Denomination', 'Two Thousand Pesos'],
        [
          'Type of Issue',
          'Progressive or partial printing proof of Pick 458b. Face with incomplete layers: unprinted silhouette where the portrait would sit; underprint and some devices (leaves, bird, faint standing figure). Reverse with Caño Cristales printed. Serials visible. Not an issued circulating note and not a SPECIMEN-overprinted official specimen. Distinct from the <a href="' +
            siblingHref +
            '">other P-458b proof in this collection</a> (printed portrait, blank reverse, blocked serials).',
        ],
        ['Material', '100% cotton paper (BanRep type substrate)'],
        ['Printer', 'Banknote Printing Works — Banco de la República (imprint read on the reverse)'],
        [
          'Edition date',
          '2 August 2016: read on the reverse edge (“2 DE AGOSTO DE 2016”). Matches the edition date of type P-458b (series AE and AF) in Circular DTE-201 Subject 52.<sup style="font-size:12px;">4</sup> The type’s first printed edition (P-458a) is 19 August 2015.',
        ],
        [
          'Series / Number',
          'Read from the photo: AA22293893 (upper-left window) and AA26293893 (lower-right window). Photo reading, not BanRep archive confirmation. Issued P-458b notes carry series AE and AF; AA appears among later editions in the circular. That prefix is not used here to claim this sheet is an issued AE/AF note.<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Signatures',
          'Offices and names on <em>this</em> incomplete-face photo: ' +
            unconfirmed +
            '. The first edition (19.08.2015), per the issuer, carries José Darío Uribe Escobar and José Tolosa Buitrago; the circular does not name other signers for the 2.08.2016 edition. Those names are not assigned to this sheet.<sup style="font-size:12px;">2,4</sup>',
        ],
        [
          'Dimensions',
          'BanRep: 128 &times; 66 mm.<sup style="font-size:12px;">1,2</sup> Direct measurement of this specimen: ' +
            unconfirmed,
        ],
        [
          'Watermark',
          'Type: Débora Arango portrait and numeral 2 in transmitted light.<sup style="font-size:12px;">1,2</sup> Clearly visible in this photo: ' +
            unconfirmed,
        ],
        [
          'Catalog Reference',
          'Pick 458b (2.08.2016 type).<sup style="font-size:12px;">5,6</sup> Pick 458a is the 19.08.2015 edition.',
        ],
        ['Print run', unconfirmed],
        [
          'Known varieties',
          'Circular DTE-201 Subject 52: 2.08.2016 edition series AE (in circulation from 16.02.2018) and AF (from 5.06.2018), plus later AA–CC editions.<sup style="font-size:12px;">4</sup> This piece: progressive / partial proof (incomplete face, printed reverse, AA serials read from the photo).',
        ],
        [
          'Circulation dates',
          'This sheet is not catalogued as circulated. The issued type entered circulation on 29 November 2016 (first edition, 19.08.2015).<sup style="font-size:12px;">1,4</sup> The P-458b edition (2.08.2016) was released from 16 February 2018 (series AE) and 5 June 2018 (series AF).<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Basis of rarity',
          'Progressive or partial printing proof of type P-458b (incomplete face, printed reverse, visible serials). Print run and BanRep archive confirmation: ' +
            unconfirmed +
            '. The issued type is common. NGC/PCGS population: not applicable (not slabbed).',
        ],
        [
          'State of the specimen shown',
          'Unslabbed. Face with an unprinted portrait silhouette and visible underprint. Reverse with the Caño Cristales landscape, BRC thread, and printer imprint. AA serials read from the photo. Identification: progressive / partial proof of P-458b.',
        ],
        ['Date of last factual review', '25 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          `<strong style="color:#1c1a15;">Identificación:</strong> Colombia — Banco de la República — 2.000 pesos — 2.08.2016 — Débora Arango — P-458b — prueba de impresión progresiva o parcial: anverso incompleto (silueta del retrato en blanco) / reverso de Caño Cristales impreso, series AA leídas en foto. El 2.08.2016 se lee en el borde del reverso y coincide con la fecha de edición del tipo P-458b en la circular del Emisor.<sup style="font-size:12px;">4,5,6</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">El tipo emitido:</strong> BanRep puso el 2.000 pesos de Débora Arango en circulación el 29 de noviembre de 2016 (1.ª edición, 19.08.2015 / P-458a). El reverso de tipo es Caño Cristales.<sup style="font-size:12px;">1,2,4</sup> La edición del 2.08.2016 (series AE y AF) entra a circular en 2018.<sup style="font-size:12px;">4</sup> Este ejemplar no se cataloga como un billete emitido de esa circulación.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">No confundir:</strong> no es la <a href="${siblingHref}">otra prueba P-458b de esta colección</a> (retrato impreso, reverso en blanco, series tapadas), ni el <a href="${oroHref}">2.000 pesos oro</a>, ni el <a href="${errorHref}">error de la mariposa (Santander)</a>, ni un specimen con sobrecarga SPECIMEN. Más contexto en el <a href="${blogHref}">blog de personajes</a> y el <a href="${colombiaHref}">catálogo Colombia</a>.`,
          true,
        ),
      ]
    : [
        sectionP(
          `<strong style="color:#1c1a15;">Identification:</strong> Colombia — Banco de la República — 2,000 pesos — 2.08.2016 — Débora Arango — P-458b — progressive or partial printing proof: incomplete face (unprinted portrait silhouette) / printed Caño Cristales reverse, AA serials read from the photo. 2.08.2016 is read on the reverse edge and matches the P-458b edition date in the issuer’s circular.<sup style="font-size:12px;">4,5,6</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">The issued type:</strong> BanRep put the Débora Arango 2,000-peso note into circulation on 29 November 2016 (first edition, 19.08.2015 / P-458a). The type reverse is Caño Cristales.<sup style="font-size:12px;">1,2,4</sup> The 2.08.2016 edition (series AE and AF) entered circulation in 2018.<sup style="font-size:12px;">4</sup> This piece is not catalogued as an issued circulating note of that release.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Not to be confused with:</strong> the <a href="${siblingHref}">other P-458b proof in this collection</a> (printed portrait, blank reverse, blocked serials), the <a href="${oroHref}">2,000 pesos oro</a>, the <a href="${errorHref}">Santander butterfly error</a>, or a SPECIMEN-overprinted official specimen. More context in the <a href="${blogHref}">figures post</a> and the <a href="${colombiaHref}">Colombia catalog</a>.`,
          true,
        ),
      ];

  const details = isEs
    ? [
        bullet(
          '<strong style="color:#1c1a15;">Anverso incompleto:</strong> silueta en blanco donde iría el retrato de Débora Arango; bajoimpresión en azul, rosa y naranja; hojas naranjas a la izquierda con la leyenda «LECHUZA»; ave pequeña; figura de pie tenue a la derecha.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Texto del anverso:</strong> denominación y leyendas del tipo («2 MIL PESOS», «ARTISTA 1907–2005») no se leen con nitidez en esta capa. No se inventan aquí.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverso:</strong> Caño Cristales / Serranía de la Macarena impreso; «2 MIL PESOS» / «DOS MIL PESOS»; sello del Banco de la República; aves; cita en bloque; hilo BRC.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Fecha e imprenta:</strong> en el borde derecho del reverso se lee «2 DE AGOSTO DE 2016» e «IMPRENTA DE BILLETES - BANCO DE LA REPÚBLICA».',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Firmas:</strong> no leídas en esta foto del anverso incompleto.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Series:</strong> AA22293893 (arriba a la izquierda) y AA26293893 (abajo a la derecha), leídas en la foto. Presentación: anverso y reverso apilados, sin encapsulado.',
        ),
      ]
    : [
        bullet(
          '<strong style="color:#1c1a15;">Incomplete face:</strong> unprinted silhouette where Débora Arango’s portrait would sit; blue, pink, and orange underprint; orange leaves at left with the legend “LECHUZA”; a small bird; a faint standing figure at right.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Face text:</strong> type legends (“2 MIL PESOS”, “ARTISTA 1907–2005”) are not clearly readable on this layer. They are not supplied here.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverse:</strong> Caño Cristales / Serranía de la Macarena printed; “2 MIL PESOS” / “DOS MIL PESOS”; Banco de la República seal; birds; a block quotation; BRC thread.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Date and imprint:</strong> the right edge of the reverse reads “2 DE AGOSTO DE 2016” and “IMPRENTA DE BILLETES - BANCO DE LA REPÚBLICA.”',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Signatures:</strong> not read on this incomplete-face photo.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Serials:</strong> AA22293893 (upper left) and AA26293893 (lower right), read from the photo. Presentation: stacked face and reverse, not slabbed.',
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
          `4. <a href="${URLS.circular}" target="_blank" rel="noopener noreferrer">Circular DTE-201 Asunto 52 (PDF, abril 2024)${tab}</a>: 1.ª edición 19.08.2015; edición 2.08.2016 series AE (desde 16.02.2018) y AF (desde 5.06.2018).`,
        ),
        noteP(
          `5. <a href="${URLS.numista}" target="_blank" rel="noopener noreferrer">Numista — 2.000 pesos, 2015–2023${tab}</a>: tabla de fechas; 2.08.2016 = tipo P-458b.`,
        ),
        noteP(
          `6. <a href="${URLS.realbanknotes}" target="_blank" rel="noopener noreferrer">RealBanknotes — Colombia p458b, 2.08.2016${tab}</a>: ficha de catálogo secundaria del sufijo 458b.`,
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
          `4. <a href="${URLS.circular}" target="_blank" rel="noopener noreferrer">Circular DTE-201 Subject 52 (PDF, April 2024)${tab}</a>: first edition 19.08.2015; 2.08.2016 edition series AE (from 16.02.2018) and AF (from 5.06.2018).`,
        ),
        noteP(
          `5. <a href="${URLS.numista}" target="_blank" rel="noopener noreferrer">Numista — 2,000 pesos, 2015–2023${tab}</a>: date table; 2.08.2016 = type P-458b.`,
        ),
        noteP(
          `6. <a href="${URLS.realbanknotes}" target="_blank" rel="noopener noreferrer">RealBanknotes — Colombia p458b, 2.08.2016${tab}</a>: secondary catalogue card for suffix 458b.`,
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
  title: '2.000 pesos Débora, prueba anverso | Notofilia',
  description:
    'Prueba P-458b: 2.000 pesos Débora Arango, 2.08.2016. Retrato en blanco, reverso impreso.',
  keywords: [
    'banco de la república',
    '2000 pesos',
    'débora arango',
    'pick 458b',
    'prueba progresiva',
    'impresión parcial',
    'prueba anverso',
    'notafilia colombiana',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: '2.000 pesos Débora — prueba anverso P-458b',
  ogDescription:
    'Prueba progresiva: silueta del retrato en blanco, Caño Cristales impreso, series AA. Tipo 2.08.2016.',
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
            name: 'El Banco de la República — Dos Mil Pesos, prueba anverso P-458b (Débora Arango)',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'El Banco de la República — Dos Mil Pesos, prueba anverso (Débora Arango Pérez, P-458b)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Prueba de impresión progresiva o parcial del 2.000 pesos Débora Arango (P-458b). Anverso incompleto, reverso impreso, series AA leídas en foto. Fecha 2.08.2016 leída en el reverso.',
        dateCreated: '2016-08-02',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/colombia/#page` },
        identifier: `NF.colombia.${SLUG}`,
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '458b' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'Imprenta de Billetes — Banco de la República' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'Prueba de impresión progresiva / parcial; no encapsulado' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: `NF.colombia.${SLUG}`,
    kind: 'banknote',
    title: 'El Banco de la República',
    subtitle: 'Dos Mil Pesos · Débora Arango Pérez · P-458b · prueba anverso / reverso impreso',
    dateOrSeries: '2.08.2016 (leída en el reverso; tipo P-458b)',
    country: 'Colombia',
    issuer: 'El Banco de la República, Bogotá, Colombia',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colombia', href: '/coleccion/colombia/' },
      { name: 'El Banco de la República — Dos Mil Pesos, prueba anverso P-458b (Débora Arango)' },
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
      issueDate: '2.08.2016 (leída en el reverso; edición del tipo P-458b)',
      series: 'AA22293893 / AA26293893 (lectura de foto). Tipo emitido P-458b: AE y AF',
      serialNumber: 'AA22293893 (izq.) y AA26293893 (der.); lectura de foto',
      signatures: 'Cargos y nombres en esta foto: no confirmado',
      catalogNumber: 'Pick 458b',
      material: 'Papel de algodón 100 %',
      dimensions: '128 × 66 mm (BanRep); medición de este ejemplar: no confirmado',
      watermark: 'Tipo: retrato de Débora Arango y cifra 2; visibilidad en esta foto: no confirmado',
      condition: 'Prueba de impresión progresiva / parcial; no encapsulado',
      status: 'proof',
      printRun: 'no confirmado. BanRep no publica tirada del tipo emitido ni de material de prueba.',
      knownVarieties:
        'Este pliego: anverso incompleto / reverso impreso, series AA leídas en foto. Del tipo emitido P-458b: series AE y AF (2.08.2016). P-458a = 19.08.2015. Ediciones posteriores AA–CC en la circular.',
      circulationDates:
        'Este pliego no se cataloga como circulado. El tipo emitido entra el 29 de noviembre de 2016 (P-458a, 19.08.2015). P-458b (2.08.2016) circula desde el 16.02.2018 (AE) y el 5.06.2018 (AF).',
      rarityBasis:
        'Prueba de impresión progresiva o parcial del P-458b (anverso incompleto, reverso impreso). No hay cifra de BanRep ni archivo público que confirme origen o cantidad. El tipo emitido es corriente. Población NGC/PCGS: no aplica.',
      shownSpecimenState:
        'Sin encapsular. Anverso con silueta del retrato sin imprimir. Reverso con Caño Cristales, hilo BRC y pie de imprenta. Series AA leídas en foto. Identificación: prueba progresiva / parcial del P-458b. Grado numérico: no confirmado.',
      factualReviewDate: '2026-08-25',
    },
    render: 'astro-static',
    eyebrow: 'Prueba de impresión progresiva / parcial · Bogotá, Colombia · 2.08.2016',
    resourced: true,
    context: {
      historical:
        'Prueba de impresión progresiva o parcial del P-458b (Débora Arango). Fecha 2.08.2016 leída en el reverso. Anverso incompleto; reverso impreso; series AA leídas en foto. Distinta de la otra prueba P-458b de la colección (retrato impreso / reverso en blanco). No es un billete emitido ni un specimen SPECIMEN.',
      design:
        'Anverso: silueta del retrato en blanco, bajoimpresión, hojas / LECHUZA, ave, figura de pie tenue. Reverso: Caño Cristales, aves, sello BanRep, cita, hilo BRC, «2 DE AGOSTO DE 2016», Imprenta de Billetes.',
      varieties:
        'Pick 458b (2.08.2016). Este pliego: anverso incompleto, reverso impreso, series AA (foto). Circular DTE-201 Asunto 52: series AE y AF de esa edición; P-458a = 19.08.2015.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (anverso y reverso apilados)',
        note: 'Prueba progresiva / parcial: anverso con silueta del retrato sin imprimir, reverso de Caño Cristales impreso, series AA22293893 y AA26293893 leídas en foto. Pie de imprenta leído. No es specimen rotulado SPECIMEN ni billete emitido.',
      },
      {
        kind: 'printer',
        label: 'Imprenta de Billetes — Banco de la República',
        note: 'Leyenda leída en el borde del reverso de este ejemplar; coincide con el impresor oficial del tipo',
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
        url: 'https://www.banrep.gov.co/sites/default/files/reglamentacion/archivos/ceos_dte-201_Asunto_52_abr_8_2024.pdf',
        note: 'Edición 2.08.2016 series AE (desde 16.02.2018) y AF (desde 5.06.2018); 1.ª edición 19.08.2015',
      },
      {
        kind: 'catalog',
        label: 'Numista — 2.000 pesos, 2015–2023',
        url: 'https://en.numista.com/catalogue/note204972.html',
        note: 'Tabla de fechas; 2.08.2016 = P-458b',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes — Colombia p458b',
        url: 'https://www.realbanknotes.com/banknote/53881-Colombia-p458b-2000-Pesos-from-2016',
        note: 'Ficha secundaria del sufijo 458b (2.08.2016)',
      },
    ],
    related: [
      { href: '/coleccion/colombia/', title: 'Catálogo de Colombia' },
      {
        href: SIBLING_ES,
        title: 'Otra prueba P-458b (retrato impreso, reverso en blanco)',
      },
      { href: '/coleccion/colombia/banco-de-la-republica-2000-pesos-oro/', title: 'Dos Mil Pesos Oro' },
      { href: '/coleccion/colombia/2000-pesos-error-mariposa/', title: 'Error de la mariposa (Santander)' },
      { href: '/blog/personajes-billetes-colombia/', title: 'Personajes en los billetes de Colombia' },
    ],
  },
  legacyFile: 'billete-colombia-banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso.dc.html',
  sourceHash: createHash('sha1')
    .update('banco-de-la-republica-2000-pesos-debora-arango-prueba-anverso-v1')
    .digest('hex')
    .slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '2,000-peso Débora face proof P-458b | Notofilia',
      description:
        'P-458b proof: Colombia 2,000-peso Débora Arango, 2 Aug 2016. Blank portrait, printed reverse.',
      ogTitle: '2,000-peso Débora — P-458b face proof',
      ogDescription:
        'Progressive proof: unprinted portrait silhouette, printed Caño Cristales, AA serials. Type 2.08.2016.',
      template: buildTemplate('en'),
      recordTitle: 'El Banco de la República',
      eyebrow: 'Progressive / partial printing proof · Bogotá, Colombia · 2.08.2016',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
