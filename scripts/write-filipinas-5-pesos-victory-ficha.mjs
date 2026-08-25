/**
 * Generator for the Philippines Victory Series 66 5 pesos (Pick 96a) ficha.
 * Usage: node scripts/write-filipinas-5-pesos-victory-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/filipinas/5-pesos-victory-series-66/';
const EN_PATH = '/en/collection/philippines/5-pesos-victory-series-66/';
const SLUG = 'philippines-treasury-certificate-5-pesos-victory-series-66-ce93f0dc';
const IMG = `/uploads/${SLUG}`;
const ZOOM_ID = 'filipinas-5-pesos-victory-series-66';
const OUT = path.join(process.cwd(), 'src/content/catalog/filipinas--5-pesos-victory-series-66.json');

const jpgPath = path.join(process.cwd(), `public/uploads/${SLUG}.jpg`);
let IMG_WIDTH = 906;
let IMG_HEIGHT = 878;
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
  'Certificado del Tesoro de Filipinas de 5 pesos, Victory Series No. 66, serial F00618071: anverso con McKinley, Dewey y sello azul (arriba) y reverso ocre con sobresello VICTORY (abajo)';
const ALT_EN =
  'Philippines Treasury Certificate of 5 pesos, Victory Series No. 66, serial F00618071: obverse with McKinley, Dewey and blue seal (top) and ochre reverse with VICTORY overprint (bottom)';

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
    ? 'Filipinas — 5 Pesos Victory Series No. 66'
    : 'Philippines — 5 Pesos Victory Series No. 66';
  const eyebrow = isEs
    ? 'Tesorería de Filipinas &middot; Victory Series No. 66 &middot; 1944'
    : 'Treasury of the Philippines &middot; Victory Series No. 66 &middot; 1944';
  const h1 = isEs ? 'Cinco Pesos Victory Series No. 66' : 'Five Pesos Victory Series No. 66';
  const subtitle = isEs
    ? 'Certificado del Tesoro &middot; Pick 96a &middot; serial F00618071'
    : 'Treasury Certificate &middot; Pick 96a &middot; serial F00618071';
  const alt = isEs ? ALT_ES : ALT_EN;

  const rows = isEs
    ? [
        ['País', 'Filipinas (Commonwealth)'],
        ['Entidad Emisora', 'Tesorería de Filipinas (<em>Treasury of the Philippines</em>)'],
        ['Denominación', '5 pesos (cinco pesos)'],
        [
          'Tipo de Emisión',
          'Treasury Certificate — certificado de depósito pagadero al portador en pesos plata o en curso legal de Estados Unidos de valor equivalente',
        ],
        ['Serie', 'Victory Series No. 66 (sin fecha impresa; ND 1944)'],
        ['Número de Serie', 'F00618071 (tinta azul, repetido)'],
        ['Firmas', 'S. Osmeña (President) y Jaime Hernandez (Auditor General), visibles en el ejemplar'],
        ['Impresor', 'U.S. Bureau of Engraving and Printing (sin pie de imprenta en el ejemplar)'],
        ['Material', 'Papel'],
        [
          'Dimensiones',
          'Numista y numismatics.ph citan 161,9 &times; 67,4 mm.<sup style="font-size:12px;">5,7</sup> Medición propia: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Referencia de Catálogo', 'Pick 96a (tipo sin sobresello del Banco Central)'],
        [
          'Tirada',
          'Fuentes secundarias que citan entregas BEP: 17.355.000 (5 pesos, Osmeña–Hernandez).<sup style="font-size:12px;">5,6,7</sup> Informe BEP original: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Variedades conocidas',
          'Pick 96a (esta ficha); Pick 96r (reposición con estrella); Pick 96s (specimen). No hay firma Roxas en el 5 pesos.<sup style="font-size:12px;">5,6</sup> Pick 119: mismo tipo con sobresello rojo CENTRAL BANK OF THE PHILIPPINES (1949); 119a letra gruesa y 119b letra fina.<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Fechas de circulación',
          'Puesta en circulación con el desembarco en Leyte, 20 de octubre de 1944.<sup style="font-size:12px;">1,8</sup> Tipo sin sobresello CBP: 1944–1949. La serie Victory con sobresello CBP permaneció de curso legal hasta el 30 de julio de 1964.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Base de la rareza',
          'Tipo común de la serie 66 (Pick 96a). El ejemplar no está encapsulado. Población PMG del Pick 96a: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular, anverso y reverso fotografiados sobre fondo blanco; serial F00618071; sello y series azules; reverso ocre con sobresello negro VICTORY; sin sobresello rojo CENTRAL BANK OF THE PHILIPPINES. Grado numérico: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Fecha de última revisión factual', '24 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Philippines (Commonwealth)'],
        ['Issuing Entity', 'Treasury of the Philippines'],
        ['Denomination', '5 pesos (five pesos)'],
        [
          'Type of Issue',
          'Treasury Certificate — deposit certificate payable to bearer in silver pesos or in United States legal tender of equivalent value',
        ],
        ['Series', 'Victory Series No. 66 (no printed date; ND 1944)'],
        ['Serial Number', 'F00618071 (blue ink, repeated)'],
        ['Signatures', 'S. Osmeña (President) and Jaime Hernandez (Auditor General), visible on the specimen'],
        ['Printer', 'U.S. Bureau of Engraving and Printing (no imprint on this specimen)'],
        ['Material', 'Paper'],
        [
          'Dimensions',
          'Numista and numismatics.ph list 161.9 &times; 67.4 mm.<sup style="font-size:12px;">5,7</sup> Own measurement: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Catalog Reference', 'Pick 96a (type without the Central Bank overprint)'],
        [
          'Print Run',
          'Secondary sources citing BEP deliveries: 17,355,000 (5 pesos, Osmeña–Hernandez).<sup style="font-size:12px;">5,6,7</sup> Original BEP report: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Known Varieties',
          'Pick 96a (this record); Pick 96r (star replacement); Pick 96s (specimen). No Roxas signature on the 5 pesos.<sup style="font-size:12px;">5,6</sup> Pick 119: the same type with a red CENTRAL BANK OF THE PHILIPPINES overprint (1949); 119a thick and 119b thin lettering.<sup style="font-size:12px;">4</sup>',
        ],
        [
          'Circulation Dates',
          'Released with the Leyte landing on 20 October 1944.<sup style="font-size:12px;">1,8</sup> Type without CBP overprint: 1944–1949. Victory notes with the CBP overprint remained legal tender until 30 July 1964.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Rarity Basis',
          'Common type within Series 66 (Pick 96a). This specimen is not encapsulated. PMG population for Pick 96a: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Shown Specimen State',
          'Unencapsulated, obverse and reverse photographed on a white background; serial F00618071; blue seal and serials; ochre reverse with black VICTORY overprint; no red CENTRAL BANK OF THE PHILIPPINES overprint. Numeric grade: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Date of Last Factual Review', '24 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const context = isEs
    ? [
        p(
          `<strong style="color:#1c1a15;">Cinco pesos, McKinley y Dewey:</strong> el ejemplar es un certificado del Tesoro de <em>cinco pesos</em>, con William McKinley a la izquierda y el almirante George Dewey a la derecha. La cláusula promete el pago en pesos plata o en curso legal de Estados Unidos de valor equivalente (el peso de la Commonwealth estaba ligado al dólar 2:1).<sup style="font-size:12px;">2</sup> El valor facial impreso es FIVE PESOS.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Pick 96a, no Pick 119:</strong> el Standard Catalog y el Bank Note Museum numeran este tipo —Victory Series No. 66 sin el sobresello rojo del Banco Central— como Pick 96; Numista detalla 96a (circulación), 96r (estrella) y 96s (specimen).<sup style="font-size:12px;">3,5</sup> A diferencia del 2 pesos, no hay firma Roxas en el 5 pesos.<sup style="font-size:12px;">6</sup> Pick 119 es el mismo diseño con sobresello rojo «CENTRAL BANK OF THE PHILIPPINES» aplicado en 1949 sobre existencias del Pick 96 (119a letra gruesa, 119b letra fina).<sup style="font-size:12px;">4</sup> Este ejemplar no lleva ese sobresello rojo.`,
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
          `<strong style="color:#1c1a15;">Five pesos, McKinley and Dewey:</strong> the specimen is a Treasury Certificate for <em>five pesos</em>, with William McKinley at left and Admiral George Dewey at right. The clause promises payment in silver pesos or in United States legal tender of equivalent value (the Commonwealth peso was tied to the dollar at 2:1).<sup style="font-size:12px;">2</sup> The printed face value is FIVE PESOS.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Pick 96a, not Pick 119:</strong> the Standard Catalog and the Bank Note Museum number this type —Victory Series No. 66 without the red Central Bank overprint— as Pick 96; Numista lists 96a (circulation), 96r (star), and 96s (specimen).<sup style="font-size:12px;">3,5</sup> Unlike the 2 pesos, there is no Roxas signature on the 5 pesos.<sup style="font-size:12px;">6</sup> Pick 119 is the same design with a red “CENTRAL BANK OF THE PHILIPPINES” overprint applied in 1949 on remaining Pick 96 stock (119a thick lettering, 119b thin).<sup style="font-size:12px;">4</sup> This specimen does not carry that red overprint.`,
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
          `<strong style="color:#1c1a15;">Retratos:</strong> William McKinley a la izquierda y el almirante George Dewey a la derecha, cada uno en un óvalo con su nombre debajo; «VICTORY SERIES NO. 66» a la izquierda del texto central.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Encabezado:</strong> «TREASURY CERTIFICATE» y la autorización de la legislatura filipina aprobada por el presidente de Estados Unidos el 13 de junio de 1922.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Cláusula:</strong> «THIS CERTIFIES THAT THERE HAVE BEEN DEPOSITED IN THE TREASURY OF THE PHILIPPINES / FIVE PESOS / PAYABLE TO THE BEARER ON DEMAND IN SILVER PESOS OR IN LEGAL TENDER CURRENCY OF THE UNITED STATES OF EQUIVALENT VALUE».`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Sello:</strong> sello azul de la Commonwealth of the Philippines / United States of America, superpuesto al retrato de Dewey.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Series:</strong> F00618071 en tinta azul, repetido; «VICTORY SERIES NO. 66» también en el cuadrante inferior derecho.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Firmas:</strong> S. Osmeña, rotulado President; Jaime Hernandez, rotulado Auditor General.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Reverso:</strong> ocre / oro con «FIVE PESOS», un 5 grande a cada lado y una V romana arriba; sobresello negro «VICTORY» a todo lo ancho. No hay sobresello rojo del Banco Central.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Colorido:</strong> anverso en negro sobre papel claro, con sello y series azules; reverso ocre-dorado.`,
        ),
      ]
    : [
        bullet(
          `<strong style="color:#1c1a15;">Portraits:</strong> William McKinley at left and Admiral George Dewey at right, each in an oval with the name below; “VICTORY SERIES NO. 66” to the left of the central text.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Heading:</strong> “TREASURY CERTIFICATE” and the Philippine legislature authorization approved by the President of the United States on 13 June 1922.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Clause:</strong> “THIS CERTIFIES THAT THERE HAVE BEEN DEPOSITED IN THE TREASURY OF THE PHILIPPINES / FIVE PESOS / PAYABLE TO THE BEARER ON DEMAND IN SILVER PESOS OR IN LEGAL TENDER CURRENCY OF THE UNITED STATES OF EQUIVALENT VALUE”.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Seal:</strong> blue Commonwealth of the Philippines / United States of America seal, overlapping Dewey’s portrait.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Serials:</strong> F00618071 in blue ink, repeated; “VICTORY SERIES NO. 66” also in the lower-right quadrant.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Signatures:</strong> S. Osmeña, titled President; Jaime Hernandez, titled Auditor General.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Reverse:</strong> ochre / gold with “FIVE PESOS”, a large 5 at each side and a Roman V at top; black “VICTORY” overprint across the width. No red Central Bank overprint.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Color:</strong> black face on light paper, with blue seal and serials; ochre-gold reverse.`,
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
          `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0096.htm', 'Bank Note Museum — Philippines P-96', true)}: 5 pesos, Treasury of the Philippines, series 66 (1944), sobresello VICTORY; retratos de McKinley y Dewey.`,
        ),
        noteP(
          `4. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0119.htm', 'Bank Note Museum P-119', true)}: ND (1949); sobresello rojo CENTRAL BANK OF THE PHILIPPINES sobre el Pick 96; 119a letra gruesa y 119b letra fina. No es este ejemplar.`,
        ),
        noteP(
          `5. ${extLink('https://en.numista.com/catalogue/note203362.html', 'Numista — 5 Pesos (Victory)', true)}: 161,9 &times; 67,4 mm; Pick 96a, tirada 17.355.000; también 96r (estrella) y 96s (specimen). Cifras de catálogo secundario.`,
        ),
        noteP(
          `6. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', true)}: tabla de entregas BEP; 5 pesos McKinley y Dewey, Osmeña–Hernandez, 17.355.000. Roxas no aparece en el 1, 5 ni 10 pesos. No es un documento BEP de primera mano.`,
        ),
        noteP(
          `7. ${extLink('https://www.numismatics.ph/banknotes/victory-series/5-pesos-osmena-hernandez.html', 'numismatics.ph — 5 Pesos Osmeña–Hernandez', true)}: 161,9 &times; 67,4 mm; 17.355.000; series F00000001–F22500000; curso legal hasta el 30 de julio de 1964 y canje hasta el 30 de julio de 1967. Fuente secundaria.`,
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
          `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0096.htm', 'Bank Note Museum — Philippines P-96', false)}: 5 pesos, Treasury of the Philippines, series 66 (1944), VICTORY overprint; portraits of McKinley and Dewey.`,
        ),
        noteP(
          `4. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0119.htm', 'Bank Note Museum P-119', false)}: ND (1949); red CENTRAL BANK OF THE PHILIPPINES overprint on Pick 96; 119a thick lettering and 119b thin. Not this specimen.`,
        ),
        noteP(
          `5. ${extLink('https://en.numista.com/catalogue/note203362.html', 'Numista — 5 Pesos (Victory)', false)}: 161.9 &times; 67.4 mm; Pick 96a, print run 17,355,000; also 96r (star) and 96s (specimen). Secondary catalog figures.`,
        ),
        noteP(
          `6. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', false)}: BEP delivery table; 5 pesos McKinley and Dewey, Osmeña–Hernandez, 17,355,000. Roxas does not appear on the 1, 5, or 10 pesos. Not a first-hand BEP document.`,
        ),
        noteP(
          `7. ${extLink('https://www.numismatics.ph/banknotes/victory-series/5-pesos-osmena-hernandez.html', 'numismatics.ph — 5 Pesos Osmeña–Hernandez', false)}: 161.9 &times; 67.4 mm; 17,355,000; serials F00000001–F22500000; legal tender until 30 July 1964 and exchange until 30 July 1967. Secondary source.`,
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
        ['/coleccion/filipinas/2-pesos-victory-series-66/', '2 Pesos Victory Series No. 66'],
        ['/coleccion/veinte-dolares-hawaii-1934/', '$20 Hawaii, 1934 (sobresello de guerra)'],
        ['/glosario/sobresello/', 'Glosario: sobresello'],
      ]
    : [
        ['/en/collection/philippines/', 'Philippines collection'],
        ['/en/collection/philippines/1-peso-victory-series-66/', '1 Peso Victory Series No. 66'],
        ['/en/collection/philippines/2-pesos-victory-series-66/', '2 Pesos Victory Series No. 66'],
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
  title: '5 Pesos Victory 66, Filipinas (Pick 96a) | Notofilia',
  description:
    'Tesoro de Filipinas, 5 pesos Victory Series No. 66 (1944), Pick 96a: McKinley, Dewey y VICTORY. Colección Notofilia.',
  keywords: [
    'filipinas',
    'philippines',
    'victory series 66',
    'victory note',
    'tesorería de filipinas',
    'treasury certificate',
    'mckinley',
    'dewey',
    'pick 96a',
    'pick 119',
    'osmeña',
    'cinco pesos',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: '5 Pesos Victory Series 66 — Filipinas (Pick 96a)',
  ogDescription:
    'Certificado del Tesoro de 5 pesos, Victory Series No. 66, serial F00618071. Pick 96a, no 119. Colección Notofilia.',
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
            name: '5 Pesos Victory Series No. 66',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Tesorería de Filipinas — Cinco Pesos, Victory Series No. 66 (Pick 96a)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Certificado del Tesoro de Filipinas de 5 pesos, Victory Series No. 66 (ND 1944), retratos de McKinley y Dewey, serial F00618071. Pick 96a.',
        dateCreated: '1944',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/filipinas/#page` },
        identifier: 'NF.filipinas.5-pesos-victory-series-66',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '96a' },
          { '@type': 'PropertyValue', name: 'Serie', value: 'Victory Series No. 66' },
          { '@type': 'PropertyValue', name: 'Número de serie', value: 'F00618071' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'U.S. Bureau of Engraving and Printing' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.filipinas.5-pesos-victory-series-66',
    kind: 'banknote',
    title: 'Cinco Pesos Victory Series No. 66',
    subtitle: 'Certificado del Tesoro · Pick 96a · serial F00618071',
    dateOrSeries: 'Victory Series No. 66, ND 1944',
    country: 'Filipinas',
    issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Filipinas', href: '/coleccion/filipinas/' },
      { name: '5 Pesos Victory Series No. 66' },
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
      denomination: '5 pesos',
      currency: 'Peso filipino (Commonwealth)',
      issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
      printer: 'U.S. Bureau of Engraving and Printing (sin pie de imprenta)',
      issueDate: 'ND (1944); Victory Series No. 66',
      series: 'Victory Series No. 66',
      serialNumber: 'F00618071',
      catalogNumber: 'Pick 96a',
      material: 'Papel',
      dimensions: 'Numista: 161,9 × 67,4 mm. Medición propia: no confirmado',
      condition: 'Sin encapsular; grado numérico no confirmado',
      status: 'circulated',
      printRun:
        'Fuentes secundarias que citan entregas BEP: 17.355.000 (5 pesos, Osmeña–Hernandez). Informe BEP original: no confirmado',
      knownVarieties:
        'Pick 96a (esta ficha); Pick 96r (estrella); Pick 96s (specimen). Sin firma Roxas. Pick 119: mismo tipo con sobresello rojo CBP (1949). Otras: no confirmado',
      circulationDates:
        'Leyte, 20 octubre 1944 (BSP). Tipo sin sobresello CBP: 1944–1949. Serie Victory con sobresello CBP de curso legal hasta 30 julio 1964 (BSP).',
      rarityBasis:
        'Tipo común de la serie 66 (Pick 96a). Ejemplar no encapsulado. Población PMG del Pick 96a: no confirmado',
      shownSpecimenState:
        'Sin encapsular, anverso y reverso sobre fondo blanco; serial F00618071; sello y series azules; reverso ocre con sobresello negro VICTORY; sin sobresello rojo CBP. Grado numérico: no confirmado',
      factualReviewDate: '2026-08-24',
    },
    render: 'astro-static',
    eyebrow: 'Tesorería de Filipinas · Victory Series No. 66 · 1944',
    resourced: true,
    context: {
      historical:
        'Las fuerzas de liberación llevaron la Victory Series No. 66 en 1944 (BSP). Este ejemplar es el tipo de tesorería sin el sobresello rojo del Banco Central de 1949 (Pick 96a, no Pick 119).',
      design:
        'Anverso en negro con McKinley a la izquierda y Dewey a la derecha, sello azul de la Commonwealth y series azules F00618071. Reverso ocre con sobresello negro VICTORY. Impresor USBEP, sin pie.',
      varieties:
        'Pick 96a (esta ficha), 96r, 96s. No hay firma Roxas en el 5 pesos. Pick 119 es el mismo tipo con sobresello rojo CBP de 1949 (119a gruesa / 119b fina).',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (serial F00618071)',
        note: 'Anverso y reverso sobre fondo blanco; sello y series azules; Victory Series No. 66; firmas Osmeña / Auditor General; reverso ocre con sobresello negro VICTORY; sin sobresello rojo CBP',
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
        label: 'Bank Note Museum — Philippines P-96',
        url: 'http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0096.htm',
        note: '5 pesos, Treasury of the Philippines, series 66 (1944), sobresello VICTORY; McKinley y Dewey',
      },
      {
        kind: 'catalog',
        label: 'Bank Note Museum — Pick 119 (tipo distinto)',
        url: 'http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0119.htm',
        note: 'Sobresello rojo CBP sobre Pick 96; 119a letra gruesa, 119b letra fina; no es este ejemplar',
      },
      {
        kind: 'secondary',
        label: 'Numista — 5 Pesos (Victory), N#203362',
        url: 'https://en.numista.com/catalogue/note203362.html',
        note: '161,9 × 67,4 mm; Pick 96a; tirada 17.355.000 citada; 96r y 96s',
      },
      {
        kind: 'secondary',
        label: 'Guerrilla Money — Victory Series',
        url: 'https://www.guerrilla-money.com/victory-series/',
        note: 'Entregas BEP 17.355.000; Roxas no aparece en el 5 pesos',
      },
      {
        kind: 'secondary',
        label: 'numismatics.ph — 5 Pesos Osmeña–Hernandez Victory Series',
        url: 'https://www.numismatics.ph/banknotes/victory-series/5-pesos-osmena-hernandez.html',
        note: '161,9 × 67,4 mm; 17.355.000; series F00000001–F22500000',
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
      { href: '/coleccion/filipinas/2-pesos-victory-series-66/', title: '2 Pesos Victory Series No. 66' },
      { href: '/coleccion/veinte-dolares-hawaii-1934/', title: '$20 Hawaii, 1934' },
      { href: '/glosario/sobresello/', title: 'Sobresello' },
    ],
  },
  legacyFile: 'billete-filipinas-5-pesos-victory-series-66.dc.html',
  sourceHash: createHash('sha1').update('filipinas-5-pesos-victory-series-66-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '5 Pesos Victory 66, Philippines (Pick 96a) | Notofilia',
      description:
        'Philippine Treasury 5 pesos Victory Series No. 66 (1944), Pick 96a: McKinley, Dewey, VICTORY. Notofilia.',
      ogTitle: '5 Pesos Victory Series 66 — Philippines (Pick 96a)',
      ogDescription:
        'Treasury Certificate of 5 pesos, Victory Series No. 66, serial F00618071. Pick 96a, not 119. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'Five Pesos Victory Series No. 66',
      eyebrow: 'Treasury of the Philippines · Victory Series No. 66 · 1944',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
