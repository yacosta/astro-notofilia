/**
 * Generator for the Philippines Victory Series 66 1 peso (Pick 94a) ficha.
 * Usage: node scripts/write-filipinas-victory-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/filipinas/1-peso-victory-series-66/';
const EN_PATH = '/en/collection/philippines/1-peso-victory-series-66/';
const SLUG = 'philippines-treasury-certificate-1-peso-victory-series-66-5c220d39';
const IMG = `/uploads/${SLUG}`;
const ZOOM_ID = 'filipinas-1-peso-victory-series-66';
const OUT = path.join(process.cwd(), 'src/content/catalog/filipinas--1-peso-victory-series-66.json');

const jpgPath = path.join(process.cwd(), `public/uploads/${SLUG}.jpg`);
let IMG_WIDTH = 1148;
let IMG_HEIGHT = 1370;
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
  'Certificado del Tesoro de Filipinas de 1 peso, Victory Series No. 66, serial F70618009: anverso con retrato de Mabini y sello azul (arriba) y reverso naranja con sobresello VICTORY (abajo), en fundas transparentes';
const ALT_EN =
  'Philippines Treasury Certificate of 1 peso, Victory Series No. 66, serial F70618009: obverse with Mabini portrait and blue seal (top) and orange reverse with VICTORY overprint (bottom), in clear sleeves';

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
    ? 'Filipinas — 1 Peso Victory Series No. 66'
    : 'Philippines — 1 Peso Victory Series No. 66';
  const eyebrow = isEs
    ? 'Tesorería de Filipinas &middot; Victory Series No. 66 &middot; 1944'
    : 'Treasury of the Philippines &middot; Victory Series No. 66 &middot; 1944';
  const h1 = isEs ? 'Un Peso Victory Series No. 66' : 'One Peso Victory Series No. 66';
  const subtitle = isEs
    ? 'Certificado del Tesoro &middot; Pick 94a &middot; serial F70618009'
    : 'Treasury Certificate &middot; Pick 94a &middot; serial F70618009';
  const alt = isEs ? ALT_ES : ALT_EN;

  const rows = isEs
    ? [
        ['País', 'Filipinas (Commonwealth)'],
        ['Entidad Emisora', 'Tesorería de Filipinas (<em>Treasury of the Philippines</em>)'],
        ['Denominación', '1 peso (un peso)'],
        [
          'Tipo de Emisión',
          'Treasury Certificate — certificado de depósito pagadero al portador en pesos plata o en curso legal de Estados Unidos de valor equivalente',
        ],
        ['Serie', 'Victory Series No. 66 (sin fecha impresa; ND 1944)'],
        ['Número de Serie', 'F70618009 (tinta azul, repetido)'],
        ['Firmas', 'S. Osmeña (President) y J. Hernandez (Secretary of Finance), según el Standard Catalog'],
        ['Impresor', 'U.S. Bureau of Engraving and Printing (sin pie de imprenta en el ejemplar)'],
        ['Material', 'Papel'],
        [
          'Dimensiones',
          'Numista cita 161,9 &times; 67,4 mm.<sup style="font-size:12px;">6</sup> Medición propia: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Referencia de Catálogo', 'Pick 94a (tipo sin sobresello del Banco Central)'],
        [
          'Tirada',
          'Fuentes secundarias que citan entregas BEP: 61.192.000 (1 peso, Osmeña–Hernandez).<sup style="font-size:12px;">6,7</sup> Informe BEP original: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Variedades conocidas',
          'Pick 94a (esta ficha); Pick 94r (reposición con estrella); Pick 94s (specimen). Pick 117a/b/c: mismo tipo con sobresello rojo CENTRAL BANK OF THE PHILIPPINES (1949), grosores grueso/medio/fino.<sup style="font-size:12px;">4,5</sup>',
        ],
        [
          'Fechas de circulación',
          'Puesta en circulación con el desembarco en Leyte, 20 de octubre de 1944.<sup style="font-size:12px;">1,8</sup> Tipo sin sobresello CBP: 1944–1949. La serie Victory con sobresello CBP permaneció de curso legal hasta el 30 de julio de 1964.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Base de la rareza',
          'Tipo común de la serie 66. El ejemplar no está encapsulado. Población PMG del Pick 94a: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular, anverso y reverso en fundas transparentes; serial F70618009; sello y series azules; sobresello negro VICTORY en el reverso; sin sobresello rojo CENTRAL BANK OF THE PHILIPPINES. Grado numérico: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Fecha de última revisión factual', '22 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Philippines (Commonwealth)'],
        ['Issuing Entity', 'Treasury of the Philippines'],
        ['Denomination', '1 peso (one peso)'],
        [
          'Type of Issue',
          'Treasury Certificate — deposit certificate payable to bearer in silver pesos or in United States legal tender of equivalent value',
        ],
        ['Series', 'Victory Series No. 66 (no printed date; ND 1944)'],
        ['Serial Number', 'F70618009 (blue ink, repeated)'],
        ['Signatures', 'S. Osmeña (President) and J. Hernandez (Secretary of Finance), per the Standard Catalog'],
        ['Printer', 'U.S. Bureau of Engraving and Printing (no imprint on this specimen)'],
        ['Material', 'Paper'],
        [
          'Dimensions',
          'Numista lists 161.9 &times; 67.4 mm.<sup style="font-size:12px;">6</sup> Own measurement: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Catalog Reference', 'Pick 94a (type without the Central Bank overprint)'],
        [
          'Print Run',
          'Secondary sources citing BEP deliveries: 61,192,000 (1 peso, Osmeña–Hernandez).<sup style="font-size:12px;">6,7</sup> Original BEP report: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Known Varieties',
          'Pick 94a (this record); Pick 94r (star replacement); Pick 94s (specimen). Pick 117a/b/c: the same type with a red CENTRAL BANK OF THE PHILIPPINES overprint (1949), thick/medium/thin lettering.<sup style="font-size:12px;">4,5</sup>',
        ],
        [
          'Circulation Dates',
          'Released with the Leyte landing on 20 October 1944.<sup style="font-size:12px;">1,8</sup> Type without CBP overprint: 1944–1949. Victory notes with the CBP overprint remained legal tender until 30 July 1964.<sup style="font-size:12px;">1</sup>',
        ],
        [
          'Rarity Basis',
          'Common type within Series 66. This specimen is not encapsulated. PMG population for Pick 94a: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Shown Specimen State',
          'Unencapsulated, obverse and reverse in clear sleeves; serial F70618009; blue seal and serials; black VICTORY overprint on the reverse; no red CENTRAL BANK OF THE PHILIPPINES overprint. Numeric grade: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Date of Last Factual Review', '22 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const context = isEs
    ? [
        p(
          `<strong style="color:#1c1a15;">Un peso, no un dólar:</strong> el ejemplar es un certificado del Tesoro de <em>un peso</em>. Los coleccionistas a veces lo llaman «Victory note» o «Victory dollar» porque la cláusula promete el pago en pesos plata o en curso legal de Estados Unidos de valor equivalente (el peso de la Commonwealth estaba ligado al dólar 2:1).<sup style="font-size:12px;">2</sup> El valor facial impreso es ONE PESO.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Pick 94a, no Pick 117c:</strong> el Standard Catalog y el Bank Note Museum numeran este tipo —Victory Series No. 66 sin el sobresello rojo del Banco Central— como Pick 94a.<sup style="font-size:12px;">3,4</sup> Pick 117c es el mismo diseño con sobresello rojo «CENTRAL BANK OF THE PHILIPPINES» en letra fina, aplicado en 1949 sobre existencias del Pick 94.<sup style="font-size:12px;">5</sup> Este ejemplar no lleva ese sobresello rojo.`,
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
          `<strong style="color:#1c1a15;">One peso, not one dollar:</strong> the specimen is a Treasury Certificate for <em>one peso</em>. Collectors sometimes call it a “Victory note” or “Victory dollar” because the clause promises payment in silver pesos or in United States legal tender of equivalent value (the Commonwealth peso was tied to the dollar at 2:1).<sup style="font-size:12px;">2</sup> The printed face value is ONE PESO.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Pick 94a, not Pick 117c:</strong> the Standard Catalog and the Bank Note Museum number this type —Victory Series No. 66 without the red Central Bank overprint— as Pick 94a.<sup style="font-size:12px;">3,4</sup> Pick 117c is the same design with a thin red “CENTRAL BANK OF THE PHILIPPINES” overprint applied in 1949 on remaining Pick 94 stock.<sup style="font-size:12px;">5</sup> This specimen does not carry that red overprint.`,
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
          `<strong style="color:#1c1a15;">Retrato:</strong> Apolinario Mabini a la izquierda, con la leyenda «MABINI» y «VICTORY SERIES NO. 66» bajo el óvalo.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Cláusula:</strong> «THIS CERTIFIES THAT THERE HAS BEEN DEPOSITED IN THE TREASURY OF THE PHILIPPINES / ONE PESO / PAYABLE TO THE BEARER ON DEMAND IN SILVER PESOS OR IN LEGAL TENDER CURRENCY OF THE UNITED STATES OF EQUIVALENT VALUE».`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Sello:</strong> sello azul de la Commonwealth of the Philippines / United States of America a la derecha.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Series y sello:</strong> F70618009 en tinta azul, repetido; «VICTORY SERIES NO. 66» en el cuadrante superior derecho y bajo el retrato.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Firmas:</strong> S. Osmeña a la izquierda, rotulado President; a la derecha, Secretary of Finance (J. Hernandez según el catálogo).`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Reverso:</strong> naranja con «ONE PESO» y un 1 grande; sobresello negro «VICTORY» a todo lo ancho. No hay sobresello rojo del Banco Central.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Colorido:</strong> anverso en negro sobre papel claro, con sello y series azules; reverso naranja-albaricoque.`,
        ),
      ]
    : [
        bullet(
          `<strong style="color:#1c1a15;">Portrait:</strong> Apolinario Mabini at left, with the captions “MABINI” and “VICTORY SERIES NO. 66” under the oval.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Clause:</strong> “THIS CERTIFIES THAT THERE HAS BEEN DEPOSITED IN THE TREASURY OF THE PHILIPPINES / ONE PESO / PAYABLE TO THE BEARER ON DEMAND IN SILVER PESOS OR IN LEGAL TENDER CURRENCY OF THE UNITED STATES OF EQUIVALENT VALUE”.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Seal:</strong> blue Commonwealth of the Philippines / United States of America seal at right.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Serials and series:</strong> F70618009 in blue ink, repeated; “VICTORY SERIES NO. 66” in the upper-right quadrant and under the portrait.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Signatures:</strong> S. Osmeña at left, titled President; at right, Secretary of Finance (J. Hernandez per the catalog).`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Reverse:</strong> orange with “ONE PESO” and a large 1; black “VICTORY” overprint across the width. No red Central Bank overprint.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Color:</strong> black face on light paper, with blue seal and serials; apricot-orange reverse.`,
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
          `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0094.htm', 'Bank Note Museum — Philippines P-94', true)}: 1 peso, Treasury of the Philippines, series 66 (1944), sobresello VICTORY en el reverso.`,
        ),
        noteP(
          `4. ${extLink('https://www.realbanknotes.com/banknote/27183-Philippines-p94a-1-Peso-from-1944', 'RealBanknotes / Standard Catalog — Pick 94a', true)}: ND (1944); negro sobre fondo naranja; Mabini a la izquierda; VICTORY SERIES NO. 66 dos veces en lugar de fecha; sello azul; firmas Osmeña y J. Hernandez; reverso naranja con VICTORY en negro; impresor USBEP sin pie.`,
        ),
        noteP(
          `5. ${extLink('https://www.realbanknotes.com/banknote/27243-Philippines-p117c-1-Peso-from-1949', 'RealBanknotes — Pick 117c', true)} y ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0117.htm', 'Bank Note Museum P-117', true)}: ND (1949); sobresello rojo CENTRAL BANK OF THE PHILIPPINES sobre el Pick 94; 117c = letra fina. No es este ejemplar.`,
        ),
        noteP(
          `6. ${extLink('https://en.numista.com/catalogue/note201642.html', 'Numista — 1 Peso (Victory)', true)}: 161,9 &times; 67,4 mm; desmonetizado el 30 de julio de 1967 en esa ficha; Pick 94a, firmas Osmeña y Hernandez; tirada 61.192.000. Cifras de catálogo secundario.`,
        ),
        noteP(
          `7. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', true)}: tabla de entregas BEP; 1 peso Mabini, Osmeña–Hernandez, 61.192.000. No es un documento BEP de primera mano.`,
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
          `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0094.htm', 'Bank Note Museum — Philippines P-94', false)}: 1 peso, Treasury of the Philippines, series 66 (1944), VICTORY overprint on the reverse.`,
        ),
        noteP(
          `4. ${extLink('https://www.realbanknotes.com/banknote/27183-Philippines-p94a-1-Peso-from-1944', 'RealBanknotes / Standard Catalog — Pick 94a', false)}: ND (1944); black on orange underprint; Mabini at left; VICTORY SERIES NO. 66 twice instead of a date; blue seal; signatures Osmeña and J. Hernandez; orange reverse with black VICTORY; USBEP printer, no imprint.`,
        ),
        noteP(
          `5. ${extLink('https://www.realbanknotes.com/banknote/27243-Philippines-p117c-1-Peso-from-1949', 'RealBanknotes — Pick 117c', false)} and ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0117.htm', 'Bank Note Museum P-117', false)}: ND (1949); red CENTRAL BANK OF THE PHILIPPINES overprint on Pick 94; 117c = thin lettering. Not this specimen.`,
        ),
        noteP(
          `6. ${extLink('https://en.numista.com/catalogue/note201642.html', 'Numista — 1 Peso (Victory)', false)}: 161.9 &times; 67.4 mm; that record lists demonetization on 30 July 1967; Pick 94a, Osmeña and Hernandez; print run 61,192,000. Secondary catalog figures.`,
        ),
        noteP(
          `7. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', false)}: BEP delivery table; 1 peso Mabini, Osmeña–Hernandez, 61,192,000. Not a first-hand BEP document.`,
        ),
        noteP(
          `8. ${extLink('https://www.numismatics.ph/banknotes/victory-series/', 'numismatics.ph — Victory Series No. 66', false)}: attributes “66” to the BEP; Leyte landing on 20 October 1944; series face total ₱1,019,544,000. Secondary source.`,
        ),
      ];

  const relatedTitle = isEs ? 'Sigue explorando' : 'Keep exploring';
  const related = isEs
    ? [
        ['/coleccion/filipinas/', 'Colección de Filipinas'],
        ['/coleccion/veinte-dolares-hawaii-1934/', '$20 Hawaii, 1934 (sobresello de guerra)'],
        ['/glosario/sobresello/', 'Glosario: sobresello'],
        ['/glosario/pick/', 'Glosario: Pick number'],
      ]
    : [
        ['/en/collection/philippines/', 'Philippines collection'],
        ['/en/collection/twenty-dollars-hawaii-1934/', '$20 Hawaii, 1934 (wartime overprint)'],
        ['/en/glossary/overprint/', 'Glossary: overprint'],
        ['/en/glossary/pick-number/', 'Glossary: Pick number'],
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
  title: '1 Peso Victory 66, Filipinas (Pick 94a) | Notofilia',
  description:
    'Tesoro de Filipinas, 1 peso Victory Series No. 66 (1944), Pick 94a: Mabini, sello azul y VICTORY. Colección Notofilia.',
  keywords: [
    'filipinas',
    'philippines',
    'victory series 66',
    'victory note',
    'tesorería de filipinas',
    'treasury certificate',
    'apolinario mabini',
    'pick 94a',
    'pick 117c',
    'osmeña',
    'un peso',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: '1 Peso Victory Series 66 — Filipinas (Pick 94a)',
  ogDescription:
    'Certificado del Tesoro de 1 peso, Victory Series No. 66, serial F70618009. Pick 94a, no 117c. Colección Notofilia.',
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
            name: '1 Peso Victory Series No. 66',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Tesorería de Filipinas — Un Peso, Victory Series No. 66 (Pick 94a)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Certificado del Tesoro de Filipinas de 1 peso, Victory Series No. 66 (ND 1944), retrato de Apolinario Mabini, serial F70618009. Pick 94a.',
        dateCreated: '1944',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/filipinas/#page` },
        identifier: 'NF.filipinas.1-peso-victory-series-66',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '94a' },
          { '@type': 'PropertyValue', name: 'Serie', value: 'Victory Series No. 66' },
          { '@type': 'PropertyValue', name: 'Número de serie', value: 'F70618009' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'U.S. Bureau of Engraving and Printing' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.filipinas.1-peso-victory-series-66',
    kind: 'banknote',
    title: 'Un Peso Victory Series No. 66',
    subtitle: 'Certificado del Tesoro · Pick 94a · serial F70618009',
    dateOrSeries: 'Victory Series No. 66, ND 1944',
    country: 'Filipinas',
    issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Filipinas', href: '/coleccion/filipinas/' },
      { name: '1 Peso Victory Series No. 66' },
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
      denomination: '1 peso',
      currency: 'Peso filipino (Commonwealth)',
      issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
      printer: 'U.S. Bureau of Engraving and Printing (sin pie de imprenta)',
      issueDate: 'ND (1944); Victory Series No. 66',
      series: 'Victory Series No. 66',
      serialNumber: 'F70618009',
      catalogNumber: 'Pick 94a',
      material: 'Papel',
      dimensions: 'Numista: 161,9 × 67,4 mm. Medición propia: no confirmado',
      condition: 'Sin encapsular; grado numérico no confirmado',
      status: 'circulated',
      printRun:
        'Fuentes secundarias que citan entregas BEP: 61.192.000 (1 peso, Osmeña–Hernandez). Informe BEP original: no confirmado',
      knownVarieties:
        'Pick 94a (esta ficha); Pick 94r (estrella); Pick 94s (specimen). Pick 117a/b/c: mismo tipo con sobresello rojo CBP (1949). Otras: no confirmado',
      circulationDates:
        'Leyte, 20 octubre 1944 (BSP). Tipo sin sobresello CBP: 1944–1949. Serie Victory con sobresello CBP de curso legal hasta 30 julio 1964 (BSP).',
      rarityBasis:
        'Tipo común de la serie 66. Ejemplar no encapsulado. Población PMG del Pick 94a: no confirmado',
      shownSpecimenState:
        'Sin encapsular, anverso y reverso en fundas transparentes; serial F70618009; sello y series azules; sobresello negro VICTORY; sin sobresello rojo CBP. Grado numérico: no confirmado',
      factualReviewDate: '2026-08-22',
    },
    render: 'astro-static',
    eyebrow: 'Tesorería de Filipinas · Victory Series No. 66 · 1944',
    resourced: true,
    context: {
      historical:
        'Las fuerzas de liberación llevaron la Victory Series No. 66 en 1944 (BSP). Este ejemplar es el tipo de tesorería sin el sobresello rojo del Banco Central de 1949 (Pick 94a, no Pick 117c).',
      design:
        'Anverso en negro con Mabini a la izquierda, sello azul de la Commonwealth y series azules F70618009. Reverso naranja con sobresello negro VICTORY. Impresor USBEP, sin pie.',
      varieties:
        'Pick 94a (esta ficha), 94r, 94s. Pick 117a/b/c es el mismo tipo con sobresello rojo CBP de 1949. Otras firmas de la serie 66 no constan en el 1 peso sin CBP.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (serial F70618009)',
        note: 'Anverso y reverso en fundas; sello y series azules; Victory Series No. 66; firmas Osmeña / Secretary of Finance; sobresello negro VICTORY; sin sobresello rojo CBP',
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
        label: 'Bank Note Museum — Philippines P-94',
        url: 'http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0094.htm',
        note: '1 peso, Treasury of the Philippines, series 66 (1944), sobresello VICTORY',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes / Standard Catalog of World Paper Money — Pick 94a',
        url: 'https://www.realbanknotes.com/banknote/27183-Philippines-p94a-1-Peso-from-1944',
        note: 'ND 1944; Mabini; sello azul; Osmeña y J. Hernandez; USBEP sin pie',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes / Bank Note Museum — Pick 117c (tipo distinto)',
        url: 'https://www.realbanknotes.com/banknote/27243-Philippines-p117c-1-Peso-from-1949',
        note: 'Sobresello rojo CBP en letra fina sobre Pick 94; no es este ejemplar',
      },
      {
        kind: 'secondary',
        label: 'Numista — 1 Peso (Victory), N#201642',
        url: 'https://en.numista.com/catalogue/note201642.html',
        note: '161,9 × 67,4 mm; Pick 94a; tirada 61.192.000 citada',
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
      { href: '/coleccion/veinte-dolares-hawaii-1934/', title: '$20 Hawaii, 1934' },
      { href: '/glosario/sobresello/', title: 'Sobresello' },
      { href: '/glosario/pick/', title: 'Pick number' },
    ],
  },
  legacyFile: 'billete-filipinas-1-peso-victory-series-66.dc.html',
  sourceHash: createHash('sha1').update('filipinas-1-peso-victory-series-66-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '1 Peso Victory 66, Philippines (Pick 94a) | Notofilia',
      description:
        'Philippine Treasury 1 peso Victory Series No. 66 (1944), Pick 94a: Mabini, blue seal, VICTORY overprint. Notofilia.',
      ogTitle: '1 Peso Victory Series 66 — Philippines (Pick 94a)',
      ogDescription:
        'Treasury Certificate of 1 peso, Victory Series No. 66, serial F70618009. Pick 94a, not 117c. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'One Peso Victory Series No. 66',
      eyebrow: 'Treasury of the Philippines · Victory Series No. 66 · 1944',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
