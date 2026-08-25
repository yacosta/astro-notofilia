/**
 * Generator for the Philippines Victory Series 66 2 pesos (Pick 95a) ficha.
 * Usage: node scripts/write-filipinas-2-pesos-victory-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/filipinas/2-pesos-victory-series-66/';
const EN_PATH = '/en/collection/philippines/2-pesos-victory-series-66/';
const SLUG = 'philippines-treasury-certificate-2-pesos-victory-series-66-cc5b2834';
const IMG = `/uploads/${SLUG}`;
const ZOOM_ID = 'filipinas-2-pesos-victory-series-66';
const OUT = path.join(process.cwd(), 'src/content/catalog/filipinas--2-pesos-victory-series-66.json');

const jpgPath = path.join(process.cwd(), `public/uploads/${SLUG}.jpg`);
let IMG_WIDTH = 1024;
let IMG_HEIGHT = 1284;
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
  'Certificado del Tesoro de Filipinas de 2 pesos, Victory Series No. 66, serial F13317943: anverso con retrato de Rizal y sello azul (arriba) y reverso azul con sobresello VICTORY (abajo)';
const ALT_EN =
  'Philippines Treasury Certificate of 2 pesos, Victory Series No. 66, serial F13317943: obverse with Rizal portrait and blue seal (top) and blue reverse with VICTORY overprint (bottom)';

function newTab(isEs) {
  return isEs
    ? '<span style="font-style:italic; font-weight:400;"> (se abre en una pestaña nueva)</span>'
    : '<span style="font-style:italic; font-weight:400;"> (opens in a new tab)</span>';
}

function extLink(href, label, isEs) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#6b521f;">${label}${newTab(isEs)}</a>`;
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

function p(text) {
  return `<p style="font-size:19px; line-height:1.65; color:#332e22; margin:0 0 12px;">${text}</p>`;
}

function noteP(text) {
  return `<p style="font-size:14px; line-height:1.6; color:#5c4e33; margin:0 0 6px;">${text}</p>`;
}

function buildTemplate(lang) {
  const isEs = lang === 'es';
  const pageUrl = isEs ? ES_PATH : EN_PATH;
  const hubHref = isEs ? '/coleccion/filipinas/' : '/en/collection/philippines/';
  const hubLabel = isEs ? '&larr; Catálogo de Filipinas' : '&larr; Philippines catalog';
  const screen = isEs
    ? 'Filipinas — 2 Pesos Victory Series No. 66'
    : 'Philippines — 2 Pesos Victory Series No. 66';
  const eyebrow = isEs
    ? 'Tesorería de Filipinas &middot; Victory Series No. 66 &middot; 1944'
    : 'Treasury of the Philippines &middot; Victory Series No. 66 &middot; 1944';
  const h1 = isEs ? 'Dos Pesos Victory Series No. 66' : 'Two Pesos Victory Series No. 66';
  const subtitle = isEs
    ? 'Certificado del Tesoro &middot; Pick 95a &middot; serial F13317943'
    : 'Treasury Certificate &middot; Pick 95a &middot; serial F13317943';
  const alt = isEs ? ALT_ES : ALT_EN;

  const rows = isEs
    ? [
        ['País', 'Filipinas (Commonwealth)'],
        ['Entidad Emisora', 'Tesorería de Filipinas (<em>Treasury of the Philippines</em>)'],
        ['Denominación', '2 pesos (dos pesos)'],
        [
          'Tipo de Emisión',
          'Treasury Certificate — certificado de depósito pagadero al portador en pesos plata o en curso legal de Estados Unidos de valor equivalente',
        ],
        ['Serie', 'Victory Series No. 66 (sin fecha impresa; ND 1944)'],
        ['Número de Serie', 'F13317943 (tinta azul, repetido)'],
        ['Firmas', 'S. Osmeña (President) y J. Hernandez (Auditor General), visibles en el ejemplar'],
        ['Impresor', 'U.S. Bureau of Engraving and Printing (sin pie de imprenta en el ejemplar)'],
        ['Material', 'Papel'],
        [
          'Dimensiones',
          'Numista cita 161,9 &times; 67,4 mm.<sup style="font-size:12px;">6</sup> Medición propia: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Referencia de Catálogo', 'Pick 95a (tipo sin sobresello del Banco Central)'],
        [
          'Tirada',
          'Fuentes secundarias que citan entregas BEP: 16.231.272 (2 pesos, Osmeña–Hernandez).<sup style="font-size:12px;">6,7</sup> Informe BEP original: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Variedades conocidas',
          'Pick 95a (esta ficha); Pick 95b (Roxas–Guevara, título Treasurer); Pick 95r1/r2 (reposición con estrella); Pick 95s (specimen). Pick 118: mismo tipo con sobresello rojo CENTRAL BANK OF THE PHILIPPINES (1949); Bank Note Museum anota 118[a] Osmeña–Hernandez como no emitido.<sup style="font-size:12px;">4,5</sup>',
        ],
        [
          'Fechas de circulación',
          'Puesta en circulación con el desembarco en Leyte, 20 de octubre de 1944.<sup style="font-size:12px;">1,8</sup> Tipo sin sobresello CBP: 1944–1949. La serie Victory con sobresello CBP permaneció de curso legal hasta el 30 de julio de 1964.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Base de la rareza',
          'Tipo común de la serie 66 (Pick 95a). El 95b (Roxas) es la firma menos frecuente. El ejemplar no está encapsulado. Población PMG del Pick 95a: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular, anverso y reverso fotografiados sobre fondo blanco; serial F13317943; sello y series azules; sobresello negro VICTORY en el reverso; sin sobresello rojo CENTRAL BANK OF THE PHILIPPINES. Grado numérico: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Fecha de última revisión factual', '22 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Philippines (Commonwealth)'],
        ['Issuing Entity', 'Treasury of the Philippines'],
        ['Denomination', '2 pesos (two pesos)'],
        [
          'Type of Issue',
          'Treasury Certificate — deposit certificate payable to bearer in silver pesos or in United States legal tender of equivalent value',
        ],
        ['Series', 'Victory Series No. 66 (no printed date; ND 1944)'],
        ['Serial Number', 'F13317943 (blue ink, repeated)'],
        ['Signatures', 'S. Osmeña (President) and J. Hernandez (Auditor General), visible on the specimen'],
        ['Printer', 'U.S. Bureau of Engraving and Printing (no imprint on this specimen)'],
        ['Material', 'Paper'],
        [
          'Dimensions',
          'Numista lists 161.9 &times; 67.4 mm.<sup style="font-size:12px;">6</sup> Own measurement: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Catalog Reference', 'Pick 95a (type without the Central Bank overprint)'],
        [
          'Print Run',
          'Secondary sources citing BEP deliveries: 16,231,272 (2 pesos, Osmeña–Hernandez).<sup style="font-size:12px;">6,7</sup> Original BEP report: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Known Varieties',
          'Pick 95a (this record); Pick 95b (Roxas–Guevara, Treasurer title); Pick 95r1/r2 (star replacement); Pick 95s (specimen). Pick 118: the same type with a red CENTRAL BANK OF THE PHILIPPINES overprint (1949); the Bank Note Museum marks 118[a] Osmeña–Hernandez as not issued.<sup style="font-size:12px;">4,5</sup>',
        ],
        [
          'Circulation Dates',
          'Released with the Leyte landing on 20 October 1944.<sup style="font-size:12px;">1,8</sup> Type without CBP overprint: 1944–1949. Victory notes with the CBP overprint remained legal tender until 30 July 1964.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Rarity Basis',
          'Common type within Series 66 (Pick 95a). Pick 95b (Roxas) is the scarcer signature. This specimen is not encapsulated. PMG population for Pick 95a: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Shown Specimen State',
          'Unencapsulated, obverse and reverse photographed on a white background; serial F13317943; blue seal and serials; black VICTORY overprint on the reverse; no red CENTRAL BANK OF THE PHILIPPINES overprint. Numeric grade: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Date of Last Factual Review', '22 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const context = isEs
    ? [
        p(
          `<strong style="color:#1c1a15;">Dos pesos, retrato de Rizal:</strong> el ejemplar es un certificado del Tesoro de <em>dos pesos</em>, con José Rizal a la izquierda. La cláusula promete el pago en pesos plata o en curso legal de Estados Unidos de valor equivalente (el peso de la Commonwealth estaba ligado al dólar 2:1).<sup style="font-size:12px;">2</sup> El valor facial impreso es TWO PESOS.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Pick 95a, no Pick 118:</strong> el Standard Catalog y el Bank Note Museum numeran este tipo —Victory Series No. 66 sin el sobresello rojo del Banco Central— como Pick 95a, con el título inferior «Auditor General».<sup style="font-size:12px;">3,4</sup> Pick 95b usa las firmas de Roxas y Guevara y el título «Treasurer». Pick 118 es el mismo diseño con sobresello rojo «CENTRAL BANK OF THE PHILIPPINES» aplicado en 1949 sobre existencias del Pick 95; el Bank Note Museum marca la combinación Osmeña–Hernandez de ese sobresello como no emitida.<sup style="font-size:12px;">5</sup> Este ejemplar no lleva ese sobresello rojo.`,
        ),
        p(
          `<strong style="color:#1c1a15;">La liberación de 1944:</strong> el Bangko Sentral ng Pilipinas registra que las fuerzas de liberación estadounidenses llevaron la Victory Series No. 66 en 1944, y que, con la creación del Banco Central en 1949, las denominaciones de esa serie recibieron el sobresello «Central Bank of the Philippines» y siguieron de curso legal hasta el 30 de julio de 1964.<sup style="font-size:12px;">1</sup> En su historia monetaria, el BSP describe esos certificados del Tesoro sobreimpresos con la palabra Victory como el papel usado al recuperar la soberanía.<sup style="font-size:12px;">2</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">«No. 66»:</strong> sitios numismáticos filipinos atribuyen a un informe del BEP la elección del número 66 como la edad de Manuel L. Quezon al morir (1 de agosto de 1944). Quezon nació el 19 de agosto de 1878 y tenía 65 años; la cifra 66 no coincide con esa edad.<sup style="font-size:12px;">8</sup> El informe BEP no se cita aquí de primera mano.`,
        ),
      ]
    : [
        p(
          `<strong style="color:#1c1a15;">Two pesos, Rizal portrait:</strong> the specimen is a Treasury Certificate for <em>two pesos</em>, with José Rizal at left. The clause promises payment in silver pesos or in United States legal tender of equivalent value (the Commonwealth peso was tied to the dollar at 2:1).<sup style="font-size:12px;">2</sup> The printed face value is TWO PESOS.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Pick 95a, not Pick 118:</strong> the Standard Catalog and the Bank Note Museum number this type —Victory Series No. 66 without the red Central Bank overprint— as Pick 95a, with the lower title “Auditor General”.<sup style="font-size:12px;">3,4</sup> Pick 95b uses the Roxas and Guevara signatures and the title “Treasurer”. Pick 118 is the same design with a red “CENTRAL BANK OF THE PHILIPPINES” overprint applied in 1949 on remaining Pick 95 stock; the Bank Note Museum marks the Osmeña–Hernandez combination of that overprint as not issued.<sup style="font-size:12px;">5</sup> This specimen does not carry that red overprint.`,
        ),
        p(
          `<strong style="color:#1c1a15;">The 1944 liberation:</strong> Bangko Sentral ng Pilipinas records that American liberation forces brought Victory Series No. 66 in 1944, and that after the Central Bank was created in 1949 the series denominations were overprinted “Central Bank of the Philippines” and remained legal tender until 30 July 1964.<sup style="font-size:12px;">1</sup> In its monetary history the BSP describes those Treasury certificates overprinted with the word Victory as the paper used when sovereignty was recovered.<sup style="font-size:12px;">2</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">“No. 66”:</strong> Philippine numismatic sites attribute to a BEP report the choice of 66 as Manuel L. Quezon’s age at death (1 August 1944). Quezon was born on 19 August 1878 and was 65; the figure 66 does not match that age.<sup style="font-size:12px;">8</sup> The BEP report is not cited here at first hand.`,
        ),
      ];

  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const details = isEs
    ? [
        bullet(
          `<strong style="color:#1c1a15;">Retrato:</strong> José Rizal a la izquierda, en óvalo con palmas; «VICTORY SERIES NO. 66» en el cuadrante inferior izquierdo.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Encabezado:</strong> «TREASURY CERTIFICATE» y la autorización de la legislatura filipina aprobada por el presidente de Estados Unidos el 13 de junio de 1922.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Cláusula:</strong> «THIS CERTIFIES THAT THERE HAS BEEN DEPOSITED IN THE TREASURY OF THE PHILIPPINES / TWO PESOS / PAYABLE TO THE BEARER ON DEMAND IN SILVER PESOS OR IN LEGAL TENDER CURRENCY OF THE UNITED STATES OF EQUIVALENT VALUE».`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Sello:</strong> sello azul de la Commonwealth of the Philippines / United States of America a la derecha.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Series:</strong> F13317943 en tinta azul, repetido; «VICTORY» y «SERIES NO. 66» en el cuadrante superior derecho.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Firmas:</strong> S. Osmeña, rotulado President; J. Hernandez, rotulado Auditor General.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Reverso:</strong> azul con «TWO PESOS» y un 2 grande; sobresello negro «VICTORY» a todo lo ancho. No hay sobresello rojo del Banco Central.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Colorido:</strong> anverso en negro sobre fondo azul claro, con sello y series azules; reverso azul.`,
        ),
      ]
    : [
        bullet(
          `<strong style="color:#1c1a15;">Portrait:</strong> José Rizal at left, in an oval with palms; “VICTORY SERIES NO. 66” in the lower-left quadrant.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Heading:</strong> “TREASURY CERTIFICATE” and the Philippine legislature authorization approved by the President of the United States on 13 June 1922.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Clause:</strong> “THIS CERTIFIES THAT THERE HAS BEEN DEPOSITED IN THE TREASURY OF THE PHILIPPINES / TWO PESOS / PAYABLE TO THE BEARER ON DEMAND IN SILVER PESOS OR IN LEGAL TENDER CURRENCY OF THE UNITED STATES OF EQUIVALENT VALUE”.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Seal:</strong> blue Commonwealth of the Philippines / United States of America seal at right.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Serials:</strong> F13317943 in blue ink, repeated; “VICTORY” and “SERIES NO. 66” in the upper-right quadrant.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Signatures:</strong> S. Osmeña, titled President; J. Hernandez, titled Auditor General.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Reverse:</strong> blue with “TWO PESOS” and a large 2; black “VICTORY” overprint across the width. No red Central Bank overprint.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Color:</strong> black face on a light-blue underprint, with blue seal and serials; blue reverse.`,
        ),
      ];

  const notesTitle = isEs ? 'Notas' : 'Notes';
  const notes = isEs
    ? [
        noteP(
          `1. ${extLink('https://www.bsp.gov.ph/SitePages/CoinsAndNotes/EnglishSeries.aspx', 'Bangko Sentral ng Pilipinas — English Series / demonetized notes', true)}: las fuerzas de liberación llevaron la Victory Series No. 66 en 1944; con el Banco Central (1949) las denominaciones de esa serie se sobreimprimieron «Central Bank of the Philippines» y siguieron de curso legal hasta el 30 de julio de 1964.`,
        ),
        noteP(
          `2. ${extLink('https://www.bsp.gov.ph/Pages/CoinsAndNotes/HistoryOfPhilippineMoney/HistoryOfPhilippineMoney.aspx', 'BSP — History of Philippine Money', true)}: el peso de la Commonwealth se ligó al dólar 2:1; al recuperar la soberanía se usaron certificados del Tesoro sobreimpresos con «Victory».`,
        ),
        noteP(
          `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0095.htm', 'Bank Note Museum — Philippines P-95', true)}: 2 pesos, Treasury of the Philippines, series 66 (1944), sobresello VICTORY; 95a = título Auditor General; 95b = Treasurer.`,
        ),
        noteP(
          `4. ${extLink('https://www.realbanknotes.com/banknote/27184-Philippines-p95a-2-Pesos-from-1944', 'RealBanknotes / Standard Catalog — Pick 95a', true)}: ND (1944); negro sobre fondo azul; Rizal a la izquierda; VICTORY SERIES NO. 66 dos veces en lugar de fecha; sello azul; firmas Osmeña y J. Hernandez; título Auditor General; reverso azul con VICTORY en negro; impresor USBEP sin pie.`,
        ),
        noteP(
          `5. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0118.htm', 'Bank Note Museum P-118', true)}: ND (1949); sobresello rojo CENTRAL BANK OF THE PHILIPPINES sobre el Pick 95; 118[a] Osmeña–Hernandez no emitido; 118b Roxas–Guevara. No es este ejemplar.`,
        ),
        noteP(
          `6. ${extLink('https://en.numista.com/catalogue/note203356.html', 'Numista — 2 Pesos (Victory)', true)}: 161,9 &times; 67,4 mm; Pick 95a, firmas Osmeña y Hernandez, título AUDITOR GENERAL; tirada 16.231.272. Cifras de catálogo secundario.`,
        ),
        noteP(
          `7. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', true)}: tabla de entregas BEP; 2 pesos Rizal, Osmeña–Hernandez, 16.231.272. No es un documento BEP de primera mano.`,
        ),
        noteP(
          `8. ${extLink('https://www.numismatics.ph/banknotes/victory-series/', 'numismatics.ph — Victory Series No. 66', true)}: atribuye al BEP el «66»; desembarco en Leyte el 20 de octubre de 1944; total facial de la serie ₱1.019.544.000. Fuente secundaria.`,
        ),
      ]
    : [
        noteP(
          `1. ${extLink('https://www.bsp.gov.ph/SitePages/CoinsAndNotes/EnglishSeries.aspx', 'Bangko Sentral ng Pilipinas — English Series / demonetized notes', false)}: liberation forces brought Victory Series No. 66 in 1944; after the Central Bank (1949) those denominations were overprinted “Central Bank of the Philippines” and remained legal tender until 30 July 1964.`,
        ),
        noteP(
          `2. ${extLink('https://www.bsp.gov.ph/Pages/CoinsAndNotes/HistoryOfPhilippineMoney/HistoryOfPhilippineMoney.aspx', 'BSP — History of Philippine Money', false)}: the Commonwealth peso was tied to the dollar at 2:1; after sovereignty was recovered, Treasury certificates overprinted “Victory” were used.`,
        ),
        noteP(
          `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0095.htm', 'Bank Note Museum — Philippines P-95', false)}: 2 pesos, Treasury of the Philippines, series 66 (1944), VICTORY overprint; 95a = Auditor General title; 95b = Treasurer.`,
        ),
        noteP(
          `4. ${extLink('https://www.realbanknotes.com/banknote/27184-Philippines-p95a-2-Pesos-from-1944', 'RealBanknotes / Standard Catalog — Pick 95a', false)}: ND (1944); black on blue underprint; Rizal at left; VICTORY SERIES NO. 66 twice instead of a date; blue seal; signatures Osmeña and J. Hernandez; Auditor General title; blue reverse with black VICTORY; USBEP printer, no imprint.`,
        ),
        noteP(
          `5. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0118.htm', 'Bank Note Museum P-118', false)}: ND (1949); red CENTRAL BANK OF THE PHILIPPINES overprint on Pick 95; 118[a] Osmeña–Hernandez not issued; 118b Roxas–Guevara. Not this specimen.`,
        ),
        noteP(
          `6. ${extLink('https://en.numista.com/catalogue/note203356.html', 'Numista — 2 Pesos (Victory)', false)}: 161.9 &times; 67.4 mm; Pick 95a, Osmeña and Hernandez, AUDITOR GENERAL title; print run 16,231,272. Secondary catalog figures.`,
        ),
        noteP(
          `7. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', false)}: BEP delivery table; 2 pesos Rizal, Osmeña–Hernandez, 16,231,272. Not a first-hand BEP document.`,
        ),
        noteP(
          `8. ${extLink('https://www.numismatics.ph/banknotes/victory-series/', 'numismatics.ph — Victory Series No. 66', false)}: attributes “66” to the BEP; Leyte landing on 20 October 1944; series face total ₱1,019,544,000. Secondary source.`,
        ),
      ];

  const relatedTitle = isEs ? 'Sigue explorando' : 'Keep exploring';
  const related = isEs
    ? [
        ['/coleccion/filipinas/', 'Colección de Filipinas'],
        ['/coleccion/filipinas/1-peso-victory-series-66/', '1 Peso Victory Series No. 66'],
        ['/coleccion/veinte-dolares-hawaii-1934/', '$20 Hawaii, 1934 (sobresello de guerra)'],
        ['/glosario/sobresello/', 'Glosario: sobresello'],
      ]
    : [
        ['/en/collection/philippines/', 'Philippines collection'],
        ['/en/collection/philippines/1-peso-victory-series-66/', '1 Peso Victory Series No. 66'],
        ['/en/collection/twenty-dollars-hawaii-1934/', '$20 Hawaii, 1934 (wartime overprint)'],
        ['/en/glossary/overprint/', 'Glossary: overprint'],
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
  title: '2 Pesos Victory 66, Filipinas (Pick 95a) | Notofilia',
  description:
    'Tesoro de Filipinas, 2 pesos Victory Series No. 66 (1944), Pick 95a: Rizal, sello azul y VICTORY. Colección Notofilia.',
  keywords: [
    'filipinas',
    'philippines',
    'victory series 66',
    'victory note',
    'tesorería de filipinas',
    'treasury certificate',
    'jose rizal',
    'pick 95a',
    'pick 118',
    'osmeña',
    'dos pesos',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: '2 Pesos Victory Series 66 — Filipinas (Pick 95a)',
  ogDescription:
    'Certificado del Tesoro de 2 pesos, Victory Series No. 66, serial F13317943. Pick 95a, no 118. Colección Notofilia.',
  ogImage: `${IMG}.jpg`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Filipinas', item: `${SITE}/coleccion/filipinas/` },
          {
            '@type': 'ListItem',
            position: 3,
            name: '2 Pesos Victory Series No. 66',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Tesorería de Filipinas — Dos Pesos, Victory Series No. 66 (Pick 95a)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Certificado del Tesoro de Filipinas de 2 pesos, Victory Series No. 66 (ND 1944), retrato de José Rizal, serial F13317943. Pick 95a.',
        dateCreated: '1944',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/filipinas/#page` },
        identifier: 'NF.filipinas.2-pesos-victory-series-66',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '95a' },
          { '@type': 'PropertyValue', name: 'Serie', value: 'Victory Series No. 66' },
          { '@type': 'PropertyValue', name: 'Número de serie', value: 'F13317943' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'U.S. Bureau of Engraving and Printing' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.filipinas.2-pesos-victory-series-66',
    kind: 'banknote',
    title: 'Dos Pesos Victory Series No. 66',
    subtitle: 'Certificado del Tesoro · Pick 95a · serial F13317943',
    dateOrSeries: 'Victory Series No. 66, ND 1944',
    country: 'Filipinas',
    issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Filipinas', href: '/coleccion/filipinas/' },
      { name: '2 Pesos Victory Series No. 66' },
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
      denomination: '2 pesos',
      currency: 'Peso filipino (Commonwealth)',
      issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
      printer: 'U.S. Bureau of Engraving and Printing (sin pie de imprenta)',
      issueDate: 'ND (1944); Victory Series No. 66',
      series: 'Victory Series No. 66',
      serialNumber: 'F13317943',
      catalogNumber: 'Pick 95a',
      material: 'Papel',
      dimensions: 'Numista: 161,9 × 67,4 mm. Medición propia: no confirmado',
      condition: 'Sin encapsular; grado numérico no confirmado',
      status: 'circulated',
      printRun:
        'Fuentes secundarias que citan entregas BEP: 16.231.272 (2 pesos, Osmeña–Hernandez). Informe BEP original: no confirmado',
      knownVarieties:
        'Pick 95a (esta ficha); Pick 95b (Roxas–Guevara, Treasurer); Pick 95r1/r2 (estrella); Pick 95s (specimen). Pick 118: mismo tipo con sobresello rojo CBP (1949). Otras: no confirmado',
      circulationDates:
        'Leyte, 20 octubre 1944 (BSP). Tipo sin sobresello CBP: 1944–1949. Serie Victory con sobresello CBP de curso legal hasta 30 julio 1964 (BSP).',
      rarityBasis:
        'Tipo común de la serie 66 (Pick 95a). Ejemplar no encapsulado. Población PMG del Pick 95a: no confirmado',
      shownSpecimenState:
        'Sin encapsular, anverso y reverso sobre fondo blanco; serial F13317943; sello y series azules; sobresello negro VICTORY; sin sobresello rojo CBP. Grado numérico: no confirmado',
      factualReviewDate: '2026-08-22',
    },
    render: 'astro-static',
    eyebrow: 'Tesorería de Filipinas · Victory Series No. 66 · 1944',
    resourced: true,
    context: {
      historical:
        'Las fuerzas de liberación llevaron la Victory Series No. 66 en 1944 (BSP). Este ejemplar es el tipo de tesorería sin el sobresello rojo del Banco Central de 1949 (Pick 95a, no Pick 118).',
      design:
        'Anverso en negro sobre fondo azul con Rizal a la izquierda, sello azul de la Commonwealth y series azules F13317943. Reverso azul con sobresello negro VICTORY. Impresor USBEP, sin pie.',
      varieties:
        'Pick 95a (esta ficha), 95b, 95r1/r2, 95s. Pick 118 es el mismo tipo con sobresello rojo CBP de 1949; 118[a] Osmeña–Hernandez no emitido según Bank Note Museum.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (serial F13317943)',
        note: 'Anverso y reverso sobre fondo blanco; sello y series azules; Victory Series No. 66; firmas Osmeña / Auditor General; sobresello negro VICTORY; sin sobresello rojo CBP',
      },
      {
        kind: 'central_bank',
        label: 'Bangko Sentral ng Pilipinas — English Series / demonetized notes',
        url: 'https://www.bsp.gov.ph/SitePages/CoinsAndNotes/EnglishSeries.aspx',
        note: 'Victory Series No. 66 llegada en 1944; sobresello CBP en 1949; curso legal hasta 30 julio 1964',
      },
      {
        kind: 'central_bank',
        label: 'Bangko Sentral ng Pilipinas — History of Philippine Money',
        url: 'https://www.bsp.gov.ph/Pages/CoinsAndNotes/HistoryOfPhilippineMoney/HistoryOfPhilippineMoney.aspx',
        note: 'Peso Commonwealth ligado al dólar 2:1; certificados del Tesoro sobreimpresos Victory',
      },
      {
        kind: 'catalog',
        label: 'Bank Note Museum — Philippines P-95',
        url: 'http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0095.htm',
        note: '2 pesos, Treasury of the Philippines, series 66 (1944), sobresello VICTORY; 95a Auditor General',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes / Standard Catalog of World Paper Money — Pick 95a',
        url: 'https://www.realbanknotes.com/banknote/27184-Philippines-p95a-2-Pesos-from-1944',
        note: 'ND 1944; Rizal; sello azul; Osmeña y J. Hernandez; Auditor General; USBEP sin pie',
      },
      {
        kind: 'catalog',
        label: 'Bank Note Museum — Pick 118 (tipo distinto)',
        url: 'http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0118.htm',
        note: 'Sobresello rojo CBP sobre Pick 95; 118[a] no emitido; no es este ejemplar',
      },
      {
        kind: 'secondary',
        label: 'Numista — 2 Pesos (Victory), N#203356',
        url: 'https://en.numista.com/catalogue/note203356.html',
        note: '161,9 × 67,4 mm; Pick 95a; tirada 16.231.272 citada',
      },
      {
        kind: 'secondary',
        label: 'numismatics.ph — Victory Series No. 66 Treasury Certificate Catalog',
        url: 'https://www.numismatics.ph/banknotes/victory-series/',
        note: 'Atribuye «66» al BEP; Leyte 20 oct 1944; total facial ₱1.019.544.000',
      },
    ],
    related: [
      { href: '/coleccion/filipinas/', title: 'Catálogo de Billetes de Filipinas' },
      { href: '/coleccion/filipinas/1-peso-victory-series-66/', title: '1 Peso Victory Series No. 66' },
      { href: '/coleccion/veinte-dolares-hawaii-1934/', title: '$20 Hawaii, 1934' },
      { href: '/glosario/sobresello/', title: 'Sobresello' },
    ],
  },
  legacyFile: 'billete-filipinas-2-pesos-victory-series-66.dc.html',
  sourceHash: createHash('sha1').update('filipinas-2-pesos-victory-series-66-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '2 Pesos Victory 66, Philippines (Pick 95a) | Notofilia',
      description:
        'Philippine Treasury 2 pesos Victory Series No. 66 (1944), Pick 95a: Rizal, blue seal, VICTORY. Notofilia.',
      ogTitle: '2 Pesos Victory Series 66 — Philippines (Pick 95a)',
      ogDescription:
        'Treasury Certificate of 2 pesos, Victory Series No. 66, serial F13317943. Pick 95a, not 118. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'Two Pesos Victory Series No. 66',
      eyebrow: 'Treasury of the Philippines · Victory Series No. 66 · 1944',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
