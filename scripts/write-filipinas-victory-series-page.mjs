/**
 * Combined Philippines Treasury Victory Series page (1 peso + 2 pesos).
 * Usage: node scripts/write-filipinas-victory-series-page.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/filipinas/tesoreria-victory-series/';
const EN_PATH = '/en/collection/philippines/treasury-victory-series/';
const OUT = path.join(process.cwd(), 'src/content/catalog/filipinas--tesoreria-victory-series.json');

const NOTES = [
  {
    id: '1-peso',
    slug: 'philippines-treasury-certificate-1-peso-victory-series-66-5c220d39',
    zoomId: 'filipinas-victory-series-1-peso',
    width: 1148,
    height: 1370,
    esHref: '/coleccion/filipinas/1-peso-victory-series-66/',
    enHref: '/en/collection/philippines/1-peso-victory-series-66/',
    headingEs: 'Un Peso Victory Series No. 66',
    headingEn: 'One Peso Victory Series No. 66',
    subEs: 'Pick 94a &middot; serial F70618009 &middot; Mabini',
    subEn: 'Pick 94a &middot; serial F70618009 &middot; Mabini',
    altEs:
      'Certificado del Tesoro de Filipinas de 1 peso, Victory Series No. 66, serial F70618009: anverso con retrato de Mabini y sello azul (arriba) y reverso naranja con sobresello VICTORY (abajo), en fundas transparentes',
    altEn:
      'Philippines Treasury Certificate of 1 peso, Victory Series No. 66, serial F70618009: obverse with Mabini portrait and blue seal (top) and orange reverse with VICTORY overprint (bottom), in clear sleeves',
    enlargeEs: 'Ampliar imagen del billete de 1 peso',
    enlargeEn: 'Enlarge image of the 1-peso banknote',
    fichaEs: 'Ver ficha completa del 1 peso (Pick 94a)',
    fichaEn: 'View the full 1-peso record (Pick 94a)',
    eager: true,
  },
  {
    id: '2-pesos',
    slug: 'philippines-treasury-certificate-2-pesos-victory-series-66-cc5b2834',
    zoomId: 'filipinas-victory-series-2-pesos',
    width: 1024,
    height: 1536,
    esHref: '/coleccion/filipinas/2-pesos-victory-series-66/',
    enHref: '/en/collection/philippines/2-pesos-victory-series-66/',
    headingEs: 'Dos Pesos Victory Series No. 66',
    headingEn: 'Two Pesos Victory Series No. 66',
    subEs: 'Pick 95a &middot; serial F13317943 &middot; Rizal',
    subEn: 'Pick 95a &middot; serial F13317943 &middot; Rizal',
    altEs:
      'Certificado del Tesoro de Filipinas de 2 pesos, Victory Series No. 66, serial F13317943: anverso con retrato de Rizal y sello azul (arriba) y reverso azul con sobresello VICTORY (abajo)',
    altEn:
      'Philippines Treasury Certificate of 2 pesos, Victory Series No. 66, serial F13317943: obverse with Rizal portrait and blue seal (top) and blue reverse with VICTORY overprint (bottom)',
    enlargeEs: 'Ampliar imagen del billete de 2 pesos',
    enlargeEn: 'Enlarge image of the 2-peso banknote',
    fichaEs: 'Ver ficha completa del 2 pesos (Pick 95a)',
    fichaEn: 'View the full 2-peso record (Pick 95a)',
    eager: false,
  },
];

for (const note of NOTES) {
  const jpgPath = path.join(process.cwd(), `public/uploads/${note.slug}.jpg`);
  if (existsSync(jpgPath)) {
    const meta = await sharp(jpgPath).metadata();
    if (meta.width && meta.height) {
      note.width = meta.width;
      note.height = meta.height;
    }
  }
}

const styles =
  "body { margin: 0; }\n    a { color: #6b521f; text-decoration: underline; text-decoration-color: rgba(138,109,59,0.35); }\n    a:hover { color: #5c4826; }\n    a:focus-visible { outline: 2px solid #6b521f; outline-offset: 3px; }\n    button:focus-visible { outline: 2px solid #6b521f; outline-offset: 3px; }\n    ::selection { background: rgba(138,109,59,0.25); }";

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

function h2(text) {
  return `<h2 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${text}</h2>`;
}

function p(text) {
  return `<p style="font-size:19px; line-height:1.65; color:#332e22; margin:0 0 12px;">${text}</p>`;
}

function noteP(text) {
  return `<p style="font-size:14px; line-height:1.6; color:#5c4e33; margin:0 0 6px;">${text}</p>`;
}

function bullet(text) {
  return `<li style="display:flex; gap:12px; align-items:baseline;">
                <span style="width:6px; height:6px; min-width:6px; background:#5c4e33; transform:rotate(45deg); position:relative; top:-3px;"></span>
                <span style="font-size:19px; line-height:1.6; color:#332e22;">${text}</span>
              </li>`;
}

function pictureBlock(lang, note) {
  const isEs = lang === 'es';
  const enlarge = isEs ? 'Ampliar' : 'Enlarge';
  const caption = isEs
    ? 'Anverso (arriba) y reverso (abajo) — Colección de Notofilia.com'
    : 'Obverse (top) and reverse (bottom) — Notofilia.com Collection';
  const img = `/uploads/${note.slug}`;
  const loading = note.eager ? 'eager' : 'lazy';
  const fetch = note.eager ? '\n                fetchpriority="high"' : '';
  return `<button
            data-zoom-trigger="${note.zoomId}"
            aria-label="${isEs ? note.enlargeEs : note.enlargeEn}"
            style="all:unset; display:block; width:100%; position:relative; cursor:zoom-in;"
          >
            <picture>
              <source srcset="${img}-640.webp 640w, ${img}.webp ${note.width}w" sizes="(max-width: 640px) 100vw, 760px" type="image/webp" />
              <img
                src="${img}.jpg"
                alt="${(isEs ? note.altEs : note.altEn).replace(/"/g, '&quot;')}"
                width="${note.width}"
                height="${note.height}"
                loading="${loading}"${fetch}
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

function zoomDialog(lang, note) {
  const isEs = lang === 'es';
  const close = isEs ? 'Cerrar' : 'Close';
  const zoomOut = isEs ? 'Alejar' : 'Zoom out';
  const zoomIn = isEs ? 'Acercar' : 'Zoom in';
  const hint = isEs
    ? 'Arrastra para mover &middot; Rueda del ratón para ampliar'
    : 'Drag to move &middot; Mouse wheel to zoom';
  const dialogLabel = isEs ? note.enlargeEs.replace(/^Ampliar /, '') : note.enlargeEn.replace(/^Enlarge /, '');
  const img = `/uploads/${note.slug}`;
  const alt = (isEs ? note.altEs : note.altEn).replace(/"/g, '&quot;');
  return `<div
              role="dialog"
              aria-modal="true"
              aria-label="${dialogLabel}"
              data-zoom-dialog="${note.zoomId}" hidden
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
                  <source srcset="${img}.webp" type="image/webp" />
                  <img
                    src="${img}.jpg"
                    alt="${alt}"
                    width="${note.width}"
                    height="${note.height}"
                    draggable="false"
                    data-zoom-image
                    style="display:block; max-width:100vw; max-height:100vh; width:100vw; height:100vh; object-fit:contain; cursor:zoom-in; user-select:none;"
                  />
                </picture>
              </div>
              <span style="position:absolute; bottom:16px; left:50%; transform:translateX(-50%); font-size:14px; letter-spacing:0.06em; color:#b7ab8a; font-style:italic; pointer-events:none;">${hint}</span>
            </div>`;
}

function noteSection(lang, note) {
  const isEs = lang === 'es';
  const href = isEs ? note.esHref : note.enHref;
  const heading = isEs ? note.headingEs : note.headingEn;
  const sub = isEs ? note.subEs : note.subEn;
  const ficha = isEs ? note.fichaEs : note.fichaEn;
  const top = note.eager ? '0' : '48px';
  return `<section id="${note.id}" style="width:100%; max-width:760px; margin:${top} auto 0;">
          <h2 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(22px,2.6vw,28px); color:#1c1a15; margin:0 0 4px; text-align:center;">${heading}</h2>
          <p style="font-size:17px; font-style:italic; color:#4a4331; margin:0 0 20px; text-align:center;">${sub}</p>
          <div style="display:flex; flex-direction:column; gap:14px;">
            ${pictureBlock(lang, note)}
            ${zoomDialog(lang, note)}
            <p style="font-size:17px; line-height:1.55; color:#332e22; margin:4px 0 0; text-align:center;"><a href="${href}" style="color:#6b521f;">${ficha}</a></p>
          </div>
        </section>`;
}

function buildTemplate(lang) {
  const isEs = lang === 'es';
  const pageUrl = isEs ? ES_PATH : EN_PATH;
  const hubHref = isEs ? '/coleccion/filipinas/' : '/en/collection/philippines/';
  const hubLabel = isEs ? '&larr; Catálogo de Filipinas' : '&larr; Philippines catalog';
  const screen = isEs
    ? 'Tesorería de Filipinas — Victory Series'
    : 'Treasury of the Philippines — Victory Series';
  const eyebrow = isEs
    ? 'Commonwealth de Filipinas &middot; 1944'
    : 'Commonwealth of the Philippines &middot; 1944';
  const h1 = isEs ? 'Tesorería de Filipinas · Victory Series' : 'Treasury of the Philippines · Victory Series';
  const subtitle = isEs
    ? 'Certificados del Tesoro &middot; Series No. 66 &middot; Pick 94a y 95a'
    : 'Treasury Certificates &middot; Series No. 66 &middot; Pick 94a and 95a';

  const intro = isEs
    ? p(
        'Los certificados del Tesoro Victory Series No. 66 marcan, en papel, la liberación de Filipinas de la ocupación japonesa: el Bangko Sentral ng Pilipinas registra que las fuerzas de liberación estadounidenses llevaron esa serie en 1944, y que esos certificados sobreimpresos con la palabra Victory fueron el papel usado al recuperar la soberanía.<sup style="font-size:12px;">1,2</sup>',
      )
    : p(
        'Victory Series No. 66 Treasury Certificates mark, on paper, the liberation of the Philippines from Japanese occupation: Bangko Sentral ng Pilipinas records that American liberation forces brought the series in 1944, and that those certificates overprinted with the word Victory were the paper used when sovereignty was recovered.<sup style="font-size:12px;">1,2</sup>',
      );

  const origin = isEs
    ? `<section style="margin-top:36px;">
            ${h2('El origen de la serie «66»')}
            ${p('Los certificados se imprimieron en 1944 en el Bureau of Engraving and Printing de Estados Unidos, sin fecha en el anverso: en su lugar aparece dos veces la leyenda «VICTORY SERIES NO. 66». Son el último papel moneda filipino producido bajo administración estadounidense.<sup style="font-size:12px;">1,4,8</sup>')}
            ${p('<strong style="color:#1c1a15;">Qué significa el 66:</strong> sitios notafílicos filipinos atribuyen a un informe del BEP la elección del número 66 como la edad de Manuel L. Quezon, presidente de la Commonwealth, al morir de tuberculosis el 1 de agosto de 1944, semanas antes del desembarco. Quezon nació el 19 de agosto de 1878 y tenía 65 años; la cifra 66 no coincide con esa edad. El informe BEP no se cita aquí de primera mano.<sup style="font-size:12px;">8,9</sup>')}
          </section>`
    : `<section style="margin-top:36px;">
            ${h2('The origin of Series “66”')}
            ${p('The certificates were printed in 1944 at the United States Bureau of Engraving and Printing, with no date on the face: the legend “VICTORY SERIES NO. 66” appears twice instead. They were the last Philippine paper money produced under United States administration.<sup style="font-size:12px;">1,4,8</sup>')}
            ${p('<strong style="color:#1c1a15;">What 66 means:</strong> Philippine notaphily sites attribute to a BEP report the choice of 66 as the age of Manuel L. Quezon, president of the Commonwealth, at his death from tuberculosis on 1 August 1944, weeks before the landing. Quezon was born on 19 August 1878 and was 65; the figure 66 does not match that age. The BEP report is not cited here at first hand.<sup style="font-size:12px;">8,9</sup>')}
          </section>`;

  const leyte = isEs
    ? `<section style="margin-top:36px;">
            ${h2('El desembarco en Leyte')}
            ${p('Durante la ocupación, el gobierno japonés impuso certificados militares de curso forzoso (el llamado «dinero de invasión»), sin respaldo metálico, que acabaron en hiperinflación. En paralelo, gobiernos locales y combatientes de la resistencia imprimieron «pesos de guerrilla» o notas de emergencia —papel tosco, a menudo prohibido bajo pena grave— para sostener la economía en zonas no controladas por Tokio.<sup style="font-size:12px;">10,11</sup>')}
            ${p('Cuando el general Douglas MacArthur desembarcó en la isla de Leyte el 20 de octubre de 1944, las fuerzas aliadas llevaron cajas de certificados Victory Series No. 66 para sustituir de inmediato el papel japonés y restablecer el peso de la Commonwealth (ligado al dólar 2:1). Fuentes secundarias recogen que MacArthur llevaba algunos de esos billetes recién impresos encima; el dato no está documentado aquí en un parte oficial.<sup style="font-size:12px;">1,2,7,9</sup>')}
          </section>`
    : `<section style="margin-top:36px;">
            ${h2('The Leyte landing')}
            ${p('During the occupation the Japanese government forced the use of military certificates (“invasion money”), unbacked fiat that ended in hyperinflation. In parallel, local governments and resistance fighters printed “guerrilla pesos” or emergency notes —crude paper, often banned under severe penalty— to sustain the economy outside Tokyo’s control.<sup style="font-size:12px;">10,11</sup>')}
            ${p('When General Douglas MacArthur waded ashore at Leyte Island on 20 October 1944, Allied forces brought crates of Victory Series No. 66 certificates to replace Japanese paper at once and restore the Commonwealth peso (tied to the dollar at 2:1). Secondary sources report that MacArthur carried some of the freshly printed notes on his person; that detail is not documented here in an official dispatch.<sup style="font-size:12px;">1,2,7,9</sup>')}
          </section>`;

  const catalog = isEs
    ? `<section style="margin-top:36px;">
            ${h2('Detalles clave para el catálogo')}
            <ul style="list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px;">
              ${bullet('<strong style="color:#1c1a15;">Diseño y sobresello:</strong> el anverso sigue el tipo de certificado del Tesoro anterior a la guerra, con el sello azul de la Commonwealth of the Philippines / United States of America. La marca de la serie es el sobresello negro «VICTORY» a todo lo ancho del reverso.<sup style="font-size:12px;">3,4</sup>')}
              ${bullet('<strong style="color:#1c1a15;">Sobresellos CBP de 1949:</strong> tras la independencia (1946) y la creación del Banco Central (1949), las existencias de la serie Victory se sobreimprimieron en rojo «CENTRAL BANK OF THE PHILIPPINES» mientras se esperaba la English Series (impresa por Thomas de la Rue; el BSP sitúa esa serie propia a partir de 1949/1951). Los tipos con sobresello CBP siguieron de curso legal hasta el 30 de julio de 1964.<sup style="font-size:12px;">1,10</sup>')}
              ${bullet('<strong style="color:#1c1a15;">Rareza y variedades:</strong> el 1 peso (Mabini, Osmeña–Hernandez) es el más abundante: fuentes secundarias que citan entregas BEP dan 61.192.000 ejemplares. En el otro extremo, el 500 pesos con Miguel López de Legazpi y firmas Osmeña–Hernandez se cita con 12.991 entregas. Los sobresellos CBP de 1949 suelen ser más escasos que los tipos de 1944 sin ese rojo. Informe BEP original: <span style="font-style:italic;">no confirmado</span>.<sup style="font-size:12px;">6,7,12</sup>')}
            </ul>
          </section>`
    : `<section style="margin-top:36px;">
            ${h2('Key details for the catalog')}
            <ul style="list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px;">
              ${bullet('<strong style="color:#1c1a15;">Design and overprint:</strong> the face follows the pre-war Treasury Certificate type, with the blue Commonwealth of the Philippines / United States of America seal. The series marker is the black “VICTORY” overprint across the reverse.<sup style="font-size:12px;">3,4</sup>')}
              ${bullet('<strong style="color:#1c1a15;">1949 CBP overprints:</strong> after independence (1946) and the creation of the Central Bank (1949), remaining Victory stock was overprinted in red “CENTRAL BANK OF THE PHILIPPINES” while the English Series (printed by Thomas de la Rue; BSP dates that own series from 1949/1951) was awaited. CBP-overprinted types remained legal tender until 30 July 1964.<sup style="font-size:12px;">1,10</sup>')}
              ${bullet('<strong style="color:#1c1a15;">Rarity and varieties:</strong> the 1-peso note (Mabini, Osmeña–Hernandez) is the most abundant: secondary sources citing BEP deliveries give 61,192,000 pieces. At the other end, the 500-peso note with Miguel López de Legazpi and Osmeña–Hernandez signatures is cited at 12,991 deliveries. The 1949 CBP overprints are generally scarcer than the 1944 types without that red overprint. Original BEP report: <span style="font-style:italic;">unconfirmed</span>.<sup style="font-size:12px;">6,7,12</sup>')}
            </ul>
          </section>`;

  const seriesMeta = isEs
    ? [
        ['País', 'Filipinas (Commonwealth)'],
        ['Entidad Emisora', 'Tesorería de Filipinas (<em>Treasury of the Philippines</em>)'],
        ['Tipo de Emisión', 'Treasury Certificates — Victory Series No. 66 (ND 1944)'],
        ['Impresor', 'U.S. Bureau of Engraving and Printing (sin pie de imprenta en estos ejemplares)'],
        ['Ejemplares en esta página', '1 peso Pick 94a (F70618009) y 2 pesos Pick 95a (F13317943), ambos sin sobresello rojo CBP'],
        ['Tirada', 'Fuentes secundarias (entregas BEP): 61.192.000 (1 peso Osmeña–Hernandez); 16.231.272 (2 pesos Osmeña–Hernandez); 12.991 (500 pesos Osmeña–Hernandez). Informe BEP original: <span style="font-style:italic;">no confirmado</span>'],
        [
          'Variedades conocidas',
          'Sin CBP: Pick 94 (1 peso), 95 (2 pesos) y denominaciones 5–500. Con sobresello rojo CBP (1949): Pick 117–123. Otras: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Fechas de circulación',
          'Leyte, 20 octubre 1944 (BSP). Tipo sin sobresello CBP: 1944–1949. Con sobresello CBP: curso legal hasta 30 julio 1964 (BSP).',
        ],
        [
          'Base de la rareza',
          'Los 1 y 2 pesos sin CBP son tipos comunes de la serie 66. El 500 pesos Osmeña–Hernandez es el extremo citado. Población PMG de estos ejemplares: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Estado del ejemplar mostrado',
          'Dos certificados de la colección Notofilia, sin encapsular y sin sobresello rojo CBP. Grado numérico: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Fecha de última revisión factual', '23 de agosto de 2026'],
      ]
    : [
        ['Country', 'Philippines (Commonwealth)'],
        ['Issuing Entity', 'Treasury of the Philippines'],
        ['Type of Issue', 'Treasury Certificates — Victory Series No. 66 (ND 1944)'],
        ['Printer', 'U.S. Bureau of Engraving and Printing (no imprint on these specimens)'],
        ['Specimens on this page', '1 peso Pick 94a (F70618009) and 2 pesos Pick 95a (F13317943), both without the red CBP overprint'],
        ['Print Run', 'Secondary sources (BEP deliveries): 61,192,000 (1 peso Osmeña–Hernandez); 16,231,272 (2 pesos Osmeña–Hernandez); 12,991 (500 pesos Osmeña–Hernandez). Original BEP report: <span style="font-style:italic;">unconfirmed</span>'],
        [
          'Known Varieties',
          'Without CBP: Pick 94 (1 peso), 95 (2 pesos), and denominations 5–500. With red CBP overprint (1949): Pick 117–123. Other: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Circulation Dates',
          'Leyte, 20 October 1944 (BSP). Type without CBP overprint: 1944–1949. With CBP overprint: legal tender until 30 July 1964 (BSP).',
        ],
        [
          'Rarity Basis',
          'The 1- and 2-peso notes without CBP are common types within Series 66. The 500-peso Osmeña–Hernandez is the cited extreme. PMG population for these specimens: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Shown Specimen State',
          'Two Treasury Certificates from the Notofilia collection, unencapsulated and without the red CBP overprint. Numeric grade: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Date of Last Factual Review', '23 August 2026'],
      ];

  const notesHeading = isEs ? 'Notas' : 'Notes';
  const notes = isEs
    ? [
        `1. ${extLink('https://www.bsp.gov.ph/SitePages/CoinsAndNotes/EnglishSeries.aspx', 'Bangko Sentral ng Pilipinas — English Series / demonetized notes', true)}: las fuerzas de liberación llevaron la Victory Series No. 66 en 1944; con el Banco Central (1949) esas denominaciones se sobreimprimieron «Central Bank of the Philippines» y siguieron de curso legal hasta el 30 de julio de 1964.`,
        `2. ${extLink('https://www.bsp.gov.ph/Pages/CoinsAndNotes/HistoryOfPhilippineMoney/HistoryOfPhilippineMoney.aspx', 'BSP — History of Philippine Money', true)}: el peso de la Commonwealth se ligó al dólar 2:1; al recuperar la soberanía se usaron certificados del Tesoro sobreimpresos con «Victory».`,
        `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0094.htm', 'Bank Note Museum — Philippines P-94', true)} y ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0095.htm', 'P-95', true)}: 1 y 2 pesos, Treasury of the Philippines, series 66 (1944), sobresello VICTORY en el reverso.`,
        `4. ${extLink('https://www.realbanknotes.com/banknote/27183-Philippines-p94a-1-Peso-from-1944', 'RealBanknotes / Standard Catalog — Pick 94a', true)} y ${extLink('https://www.realbanknotes.com/banknote/27184-Philippines-p95a-2-Pesos-from-1944', 'Pick 95a', true)}: ND (1944); VICTORY SERIES NO. 66 dos veces en lugar de fecha; sello azul; USBEP sin pie.`,
        `5. ${extLink('https://www.realbanknotes.com/banknote/27243-Philippines-p117c-1-Peso-from-1949', 'RealBanknotes — Pick 117c', true)} y ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0118.htm', 'Bank Note Museum P-118', true)}: sobresello rojo CENTRAL BANK OF THE PHILIPPINES (1949) sobre existencias Victory; no son los ejemplares de esta página.`,
        `6. ${extLink('https://en.numista.com/catalogue/note201642.html', 'Numista — 1 Peso (Victory)', true)}: tirada 61.192.000 (Pick 94a). ${extLink('https://en.numista.com/catalogue/note203356.html', '2 Pesos (Victory)', true)}: 16.231.272 (Pick 95a). Cifras de catálogo secundario.`,
        `7. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', true)}: tabla de entregas BEP (1 peso 61.192.000; 2 pesos 16.231.272; 500 pesos Osmeña–Hernandez 12.991); desembarco en Leyte y el dato, no oficial, de que MacArthur llevaba billetes en el bolsillo. No es un documento BEP de primera mano.`,
        `8. ${extLink('https://www.numismatics.ph/banknotes/victory-series/', 'numismatics.ph — Victory Series No. 66', true)}: atribuye al BEP el «66» (y anota que Quezon tenía 65); Leyte 20 oct 1944; total facial ₱1.019.544.000. ${extLink('https://www.numismatics.ph/banknotes/victory-series/500-pesos-osmena-hernandez.html', '500 pesos Osmeña–Hernandez', true)}: 12.991 impresos.`,
        `9. ${extLink('https://www.phil-philately.com/my-collection-of-philippine-bank-notes/8-history-of-philippine-paper-money/', 'Phil-Philately — History of Philippine Paper Money', true)}: serie 66 por la edad de Quezon; informes de que MacArthur llevaba notas encima en Leyte; tiradas por denominación.`,
        `10. ${extLink('https://www.banknoteworld.com/blog/philippines-numismatic-history/', 'Banknote World — Philippines Numismatic History', true)}: certificados militares japoneses; sobresello CBP sobre Victory Notes de 1944; English Series atribuida a Thomas de la Rue / 1949–1951. Fuente comercial.`,
        `11. ${extLink('https://www.philippinecurrencywwii.com/', 'Philippine Currency of World War II', true)}: dinero de invasión japonés (JIM) e inflación; notas de guerrilla o emergencia autorizadas por la Commonwealth en el exilio.`,
        `12. Examen de los ejemplares Notofilia: 1 peso F70618009 y 2 pesos F13317943, ambos sin sobresello rojo del Banco Central.`,
      ]
    : [
        `1. ${extLink('https://www.bsp.gov.ph/SitePages/CoinsAndNotes/EnglishSeries.aspx', 'Bangko Sentral ng Pilipinas — English Series / demonetized notes', false)}: liberation forces brought Victory Series No. 66 in 1944; after the Central Bank (1949) those denominations were overprinted “Central Bank of the Philippines” and remained legal tender until 30 July 1964.`,
        `2. ${extLink('https://www.bsp.gov.ph/Pages/CoinsAndNotes/HistoryOfPhilippineMoney/HistoryOfPhilippineMoney.aspx', 'BSP — History of Philippine Money', false)}: the Commonwealth peso was tied to the dollar at 2:1; after sovereignty was recovered, Treasury certificates overprinted “Victory” were used.`,
        `3. ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0094.htm', 'Bank Note Museum — Philippines P-94', false)} and ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0095.htm', 'P-95', false)}: 1 and 2 pesos, Treasury of the Philippines, series 66 (1944), VICTORY overprint on the reverse.`,
        `4. ${extLink('https://www.realbanknotes.com/banknote/27183-Philippines-p94a-1-Peso-from-1944', 'RealBanknotes / Standard Catalog — Pick 94a', false)} and ${extLink('https://www.realbanknotes.com/banknote/27184-Philippines-p95a-2-Pesos-from-1944', 'Pick 95a', false)}: ND (1944); VICTORY SERIES NO. 66 twice instead of a date; blue seal; USBEP, no imprint.`,
        `5. ${extLink('https://www.realbanknotes.com/banknote/27243-Philippines-p117c-1-Peso-from-1949', 'RealBanknotes — Pick 117c', false)} and ${extLink('http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0118.htm', 'Bank Note Museum P-118', false)}: red CENTRAL BANK OF THE PHILIPPINES overprint (1949) on Victory stock; not the specimens on this page.`,
        `6. ${extLink('https://en.numista.com/catalogue/note201642.html', 'Numista — 1 Peso (Victory)', false)}: print run 61,192,000 (Pick 94a). ${extLink('https://en.numista.com/catalogue/note203356.html', '2 Pesos (Victory)', false)}: 16,231,272 (Pick 95a). Secondary catalog figures.`,
        `7. ${extLink('https://www.guerrilla-money.com/victory-series/', 'Guerrilla Money — Victory Series', false)}: BEP delivery table (1 peso 61,192,000; 2 pesos 16,231,272; 500 pesos Osmeña–Hernandez 12,991); Leyte landing and the unofficial report that MacArthur carried notes in his pocket. Not a first-hand BEP document.`,
        `8. ${extLink('https://www.numismatics.ph/banknotes/victory-series/', 'numismatics.ph — Victory Series No. 66', false)}: attributes “66” to the BEP (and notes that Quezon was 65); Leyte 20 Oct 1944; series face total ₱1,019,544,000. ${extLink('https://www.numismatics.ph/banknotes/victory-series/500-pesos-osmena-hernandez.html', '500 pesos Osmeña–Hernandez', false)}: 12,991 printed.`,
        `9. ${extLink('https://www.phil-philately.com/my-collection-of-philippine-bank-notes/8-history-of-philippine-paper-money/', 'Phil-Philately — History of Philippine Paper Money', false)}: Series 66 from Quezon’s age; reports that MacArthur carried notes at Leyte; print runs by denomination.`,
        `10. ${extLink('https://www.banknoteworld.com/blog/philippines-numismatic-history/', 'Banknote World — Philippines Numismatic History', false)}: Japanese military certificates; CBP overprint on 1944 Victory Notes; English Series attributed to Thomas de la Rue / 1949–1951. Commercial source.`,
        `11. ${extLink('https://www.philippinecurrencywwii.com/', 'Philippine Currency of World War II', false)}: Japanese invasion money (JIM) and inflation; guerrilla or emergency notes authorized by the Commonwealth in exile.`,
        `12. Examination of the Notofilia specimens: 1 peso F70618009 and 2 pesos F13317943, both without the red Central Bank overprint.`,
      ];

  const relatedHeading = isEs ? 'Sigue explorando' : 'Keep exploring';
  const related = isEs
    ? [
        ['/coleccion/filipinas/', 'Colección de Filipinas'],
        ['/coleccion/filipinas/1-peso-victory-series-66/', '1 Peso Victory Series No. 66'],
        ['/coleccion/filipinas/2-pesos-victory-series-66/', 'Dos Pesos Victory Series No. 66'],
        ['/coleccion/veinte-dolares-hawaii-1934/', '$20 Hawaii, 1934 (sobresello de guerra)'],
        ['/glosario/sobresello/', 'Glosario: sobresello'],
      ]
    : [
        ['/en/collection/philippines/', 'Philippines collection'],
        ['/en/collection/philippines/1-peso-victory-series-66/', '1 Peso Victory Series No. 66'],
        ['/en/collection/philippines/2-pesos-victory-series-66/', 'Two Pesos Victory Series No. 66'],
        ['/en/collection/twenty-dollars-hawaii-1934/', '$20 Hawaii, 1934 (wartime overprint)'],
        ['/en/glossary/overprint/', 'Glossary: overprint'],
      ];

  const metaHtml = seriesMeta
    .map((row, i) => metaRow(row[0], row[1], i === seriesMeta.length - 1))
    .join('\n          ');

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

        ${NOTES.map((note) => noteSection(lang, note)).join('\n')}

        <div style="width:100%; max-width:760px;">
          ${intro}
          ${origin}
          ${leyte}
          ${catalog}
          <div style="display:flex; flex-direction:column; margin-top:28px;">
          ${metaHtml}
          </div>
        </div>

        <div style="width:100%; max-width:760px; margin:44px auto 0; padding-top:20px; border-top:1px solid rgba(10,10,9,0.12);">
          ${h2(notesHeading)}
          ${notes.map((n) => noteP(n)).join('\n          ')}
        </div>
      </div>
    </div>
    <aside aria-labelledby="related-reading-heading" style="width:100%; max-width:900px; margin:48px auto 0; padding-top:32px; border-top:1px solid rgba(231,222,201,0.18);">
      <h2 id="related-reading-heading" style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#b7ab8a; font-weight:600; margin:0 0 16px; font-style:normal;">${relatedHeading}</h2>
      <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px;">
        ${related
          .map(
            ([href, title]) =>
              `<a href="${href}" style="display:block; padding:16px; border:1px solid rgba(231,222,201,0.22); color:#d8d2cd; text-decoration:none; line-height:1.45; min-height:44px; box-sizing:border-box;">${title}</a>`,
          )
          .join('\n        ')}
      </div>
    </aside>
  </main>

</div>`;
}

const esTemplate = buildTemplate('es');
const enTemplate = buildTemplate('en');

const payload = {
  path: ES_PATH,
  title: 'Tesorería de Filipinas · Victory Series | Notofilia',
  description:
    'Victory Series 66 de la Tesorería de Filipinas (1944): historia, Pick 94a y 95a, y los 1 y 2 pesos de la colección.',
  keywords: [
    'filipinas',
    'victory series 66',
    'tesorería de filipinas',
    'treasury certificate',
    'pick 94a',
    'pick 95a',
    'leyte 1944',
    'sobresello victory',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Tesorería de Filipinas · Victory Series',
  ogDescription:
    'Certificados del Tesoro Victory Series No. 66: liberación de 1944 y los 1 y 2 pesos de la colección Notofilia.',
  ogImage: '/uploads/philippines-treasury-certificate-1-peso-victory-series-66-5c220d39.jpg',
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
            name: 'Tesorería de Filipinas · Victory Series',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Tesorería de Filipinas · Victory Series No. 66',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}/uploads/philippines-treasury-certificate-1-peso-victory-series-66-5c220d39.jpg`,
        description:
          'Página de serie: certificados del Tesoro Victory Series No. 66 (ND 1944), con los ejemplares de 1 y 2 pesos de la colección Notofilia.',
        dateCreated: '1944',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        identifier: 'NF.filipinas.tesoreria-victory-series',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Serie', value: 'Victory Series No. 66' },
          { '@type': 'PropertyValue', name: 'Pick', value: '94a / 95a' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'U.S. Bureau of Engraving and Printing' },
        ],
      },
      {
        '@type': 'ItemList',
        name: 'Ejemplares Victory Series No. 66 en la colección',
        numberOfItems: 2,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            url: `${SITE}/coleccion/filipinas/1-peso-victory-series-66/`,
            name: '1 Peso Victory Series No. 66',
          },
          {
            '@type': 'ListItem',
            position: 2,
            url: `${SITE}/coleccion/filipinas/2-pesos-victory-series-66/`,
            name: '2 Pesos Victory Series No. 66',
          },
        ],
      },
    ],
  },
  styles,
  template: esTemplate,
  logic: '',
  record: {
    id: 'NF.filipinas.tesoreria-victory-series',
    kind: 'banknote',
    title: 'Tesorería de Filipinas · Victory Series',
    subtitle: 'Certificados del Tesoro · Series No. 66 · Pick 94a y 95a',
    dateOrSeries: 'Victory Series No. 66, ND 1944',
    country: 'Filipinas',
    issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Filipinas', href: '/coleccion/filipinas/' },
      { name: 'Tesorería de Filipinas · Victory Series' },
    ],
    images: {
      stacked: {
        src: '/uploads/philippines-treasury-certificate-1-peso-victory-series-66-5c220d39.jpg',
        srcWebp: '/uploads/philippines-treasury-certificate-1-peso-victory-series-66-5c220d39.webp',
        alt: NOTES[0].altEs,
        altEn: NOTES[0].altEn,
        width: NOTES[0].width,
        height: NOTES[0].height,
      },
      defaultView: 'stacked',
    },
    metadata: {
      denomination: '1 peso y 2 pesos',
      currency: 'Peso filipino (Commonwealth)',
      issuer: 'Tesorería de Filipinas (Treasury of the Philippines)',
      printer: 'U.S. Bureau of Engraving and Printing (sin pie de imprenta)',
      issueDate: 'ND (1944); Victory Series No. 66',
      series: 'Victory Series No. 66',
      catalogNumber: 'Pick 94a / Pick 95a',
      material: 'Papel',
      status: 'circulated',
      printRun:
        'Fuentes secundarias que citan entregas BEP: 61.192.000 (1 peso); 16.231.272 (2 pesos); 12.991 (500 pesos Osmeña–Hernandez). Informe BEP original: no confirmado',
      knownVarieties:
        'Sin CBP: Pick 94 (1 peso), 95 (2 pesos) y denominaciones 5–500. Con sobresello rojo CBP (1949): Pick 117–123. Otras: no confirmado',
      circulationDates:
        'Leyte, 20 octubre 1944 (BSP). Tipo sin sobresello CBP: 1944–1949. Serie Victory con sobresello CBP de curso legal hasta 30 julio 1964 (BSP).',
      rarityBasis:
        '1 y 2 pesos sin CBP: tipos comunes de la serie 66. 500 pesos Osmeña–Hernandez citado como extremo. Población PMG: no confirmado',
      shownSpecimenState:
        'Dos certificados Notofilia sin encapsular y sin sobresello rojo CBP (1 peso F70618009; 2 pesos F13317943). Grado numérico: no confirmado',
      factualReviewDate: '2026-08-23',
    },
    render: 'astro-static',
    eyebrow: 'Commonwealth de Filipinas · 1944',
    resourced: true,
    context: {
      historical:
        'Las fuerzas de liberación llevaron la Victory Series No. 66 en 1944 (BSP). Esta página reúne el 1 peso Pick 94a y el 2 pesos Pick 95a, ambos sin sobresello rojo CBP de 1949.',
      design:
        'Anverso de certificado del Tesoro prebélico con sello azul de la Commonwealth; reverso con sobresello negro VICTORY. Impresor USBEP, sin pie.',
      varieties:
        'Tipos 1944 sin CBP (Pick 94–101) y tipos 1949 con sobresello rojo CBP (Pick 117–123). El 500 pesos Osmeña–Hernandez es la tirada más baja citada.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen de los ejemplares Notofilia (F70618009 y F13317943)',
        note: 'Ambos sin sobresello rojo CBP; sello y series azules; VICTORY negro en el reverso',
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
        label: 'Bank Note Museum — Philippines P-94 y P-95',
        url: 'http://www.banknote.ws/COLLECTION/countries/ASI/PIL/PIL0094.htm',
        note: '1 y 2 pesos, series 66 (1944), sobresello VICTORY',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes / Standard Catalog — Pick 94a y 95a',
        url: 'https://www.realbanknotes.com/banknote/27183-Philippines-p94a-1-Peso-from-1944',
        note: 'ND 1944; VICTORY SERIES NO. 66; sello azul; USBEP sin pie',
      },
      {
        kind: 'secondary',
        label: 'Numista — 1 Peso y 2 Pesos (Victory)',
        url: 'https://en.numista.com/catalogue/note201642.html',
        note: 'Tiradas 61.192.000 y 16.231.272 citadas',
      },
      {
        kind: 'secondary',
        label: 'Guerrilla Money — Victory Series',
        url: 'https://www.guerrilla-money.com/victory-series/',
        note: 'Tabla de entregas BEP; 500 pesos Osmeña–Hernandez 12.991; Leyte / bolsillo de MacArthur',
      },
      {
        kind: 'secondary',
        label: 'numismatics.ph — Victory Series No. 66',
        url: 'https://www.numismatics.ph/banknotes/victory-series/',
        note: 'Atribuye «66» al BEP y anota que Quezon tenía 65; Leyte 20 oct 1944',
      },
      {
        kind: 'secondary',
        label: 'Phil-Philately — History of Philippine Paper Money',
        url: 'https://www.phil-philately.com/my-collection-of-philippine-bank-notes/8-history-of-philippine-paper-money/',
        note: 'Serie 66 y Quezon; MacArthur en Leyte; tiradas',
      },
      {
        kind: 'retail',
        label: 'Banknote World — Philippines Numismatic History',
        url: 'https://www.banknoteworld.com/blog/philippines-numismatic-history/',
        note: 'Certificados militares japoneses; sobresello CBP; English Series / de la Rue',
      },
      {
        kind: 'secondary',
        label: 'Philippine Currency of World War II',
        url: 'https://www.philippinecurrencywwii.com/',
        note: 'JIM, hiperinflación y notas de guerrilla o emergencia',
      },
    ],
    related: [
      { href: '/coleccion/filipinas/', title: 'Catálogo de Billetes de Filipinas' },
      { href: '/coleccion/filipinas/1-peso-victory-series-66/', title: '1 Peso Victory Series No. 66' },
      { href: '/coleccion/filipinas/2-pesos-victory-series-66/', title: 'Dos Pesos Victory Series No. 66' },
      { href: '/coleccion/veinte-dolares-hawaii-1934/', title: '$20 Hawaii, 1934' },
      { href: '/glosario/sobresello/', title: 'Sobresello' },
    ],
  },
  legacyFile: 'billete-filipinas-tesoreria-victory-series.dc.html',
  sourceHash: createHash('sha1').update('filipinas-tesoreria-victory-series-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Philippine Treasury · Victory Series | Notofilia',
      description:
        'Philippine Treasury Victory Series 66 (1944): history, Pick 94a and 95a, and the 1- and 2-peso notes.',
      ogTitle: 'Philippine Treasury · Victory Series',
      ogDescription:
        'Victory Series No. 66 Treasury Certificates: the 1944 liberation and the 1- and 2-peso notes in the collection.',
      template: enTemplate,
      recordTitle: 'Treasury of the Philippines · Victory Series',
      eyebrow: 'Commonwealth of the Philippines · 1944',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
