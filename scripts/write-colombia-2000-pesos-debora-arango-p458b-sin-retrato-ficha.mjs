/**
 * Generator for the SECOND Banco de la República 2.000 pesos Débora Arango
 * P-458b progressive proof (face without portrait intaglio; printed reverse;
 * mismatched AA serials). Distinct from
 * /coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango/
 *
 * Usage: node scripts/write-colombia-2000-pesos-debora-arango-p458b-sin-retrato-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato/';
const EN_PATH = '/en/collection/colombia/banco-de-la-republica-2000-pesos-debora-arango-p458b-without-portrait/';
const IMG = '/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato';
const ZOOM_ID = 'colombia-banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato';
const OUT = path.join(
  process.cwd(),
  'src/content/catalog/colombia--banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato.json',
);

const SOURCE_CANDIDATES = [
  path.join(
    process.cwd(),
    'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato.png',
  ),
  path.join(
    process.cwd(),
    'public/uploads/colombia-banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato.jpg',
  ),
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
  'Prueba de impresión progresiva del 2.000 pesos Débora Arango (P-458b): anverso sin retrato intaglio, con series AA22293893 y AA26293893 disparejas; reverso de Caño Cristales impreso abajo';
const ALT_EN =
  'Progressive printing proof of the Débora Arango 2,000-peso note (P-458b): face without intaglio portrait, mismatched serials AA22293893 and AA26293893; printed Caño Cristales reverse below';

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
      ? 'Anverso sin retrato (arriba) y reverso de Caño Cristales (abajo) — Colección de Notofilia.com'
      : 'Face without portrait (top) and Caño Cristales reverse (bottom) — Notofilia.com Collection';
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
    ? 'Banco de la República — Dos Mil Pesos, prueba sin retrato (Débora Arango, P-458b)'
    : 'Banco de la República — Two Thousand Pesos, proof without portrait (Débora Arango, P-458b)';
  const eyebrow = isEs
    ? 'Prueba de impresión progresiva / parcial &middot; Bogotá, Colombia &middot; 2.08.2016'
    : 'Progressive / partial printing proof &middot; Bogotá, Colombia &middot; 2.08.2016';
  const subtitle = isEs
    ? 'Dos Mil Pesos &middot; Débora Arango Pérez &middot; P-458b &middot; anverso sin retrato'
    : 'Two Thousand Pesos &middot; Débora Arango Pérez &middot; P-458b &middot; face without portrait';
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
  const firstHref = isEs
    ? '/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango/'
    : '/en/collection/colombia/banco-de-la-republica-2000-pesos-debora-arango/';
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
          'Prueba de impresión progresiva o parcial del Pick 458b. Anverso sin la capa intaglio del retrato (silueta en blanco); reverso de Caño Cristales impreso; series AA22293893 (arriba izquierda) y AA26293893 (abajo derecha), disparejas. No es un billete de circulación emitido ni un specimen rotulado SPECIMEN. Distinto de la <a href="' +
            firstHref +
            '">otra prueba P-458b</a> de esta colección (retrato impreso, reverso en blanco, series tapadas).',
        ],
        ['Material', 'Papel de algodón 100 % (sustrato del tipo BanRep)'],
        ['Impresor', 'Imprenta de Billetes — Banco de la República (leído en el reverso)'],
        [
          'Fecha de edición',
          '2 de agosto de 2016: leída en el reverso («2 DE AGOSTO DE 2016»). Coincide con la fecha de edición del tipo P-458b (series AE y AF) en la Circular DTE-201 Asunto 52.<sup style="font-size:12px;">4</sup> La 1.ª edición impresa del tipo (P-458a) es el 19 de agosto de 2015.',
        ],
        [
          'Serie / Número',
          'AA22293893 (arriba izquierda) y AA26293893 (abajo derecha): no coinciden (tercer y cuarto dígitos 22 frente a 26). El tipo P-458b emitido lleva series AE y AF; la circular lista AA–CC como ediciones posteriores.<sup style="font-size:12px;">4</sup> Identificación P-458b: por la fecha del reverso y el archivo del usuario, con esta salvedad del prefijo AA.',
        ],
        [
          'Firmas',
          'No se leen cargos ni firmas en el anverso de esta foto (la capa intaglio del retrato y del texto inferior no está impresa). Nombres: ' +
            unconfirmed +
            '.',
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
          'Circular DTE-201 Asunto 52: edición 2.08.2016 series AE y AF, y ediciones posteriores AA–CC.<sup style="font-size:12px;">4</sup> Este ejemplar: prueba progresiva / parcial (anverso sin retrato, reverso impreso, series AA disparejas). Distinto de la <a href="' +
            firstHref +
            '">prueba con retrato y reverso en blanco</a> de esta colección.',
        ],
        [
          'Fechas de circulación',
          'Este pliego no circuló. El tipo emitido entra en circulación el 29 de noviembre de 2016 (1.ª edición, 19.08.2015).<sup style="font-size:12px;">1,4</sup> La edición P-458b (2.08.2016) se pone a circular desde el 16 de febrero de 2018 (serie AE) y el 5 de junio de 2018 (serie AF).<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Base de la rareza',
          'Prueba de impresión progresiva o parcial del tipo P-458b (anverso sin retrato, reverso de Caño Cristales, series AA disparejas). Tirada y confirmación de archivo BanRep: ' +
            unconfirmed +
            '. El tipo emitido es corriente. Población NGC/PCGS: no aplica (no encapsulado).',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular. Anverso con fondo de color y figura lineal, sin retrato intaglio. Reverso de Caño Cristales impreso; fecha 2.08.2016 y pie de Imprenta de Billetes. Series AA22293893 / AA26293893 disparejas.',
        ],
        ['Fecha de última revisión factual', '25 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Colombia'],
        ['Issuing Entity', 'El Banco de la República, Bogotá, Colombia'],
        ['Denomination', 'Two Thousand Pesos'],
        [
          'Type of Issue',
          'Progressive or partial printing proof of Pick 458b. Face without the intaglio portrait layer (white silhouette); printed Caño Cristales reverse; serials AA22293893 (upper left) and AA26293893 (lower right), which do not match. Not an issued circulating note and not a SPECIMEN-overprinted official specimen. Distinct from the <a href="' +
            firstHref +
            '">other P-458b proof</a> in this collection (printed portrait, blank reverse, blocked serials).',
        ],
        ['Material', '100% cotton paper (BanRep type substrate)'],
        ['Printer', 'Banknote Printing Works — Banco de la República (read on the reverse)'],
        [
          'Edition date',
          '2 August 2016: read on the reverse (“2 DE AGOSTO DE 2016”). Matches the P-458b edition date (series AE and AF) in Circular DTE-201 Subject 52.<sup style="font-size:12px;">4</sup> The type’s first printed edition (P-458a) is 19 August 2015.',
        ],
        [
          'Series / Number',
          'AA22293893 (upper left) and AA26293893 (lower right): they do not match (third and fourth digits 22 vs 26). Issued P-458b notes carry series AE and AF; the circular lists AA–CC as later editions.<sup style="font-size:12px;">4</sup> P-458b identification: from the reverse date and the user’s file, with this AA-prefix caveat.',
        ],
        [
          'Signatures',
          'No offices or signatures are readable on the face in this photo (the intaglio portrait and lower text layer is not printed). Names: ' +
            unconfirmed +
            '.',
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
          'Circular DTE-201 Subject 52: 2.08.2016 edition series AE and AF, plus later AA–CC editions.<sup style="font-size:12px;">4</sup> This piece: progressive / partial proof (face without portrait, printed reverse, mismatched AA serials). Distinct from the <a href="' +
            firstHref +
            '">proof with portrait and blank reverse</a> in this collection.',
        ],
        [
          'Circulation dates',
          'This sheet did not circulate. The issued type entered circulation on 29 November 2016 (first edition, 19.08.2015).<sup style="font-size:12px;">1,4</sup> The P-458b edition (2.08.2016) was released from 16 February 2018 (series AE) and 5 June 2018 (series AF).<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Basis of rarity',
          'Progressive or partial printing proof of type P-458b (face without portrait, Caño Cristales reverse, mismatched AA serials). Print run and BanRep archive confirmation: ' +
            unconfirmed +
            '. The issued type is common. NGC/PCGS population: not applicable (not slabbed).',
        ],
        [
          'State of the specimen shown',
          'Unslabbed. Face with colour underprint and a line figure, no intaglio portrait. Printed Caño Cristales reverse; date 2.08.2016 and Imprenta de Billetes imprint. Serials AA22293893 / AA26293893 do not match.',
        ],
        ['Date of last factual review', '25 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          `<strong style="color:#1c1a15;">Identificación:</strong> Colombia — Banco de la República — 2.000 pesos — 2.08.2016 — Débora Arango — P-458b — prueba de impresión progresiva o parcial: anverso sin retrato intaglio / reverso de Caño Cristales impreso / series AA22293893 y AA26293893 disparejas. El 2.08.2016 se lee en este reverso.<sup style="font-size:12px;">4,5,6</sup> Distinto de la <a href="${firstHref}">prueba con retrato y reverso en blanco</a>.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">El tipo emitido:</strong> BanRep puso el 2.000 pesos de Débora Arango en circulación el 29 de noviembre de 2016 (1.ª edición, 19.08.2015 / P-458a). El reverso de tipo es Caño Cristales.<sup style="font-size:12px;">1,2,4</sup> La edición del 2.08.2016 (series AE y AF) entra a circular en 2018; la circular lista AA–CC como ediciones posteriores.<sup style="font-size:12px;">4</sup> Este ejemplar no se cataloga como un billete emitido.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">No confundir:</strong> no es el <a href="${oroHref}">2.000 pesos oro</a>, ni el <a href="${errorHref}">error de la mariposa (Santander)</a>, ni un specimen con sobrecarga SPECIMEN, ni la <a href="${firstHref}">otra prueba P-458b</a> (retrato impreso, reverso en blanco). Más contexto en el <a href="${blogHref}">blog de personajes</a> y el <a href="${colombiaHref}">catálogo Colombia</a>.`,
          true,
        ),
      ]
    : [
        sectionP(
          `<strong style="color:#1c1a15;">Identification:</strong> Colombia — Banco de la República — 2,000 pesos — 2.08.2016 — Débora Arango — P-458b — progressive or partial printing proof: face without intaglio portrait / printed Caño Cristales reverse / mismatched serials AA22293893 and AA26293893. 2.08.2016 is read on this reverse.<sup style="font-size:12px;">4,5,6</sup> Distinct from the <a href="${firstHref}">proof with portrait and blank reverse</a>.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">The issued type:</strong> BanRep put the Débora Arango 2,000-peso note into circulation on 29 November 2016 (first edition, 19.08.2015 / P-458a). The type reverse is Caño Cristales.<sup style="font-size:12px;">1,2,4</sup> The 2.08.2016 edition (series AE and AF) entered circulation in 2018; the circular lists AA–CC as later editions.<sup style="font-size:12px;">4</sup> This piece is not catalogued as an issued circulating note.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Not to be confused with:</strong> the <a href="${oroHref}">2,000 pesos oro</a>, the <a href="${errorHref}">Santander butterfly error</a>, a SPECIMEN-overprinted official specimen, or the <a href="${firstHref}">other P-458b proof</a> (printed portrait, blank reverse). More context in the <a href="${blogHref}">figures post</a> and the <a href="${colombiaHref}">Colombia catalog</a>.`,
          true,
        ),
      ];

  const details = isEs
    ? [
        bullet(
          '<strong style="color:#1c1a15;">Anverso incompleto:</strong> silueta en blanco donde iría el retrato intaglio de Débora Arango. Se ven fondo azul-rosa-naranja, dos hojas naranja, un ave y la palabra «LECHUZA», y una figura lineal a la derecha.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Series disparejas:</strong> AA22293893 arriba a la izquierda y AA26293893 abajo a la derecha (22 frente a 26 en el tercer y cuarto dígito).',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverso impreso:</strong> paisaje de Caño Cristales / Serranía de la Macarena; aves; «2 MIL PESOS» / «DOS MIL PESOS»; sello del Banco de la República.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Fecha e impresor:</strong> «2 DE AGOSTO DE 2016» e «IMPRENTA DE BILLETES — BANCO DE LA REPÚBLICA» en el margen derecho del reverso.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Hilo:</strong> hilo BRC vertical a la izquierda del centro en el reverso.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Presentación:</strong> anverso y reverso apilados, sin encapsulado.',
        ),
      ]
    : [
        bullet(
          '<strong style="color:#1c1a15;">Incomplete face:</strong> a white silhouette where Débora Arango’s intaglio portrait would sit. Blue-pink-orange underprint, two orange leaves, a bird and the word “LECHUZA,” and a line figure at right.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Mismatched serials:</strong> AA22293893 at upper left and AA26293893 at lower right (22 vs 26 in the third and fourth digits).',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Printed reverse:</strong> Caño Cristales / Serranía de la Macarena landscape; birds; “2 MIL PESOS” / “DOS MIL PESOS”; Banco de la República seal.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Date and printer:</strong> “2 DE AGOSTO DE 2016” and “IMPRENTA DE BILLETES — BANCO DE LA REPÚBLICA” on the right edge of the reverse.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Thread:</strong> vertical BRC thread left of centre on the reverse.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Presentation:</strong> stacked face and reverse, not slabbed.',
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
  title: '2.000 pesos Débora, prueba sin retrato | Notofilia',
  description:
    'Prueba P-458b: anverso sin retrato, reverso Caño Cristales, series AA disparejas. 2.08.2016. Colección Notofilia.',
  keywords: [
    'banco de la república',
    '2000 pesos',
    'débora arango',
    'pick 458b',
    'prueba progresiva',
    'sin retrato',
    'notafilia colombiana',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: '2.000 pesos Débora — prueba sin retrato',
  ogDescription:
    'Prueba P-458b: anverso sin retrato, reverso Caño Cristales, series AA22293893 / AA26293893. Tipo 2.08.2016.',
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
            name: 'El Banco de la República — Dos Mil Pesos, prueba P-458b sin retrato (Débora Arango)',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'El Banco de la República — Dos Mil Pesos, prueba sin retrato (Débora Arango Pérez, P-458b)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Prueba de impresión progresiva del 2.000 pesos Débora Arango (P-458b). Anverso sin retrato, reverso de Caño Cristales, series AA disparejas. Fecha 2.08.2016 leída en el reverso.',
        dateCreated: '2016-08-02',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/colombia/#page` },
        identifier: 'NF.colombia.banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '458b' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'Imprenta de Billetes — Banco de la República' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'Prueba progresiva: anverso sin retrato; no encapsulado' },
          { '@type': 'PropertyValue', name: 'Series', value: 'AA22293893 / AA26293893' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.colombia.banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato',
    kind: 'banknote',
    title: 'El Banco de la República',
    subtitle: 'Dos Mil Pesos · Débora Arango Pérez · P-458b · anverso sin retrato',
    dateOrSeries: '2.08.2016 (leída en el reverso)',
    country: 'Colombia',
    issuer: 'El Banco de la República, Bogotá, Colombia',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colombia', href: '/coleccion/colombia/' },
      { name: 'El Banco de la República — Dos Mil Pesos, prueba P-458b sin retrato (Débora Arango)' },
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
      printer: 'Imprenta de Billetes — Banco de la República (leído en el reverso)',
      issueDate: '2.08.2016 (leída en el reverso; fecha de tipo P-458b)',
      series: 'AA (circular: AA–CC son ediciones posteriores; P-458b emitido: AE y AF)',
      serialNumber: 'AA22293893 (SI) y AA26293893 (ID); no coinciden',
      signatures: 'No se leen en esta foto. Nombres: no confirmado',
      catalogNumber: 'Pick 458b',
      material: 'Papel de algodón 100 %',
      dimensions: '128 × 66 mm (BanRep); medición de este ejemplar: no confirmado',
      watermark: 'Tipo: retrato de Débora Arango y cifra 2; visibilidad en esta foto: no confirmado',
      condition: 'Prueba progresiva: anverso sin retrato; no encapsulado',
      status: 'proof',
      printRun: 'no confirmado. BanRep no publica tirada del tipo emitido ni de material de prueba.',
      knownVarieties:
        'Este pliego: anverso sin retrato / reverso de Caño Cristales / series AA disparejas. Distinto de la otra prueba P-458b (retrato, reverso en blanco, series tapadas). Del tipo emitido P-458b: series AE y AF (2.08.2016). P-458a = 19.08.2015. Ediciones posteriores AA–CC en la circular.',
      circulationDates:
        'Este pliego no circuló. El tipo emitido entra el 29 de noviembre de 2016 (P-458a, 19.08.2015). P-458b (2.08.2016) circula desde el 16.02.2018 (AE) y el 5.06.2018 (AF).',
      rarityBasis:
        'Prueba de impresión progresiva o parcial del P-458b (anverso sin retrato, reverso impreso, series AA disparejas). No hay cifra de BanRep ni archivo público que confirme origen o cantidad. El tipo emitido es corriente. Población NGC/PCGS: no aplica.',
      shownSpecimenState:
        'Sin encapsular. Anverso con fondo de color y figura lineal, sin retrato intaglio. Reverso de Caño Cristales impreso; fecha 2.08.2016 y pie de Imprenta de Billetes. Series AA22293893 / AA26293893 disparejas. Grado numérico: no confirmado.',
      factualReviewDate: '2026-08-25',
    },
    render: 'astro-static',
    eyebrow: 'Prueba de impresión progresiva / parcial · Bogotá, Colombia · 2.08.2016',
    resourced: true,
    context: {
      historical:
        'Prueba de impresión progresiva o parcial del P-458b (Débora Arango). Fecha 2.08.2016 leída en el reverso. Anverso sin retrato intaglio; reverso de Caño Cristales; series AA22293893 / AA26293893 disparejas. Distinta de la otra prueba P-458b de esta colección. No es un billete emitido ni un specimen SPECIMEN.',
      design:
        'Anverso: fondo de color, silueta del retrato, LECHUZA, figura lineal, series AA disparejas. Reverso: Caño Cristales, aves, 2 DE AGOSTO DE 2016, Imprenta de Billetes, hilo BRC.',
      varieties:
        'Pick 458b (2.08.2016). Este pliego: anverso sin retrato, reverso impreso, series AA. Distinto de la prueba con retrato y reverso en blanco. Circular: AE y AF de esa edición; AA–CC posteriores; P-458a = 19.08.2015.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (anverso y reverso apilados)',
        note: 'Prueba progresiva / parcial: anverso sin retrato intaglio, reverso de Caño Cristales, series AA22293893 / AA26293893 disparejas. Fecha 2.08.2016 e Imprenta de Billetes leídas en el reverso. No es specimen SPECIMEN ni billete emitido.',
      },
      {
        kind: 'printer',
        label: 'Imprenta de Billetes — Banco de la República',
        note: 'Impresor oficial del tipo; pie de imprenta leído en el reverso de este ejemplar',
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
      { href: '/coleccion/colombia/banco-de-la-republica-2000-pesos-debora-arango/', title: 'Otra prueba P-458b (retrato / reverso en blanco)' },
      { href: '/coleccion/colombia/', title: 'Catálogo de Colombia' },
      { href: '/coleccion/colombia/banco-de-la-republica-2000-pesos-oro/', title: 'Dos Mil Pesos Oro' },
      { href: '/coleccion/colombia/2000-pesos-error-mariposa/', title: 'Error de la mariposa (Santander)' },
      { href: '/blog/personajes-billetes-colombia/', title: 'Personajes en los billetes de Colombia' },
    ],
  },
  legacyFile: 'billete-colombia-banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato.dc.html',
  sourceHash: createHash('sha1').update('banco-de-la-republica-2000-pesos-debora-arango-p458b-sin-retrato-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Débora 2,000-peso proof, no portrait | Notofilia',
      description:
        'P-458b progressive proof: face without portrait, Caño Cristales reverse, mismatched AA serials. 2 Aug 2016.',
      ogTitle: 'Débora 2,000-peso proof, no portrait',
      ogDescription:
        'P-458b progressive proof: face without portrait, Caño Cristales reverse, serials AA22293893 / AA26293893.',
      template: buildTemplate('en'),
      recordTitle: 'El Banco de la República',
      eyebrow: 'Progressive / partial printing proof · Bogotá, Colombia · 2.08.2016',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
