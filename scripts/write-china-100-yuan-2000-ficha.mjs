/**
 * Generator for the People's Bank of China 2000 polymer 100 yuan ficha.
 * Usage: node scripts/write-china-100-yuan-2000-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/polimero-mundial/china-100-yuan-2000/';
const EN_PATH = '/en/collection/world-polymer/china-100-yuan-2000/';
const IMG = '/uploads/china-pboc-100-yuan-2000-polimero';
const ZOOM_ID = 'china-100-yuan-2000-polimero';
const OUT = path.join(process.cwd(), 'src/content/catalog/polimero-mundial--china-100-yuan-2000.json');

const SOURCE_CANDIDATES = [
  path.join(process.cwd(), 'public/uploads/china-pboc-100-yuan-2000-polimero.png'),
  path.join(process.cwd(), 'public/uploads/china-pboc-100-yuan-2000-polimero.jpg'),
  path.join(process.cwd(), 'public/uploads/2000 100 yuan China Peoples Republic Bank.png'),
];

let IMG_WIDTH = 969;
let IMG_HEIGHT = 1624;
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
  'Billete conmemorativo de 100 yuan de polímero del Banco Popular de China (2000), anverso arriba con dragón dorado y ventana del Templo del Cielo, reverso abajo con el Monumento del Milenio de China, ejemplar J04445744 en funda transparente';
const ALT_EN =
  'People’s Bank of China commemorative polymer 100-yuan banknote (2000), obverse above with a golden dragon and Temple of Heaven window, reverse below with the China Millennium Monument, specimen J04445744 in a clear sleeve';

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
              <source srcset="${IMG}-640.webp 640w, ${IMG}.webp ${IMG_WIDTH}w" sizes="(max-width: 640px) 100vw, 560px" type="image/webp" />
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
  const backHref = isEs ? '/coleccion/polimero-mundial/' : '/en/collection/world-polymer/';
  const backLabel = isEs ? 'Catálogo de Billetes de Polímero Mundial' : 'World polymer banknote catalog';
  const screen = isEs
    ? 'Banco Popular de China — 100 Yuan (2000)'
    : 'People’s Bank of China — 100 Yuan (2000)';
  const eyebrow = isEs
    ? 'Billetes de Polímero Mundial &middot; China &middot; 2000'
    : 'World Polymer Banknotes &middot; China &middot; 2000';
  const h1 = isEs ? 'Banco Popular de China' : 'People’s Bank of China';
  const subtitle = isEs
    ? 'Cien Yuan &middot; Conmemorativo del milenio &middot; Dragón &middot; Año 2000'
    : 'One Hundred Yuan &middot; Millennium commemorative &middot; Dragon &middot; Year 2000';
  const alt = isEs ? ALT_ES : ALT_EN;
  const tab = newTab(isEs);
  const unconfirmed = isEs
    ? '<span style="font-style:italic;">no confirmado</span>'
    : '<span style="font-style:italic;">unconfirmed</span>';

  const pbocXining = isEs
    ? `<a href="https://xining.pbc.gov.cn/xining/118296/118298/2678109/index.html" target="_blank" rel="noopener noreferrer">Banco Popular de China, sucursal de Xining — «我国目前已发行了几种纪念钞？»${tab}</a>`
    : `<a href="https://xining.pbc.gov.cn/xining/118296/118298/2678109/index.html" target="_blank" rel="noopener noreferrer">People’s Bank of China, Xining branch — “我国目前已发行了几种纪念钞？”${tab}</a>`;
  const pbocNotice = isEs
    ? `<a href="https://law1.110.com/law_101096.html" target="_blank" rel="noopener noreferrer">Anuncio del Banco Popular de China, 24 de noviembre de 2000, «关于发行迎接新世纪纪念钞、纪念币的公告»${tab}</a>`
    : `<a href="https://law1.110.com/law_101096.html" target="_blank" rel="noopener noreferrer">People’s Bank of China announcement, 24 November 2000, “关于发行迎接新世纪纪念钞、纪念币的公告”${tab}</a>`;
  const rba = isEs
    ? `<a href="https://www.rba.gov.au/publications/annual-reports/rba/2001/note-printing.html" target="_blank" rel="noopener noreferrer">Reserve Bank of Australia, Annual Report 2001, Note Printing Australia and Securency${tab}</a>`
    : `<a href="https://www.rba.gov.au/publications/annual-reports/rba/2001/note-printing.html" target="_blank" rel="noopener noreferrer">Reserve Bank of Australia, Annual Report 2001, Note Printing Australia and Securency${tab}</a>`;
  const pmg = isEs
    ? `<a href="https://www.pmgnotes.com/news/article/4311/" target="_blank" rel="noopener noreferrer">PMG, «From the Grading Room: Millennium Dragon» (18 noviembre 2014)${tab}</a>`
    : `<a href="https://www.pmgnotes.com/news/article/4311/" target="_blank" rel="noopener noreferrer">PMG, “From the Grading Room: Millennium Dragon” (18 November 2014)${tab}</a>`;
  const peopleDaily = isEs
    ? `<a href="http://english.peopledaily.com.cn/english/200011/24/eng20001124_56056.html" target="_blank" rel="noopener noreferrer">People’s Daily Online, «New Commemorative Bills/Coins to Mark Millennium» (24 noviembre 2000)${tab}</a>`
    : `<a href="http://english.peopledaily.com.cn/english/200011/24/eng20001124_56056.html" target="_blank" rel="noopener noreferrer">People’s Daily Online, “New Commemorative Bills/Coins to Mark Millennium” (24 November 2000)${tab}</a>`;

  const rows = isEs
    ? [
        ['País', 'China (República Popular China)'],
        [
          'Entidad Emisora',
          'Banco Popular de China (中国人民银行 / People’s Bank of China). No es el Bank of China (中国银行).<sup style="font-size:12px;">1</sup>',
        ],
        ['Denominación', 'Cien Yuan (100 元 / 壹佰圆)'],
        ['Tipo de Emisión', 'Billete conmemorativo de curso legal: «迎接新世纪纪念钞» (billete que da la bienvenida al nuevo siglo).<sup style="font-size:12px;">1,2</sup>'],
        [
          'Material',
          'Polímero (el anuncio oficial dice «塑料», plástico). Sustrato Guardian® suministrado por Securency (RBA y UCB) al Banco Popular de China.<sup style="font-size:12px;">2,3</sup>',
        ],
        [
          'Impresor',
          `Impreso en China. PMG atribuye la impresión a China Banknote Printing and Minting Corporation (BPMC/CBPM); el anuncio del PBOC no nombra impresor. ${unconfirmed} en fuente primaria del banco emisor.<sup style="font-size:12px;">4</sup>`,
        ],
        ['Fecha de emisión', '28 de noviembre de 2000 (anuncio del 24 de noviembre de 2000).<sup style="font-size:12px;">1,2</sup>'],
        ['Número de serie', 'J04445744 (visible en el ejemplar; prefijo J).'],
        ['Dimensiones', '165 &times; 80 mm.<sup style="font-size:12px;">2</sup>'],
        ['Referencia de Catálogo', 'Pick 902, Standard Catalog of World Paper Money.<sup style="font-size:12px;">4</sup>'],
        ['Tirada', '10 millones de juegos, según el anuncio oficial («各1000万套»).<sup style="font-size:12px;">2</sup>'],
        [
          'Variedades conocidas',
          `Prefijo J (este ejemplar). PMG describe también prefijo de reemplazo I, pares sin cortar y presentación en carpeta; esas variantes no aparecen en el anuncio del PBOC. Otras: ${unconfirmed}.<sup style="font-size:12px;">4</sup>`,
        ],
        [
          'Fechas de circulación',
          'Puesta en circulación el 28 de noviembre de 2000, con las mismas funciones que el renminbi vigente y valor igual al de 100 yuan en curso.<sup style="font-size:12px;">2</sup> Fecha de retiro: ' +
            unconfirmed +
            '.',
        ],
        [
          'Base de la rareza',
          'Emisión conmemorativa de tirada fija anunciada (10 millones). El desglose de 9,1 millones con prefijo J que cita PMG no está en el anuncio oficial.<sup style="font-size:12px;">2,4</sup>',
        ],
        [
          'Estado del ejemplar mostrado',
          'Colección privada, en funda plástica transparente, sin encapsular. Número de serie J04445744. Grading de terceros: ' +
            unconfirmed +
            '.',
        ],
        ['Fecha de última revisión factual', '22 de agosto de 2026', true],
      ]
    : [
        ['Country', 'China (People’s Republic of China)'],
        [
          'Issuing Entity',
          'People’s Bank of China (中国人民银行). Not the Bank of China (中国银行).<sup style="font-size:12px;">1</sup>',
        ],
        ['Denomination', 'One Hundred Yuan (100 元 / 壹佰圆)'],
        ['Type of Issue', 'Legal-tender commemorative: “迎接新世纪纪念钞” (banknote welcoming the new century).<sup style="font-size:12px;">1,2</sup>'],
        [
          'Material',
          'Polymer (the official notice says “塑料”, plastic). Guardian® substrate supplied by Securency (RBA and UCB) to the People’s Bank of China.<sup style="font-size:12px;">2,3</sup>',
        ],
        [
          'Printer',
          `Printed in China. PMG attributes printing to China Banknote Printing and Minting Corporation (BPMC/CBPM); the PBOC notice does not name a printer. ${unconfirmed} in a primary issuer source.<sup style="font-size:12px;">4</sup>`,
        ],
        ['Date of issue', '28 November 2000 (announced 24 November 2000).<sup style="font-size:12px;">1,2</sup>'],
        ['Serial number', 'J04445744 (visible on the specimen; J prefix).'],
        ['Dimensions', '165 &times; 80 mm.<sup style="font-size:12px;">2</sup>'],
        ['Catalog Reference', 'Pick 902, Standard Catalog of World Paper Money.<sup style="font-size:12px;">4</sup>'],
        ['Print run', '10 million sets, per the official notice (“各1000万套”).<sup style="font-size:12px;">2</sup>'],
        [
          'Known varieties',
          `J prefix (this specimen). PMG also describes an I replacement prefix, uncut pairs, and a folder issue; those varieties are not in the PBOC notice. Others: ${unconfirmed}.<sup style="font-size:12px;">4</sup>`,
        ],
        [
          'Circulation dates',
          'Released on 28 November 2000, with the same functions as circulating renminbi and equal value to the circulating 100 yuan.<sup style="font-size:12px;">2</sup> Withdrawal date: ' +
            unconfirmed +
            '.',
        ],
        [
          'Rarity basis',
          'A commemorative issue with a fixed announced print run (10 million). PMG’s breakdown of 9.1 million J-prefix notes is not in the official notice.<sup style="font-size:12px;">2,4</sup>',
        ],
        [
          'Condition of the shown specimen',
          'Private collection, in a clear plastic sleeve, unencapsulated. Serial J04445744. Third-party grading: ' +
            unconfirmed +
            '.',
        ],
        ['Date of last factual review', '22 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          '<strong style="color:#1c1a15;">El primer polímero de la República Popular:</strong> el 24 de noviembre de 2000 el Banco Popular de China anunció que el 28 de noviembre emitiría la «迎接新世纪纪念钞», un billete de 100 yuan en plástico, junto con una moneda conmemorativa de 10 yuan. Una ficha de la sucursal de Xining lo recuerda como la nota de plástico de 100 yuan del milenio, llamada «龙钞» en el medio coleccionista porque el año 2000 coincidió con un año del dragón.<sup style="font-size:12px;">1,2</sup>',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Curso legal, no un souvenir:</strong> el anuncio fija el valor facial en 100 yuan, el tamaño en 165 &times; 80 mm y la tirada en 10 millones de juegos. La nota «tiene las mismas funciones que el renminbi vigente» y circula a la par del billete de 100 yuan de papel. No debe confundirse con el Bank of China (中国银行): el emisor es el banco central, 中国人民银行. People’s Daily Online, al traducir el anuncio ese mismo día, escribió por error «Bank of China».<sup style="font-size:12px;">2,5</sup>',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Guardian® y un DOE chino:</strong> el Informe anual 2001 del Reserve Bank of Australia lista al People’s Bank of China, 100 Yuan de 2000, entre los clientes de exportación de Securency, la empresa conjunta del RBA y UCB que fabrica el sustrato Guardian®. El mismo informe dice que el elemento óptico difractivo (DOE) se incorporó en el 100 yuan de China.<sup style="font-size:12px;">3</sup> El anuncio del PBOC no nombra el sustrato ni el impresor; PMG atribuye la impresión a China Banknote Printing and Minting Corporation.<sup style="font-size:12px;">4</sup>',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Un dragón de la ciudad, un monumento del año 2000:</strong> el anverso toma el «升龙» (dragón ascendente) del Muro de los Nueve Dragones de Pekín y una perla de fuego; el reverso muestra el Monumento del Milenio de China (中华世纪坛) con figuras de feitian. El ejemplar de esta ficha lleva el serial J04445744. PMG describe también un prefijo de reemplazo I y pares sin cortar; esas cifras de desglose no están en el anuncio oficial.<sup style="font-size:12px;">2,4</sup>',
          true,
        ),
      ]
    : [
        sectionP(
          '<strong style="color:#1c1a15;">The People’s Republic’s first polymer note:</strong> on 24 November 2000 the People’s Bank of China announced that on 28 November it would issue the “迎接新世纪纪念钞”, a 100-yuan plastic banknote, together with a 10-yuan commemorative coin. A Xining-branch FAQ remembers it as the 100-yuan plastic millennium note, called “龙钞” among collectors because 2000 was also a Year of the Dragon.<sup style="font-size:12px;">1,2</sup>',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Legal tender, not a souvenir:</strong> the notice sets the face value at 100 yuan, the size at 165 &times; 80 mm, and the print run at 10 million sets. The note “has the same functions as circulating renminbi” and is equal in value to the paper 100 yuan. It should not be confused with the Bank of China (中国银行): the issuer is the central bank, 中国人民银行. People’s Daily Online, translating the notice the same day, incorrectly wrote “Bank of China.”<sup style="font-size:12px;">2,5</sup>',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Guardian® and a Chinese DOE:</strong> the Reserve Bank of Australia’s 2001 Annual Report lists the People’s Bank of China 2000 100 Yuan among Securency’s export customers. Securency, the RBA–UCB joint venture, makes Guardian® substrate. The same report says the diffractive optical element (DOE) was incorporated in China’s 100 yuan.<sup style="font-size:12px;">3</sup> The PBOC notice does not name the substrate or the printer; PMG attributes printing to China Banknote Printing and Minting Corporation.<sup style="font-size:12px;">4</sup>',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">A city dragon and a year-2000 monument:</strong> the obverse takes the “升龙” (ascending dragon) from Beijing’s Nine-Dragon Wall and a flaming pearl; the reverse shows the China Millennium Monument (中华世纪坛) with feitian figures. The specimen on this record carries serial J04445744. PMG also describes an I replacement prefix and uncut pairs; that breakdown is not in the official notice.<sup style="font-size:12px;">2,4</sup>',
          true,
        ),
      ];

  const details = isEs
    ? [
        bullet(
          '<strong style="color:#1c1a15;">Anverso:</strong> dragón dorado en vuelo hacia una perla de fuego, según el anuncio «con el 升龙 del Muro de los Nueve Dragones de Pekín como base del diseño». Arriba, «中国人民银行»; abajo, «壹佰圆» y «迎接新世纪纪念钞». (Examen del ejemplar.)<sup style="font-size:12px;">2,6</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Ventana transparente:</strong> ventana en forma de ruyi a la izquierda con el Templo del Cielo (天坛), descrita en el anuncio como «票面左侧透明视窗为“天坛”图案». (Examen del ejemplar.)<sup style="font-size:12px;">2,6</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Marca holográfica:</strong> sello circular a la derecha con «千年» y «2000». El anuncio la llama «动态全息标志»; el RBA identifica un DOE en este 100 yuan.<sup style="font-size:12px;">2,3</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverso:</strong> Monumento del Milenio de China (中华世纪坛), feitian, emblema nacional, «ZHONGGUO RENMIN YINHANG», «YINGJIE XINSHIJI JINIANCHAO» y «2000年», más el nombre del banco y la denominación en mongol, tibetano, uigur y zhuang. (Examen del ejemplar.)<sup style="font-size:12px;">2,6</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Número de serie:</strong> J04445744 en el anverso, abajo a la izquierda. (Examen del ejemplar.)',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Colorido:</strong> ocres, naranjas y oro, «主色调为金黄色» en el anuncio oficial.<sup style="font-size:12px;">2</sup>',
        ),
      ]
    : [
        bullet(
          '<strong style="color:#1c1a15;">Obverse:</strong> a golden dragon in flight toward a flaming pearl, from the notice “based on the 升龙 of Beijing’s Nine-Dragon Wall.” Above, “中国人民银行”; below, “壹佰圆” and “迎接新世纪纪念钞.” (Specimen examination.)<sup style="font-size:12px;">2,6</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Transparent window:</strong> a ruyi-shaped window at left with the Temple of Heaven (天坛), described in the notice as “票面左侧透明视窗为‘天坛’图案.” (Specimen examination.)<sup style="font-size:12px;">2,6</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Holographic mark:</strong> a circular seal at right with “千年” and “2000.” The notice calls it a “动态全息标志”; the RBA identifies a DOE on this 100 yuan.<sup style="font-size:12px;">2,3</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverse:</strong> the China Millennium Monument (中华世纪坛), feitian, the national emblem, “ZHONGGUO RENMIN YINHANG,” “YINGJIE XINSHIJI JINIANCHAO,” and “2000年,” plus the bank name and denomination in Mongolian, Tibetan, Uyghur, and Zhuang. (Specimen examination.)<sup style="font-size:12px;">2,6</sup>',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Serial number:</strong> J04445744 at lower left on the obverse. (Specimen examination.)',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Color:</strong> ochres, oranges, and gold; the official notice says the main hue is golden yellow (“金黄色”).<sup style="font-size:12px;">2</sup>',
        ),
      ];

  const notes = isEs
    ? [
        noteP(
          `1. ${pbocXining}: confirma la emisión del 28 de noviembre de 2000 de la «迎接新世纪» de 100 yuan en plástico y el apodo coleccionista «龙钞». Entidad emisora: Banco Popular de China.`,
        ),
        noteP(
          `2. ${pbocNotice} (reimpresión del anuncio oficial): color «金黄色»; anverso con 升龙, 火珠, ventana del 天坛 y holograma dinámico; reverso con 中华世纪坛, feitian, pinyin, emblema nacional y cuatro lenguas étnicas; 100 yuan; 165 &times; 80 mm; plástico; 10 millones de juegos; curso legal a la par.`,
        ),
        noteP(
          `3. ${rba}: tabla de clientes de exportación de Securency, «2000 | People's Bank of China | 100 Yuan»; el DOE «has been incorporated in … the 100 Yuan for China».`,
        ),
        noteP(
          `4. ${pmg}: Pick 902; impresión atribuida a BPMC; prefijo J (~9,1 millones), reemplazo I, pares sin cortar y carpeta. Esas cifras de desglose no están en el anuncio del PBOC.`,
        ),
        noteP(
          `5. ${peopleDaily}: confirma en prensa contemporánea el 28 de noviembre de 2000, 165 &times; 80 mm, 10 millones de juegos y el diseño. Escribe por error «Bank of China» en lugar de People’s Bank of China.`,
        ),
        noteP(
          `6. Examen del ejemplar de la colección Notofilia: anverso y reverso en fundas transparentes; serial J04445744; dragón, perla, ventana del Templo del Cielo, sello «千年» / «2000», 中华世纪坛 y leyendas en pinyin.`,
          true,
        ),
      ]
    : [
        noteP(
          `1. ${pbocXining}: confirms the 28 November 2000 issue of the plastic 100-yuan “迎接新世纪” note and the collectors’ nickname “龙钞.” Issuer: People’s Bank of China.`,
        ),
        noteP(
          `2. ${pbocNotice} (reprint of the official notice): “金黄色” main color; obverse with 升龙, flaming pearl, Temple of Heaven window, and a dynamic hologram; reverse with 中华世纪坛, feitian, pinyin, national emblem, and four ethnic-language lines; 100 yuan; 165 &times; 80 mm; plastic; 10 million sets; legal tender at par.`,
        ),
        noteP(
          `3. ${rba}: Securency export-customer table, “2000 | People's Bank of China | 100 Yuan”; the DOE “has been incorporated in … the 100 Yuan for China.”`,
        ),
        noteP(
          `4. ${pmg}: Pick 902; printing attributed to BPMC; J prefix (~9.1 million), I replacements, uncut pairs, and a folder. That breakdown is not in the PBOC notice.`,
        ),
        noteP(
          `5. ${peopleDaily}: contemporary press confirmation of 28 November 2000, 165 &times; 80 mm, 10 million sets, and the design. It incorrectly writes “Bank of China” instead of People’s Bank of China.`,
        ),
        noteP(
          `6. Examination of the Notofilia collection specimen: obverse and reverse in clear sleeves; serial J04445744; dragon, pearl, Temple of Heaven window, “千年” / “2000” seal, 中华世纪坛, and pinyin legends.`,
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

          <h1 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(28px,4vw,44px); line-height:1.08; letter-spacing:0.01em; color:#1c1a15; margin:0 0 12px;">${h1}</h1>

          <p style="font-size:clamp(19px,2vw,23px); font-style:italic; color:#4a4331; margin:0;">${subtitle}</p>
        </div>

        <div style="width:100%; max-width:560px; display:flex; flex-direction:column; gap:14px; margin:0 auto 56px;">
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
  title: '100 Yuan, China, Polímero (2000) | Notofilia',
  description:
    'Ficha: 100 yuan de polímero del Banco Popular de China, milenio 2000. Pick 902. Colección Notofilia.',
  keywords: [
    'banco popular de china',
    '100 yuan',
    'billete de polimero',
    'milenio 2000',
    'pick 902',
    'billetes de polimero mundial',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'China — 100 Yuan de polímero (2000)',
  ogDescription:
    'Billete conmemorativo de 100 yuan del Banco Popular de China, polímero, 28 de noviembre de 2000. Colección Notofilia.',
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
            name: 'Billetes de Polímero Mundial',
            item: `${SITE}/coleccion/polimero-mundial/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Banco Popular de China — 100 Yuan (2000)',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Banco Popular de China — 100 Yuan de polímero (2000)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Billete conmemorativo de 100 yuan en polímero emitido por el Banco Popular de China el 28 de noviembre de 2000 (迎接新世纪纪念钞). Pick 902.',
        identifier: 'Pick 902',
        dateCreated: '2000-11-28',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/polimero-mundial/#page` },
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '902' },
          { '@type': 'PropertyValue', name: 'Emisor', value: 'Banco Popular de China (中国人民银行)' },
          { '@type': 'PropertyValue', name: 'Material', value: 'Polímero' },
          { '@type': 'PropertyValue', name: 'Número de serie', value: 'J04445744' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.polimero-mundial.china-100-yuan-2000',
    kind: 'banknote',
    title: 'Banco Popular de China',
    subtitle: 'Cien Yuan · Conmemorativo del milenio · Dragón · Año 2000',
    dateOrSeries: 'Billetes de Polímero Mundial · China · 2000',
    country: 'China (República Popular China)',
    issuer: 'Banco Popular de China (中国人民银行 / People’s Bank of China)',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Billetes de Polímero Mundial', href: '/coleccion/polimero-mundial/' },
      { name: 'Banco Popular de China — 100 Yuan (2000)' },
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
      denomination: 'Cien Yuan (100 元 / 壹佰圆)',
      currency: 'Renminbi (CNY)',
      issuer: 'Banco Popular de China (中国人民银行 / People’s Bank of China)',
      printer:
        'Impreso en China. PMG atribuye BPMC/CBPM; el anuncio del PBOC no nombra impresor. no confirmado en fuente primaria del emisor',
      catalogNumber: 'Pick 902, Standard Catalog of World Paper Money',
      material: 'Polímero (plástico según el anuncio del PBOC); sustrato Guardian® (Securency / RBA–UCB)',
      dimensions: '165 × 80 mm',
      issueDate: '28 de noviembre de 2000',
      serialNumber: 'J04445744',
      series: '迎接新世纪纪念钞',
      printRun: '10 millones de juegos (anuncio oficial del 24 de noviembre de 2000)',
      knownVarieties:
        'Prefijo J (este ejemplar). PMG: prefijo I de reemplazo, pares sin cortar y carpeta. Otras: no confirmado',
      circulationDates:
        'Puesta en circulación el 28 de noviembre de 2000, a la par del renminbi vigente. Fecha de retiro: no confirmado',
      rarityBasis:
        'Emisión conmemorativa de tirada fija anunciada (10 millones). El desglose de 9,1 millones con prefijo J que cita PMG no está en el anuncio oficial',
      shownSpecimenState:
        'Colección privada, en funda plástica transparente, sin encapsular. Serial J04445744. Grading de terceros: no confirmado',
      factualReviewDate: '2026-08-22',
    },
    render: 'astro-static',
    eyebrow: 'Billetes de Polímero Mundial · China · 2000',
    resourced: true,
    context: {
      historical:
        'El PBOC anunció el 24 de noviembre de 2000 la emisión del 28 de noviembre de la 迎接新世纪纪念钞, 100 yuan en plástico, 165 × 80 mm, 10 millones de juegos, de curso legal. La sucursal de Xining la recuerda como la nota de plástico del milenio («龙钞»).',
      design:
        'Anverso: 升龙 del Muro de los Nueve Dragones, perla de fuego, ventana del Templo del Cielo y holograma dinámico. Reverso: 中华世纪坛, feitian, emblema nacional y cuatro lenguas étnicas.',
      varieties:
        'Prefijo J (este ejemplar). PMG describe prefijo I, pares sin cortar y carpeta. Otras: no confirmado.',
      population: '10 millones de juegos según el anuncio oficial. Desglose por prefijo: no confirmado en fuente primaria.',
    },
    sources: [
      {
        kind: 'central_bank',
        label: 'Banco Popular de China, sucursal de Xining — «我国目前已发行了几种纪念钞？» (26 diciembre 2013)',
        url: 'https://xining.pbc.gov.cn/xining/118296/118298/2678109/index.html',
        note: 'Emisión del 28 de noviembre de 2000; 100 yuan plástico; apodo 龙钞',
      },
      {
        kind: 'central_bank',
        label: 'Anuncio del Banco Popular de China, 24 noviembre 2000 — «关于发行迎接新世纪纪念钞、纪念币的公告»',
        url: 'https://law1.110.com/law_101096.html',
        note: 'Reimpresión del anuncio: diseño, 165 × 80 mm, plástico, 10 millones, curso legal',
      },
      {
        kind: 'printer',
        label: 'Reserve Bank of Australia, Annual Report 2001 — Note Printing Australia and Securency',
        url: 'https://www.rba.gov.au/publications/annual-reports/rba/2001/note-printing.html',
        note: 'Securency exportó Guardian® al People’s Bank of China, 100 Yuan 2000; DOE en este tipo',
      },
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (serial J04445744)',
        note: 'Anverso y reverso en fundas; dragón, ventana del Templo del Cielo, sello 千年, 中华世纪坛',
      },
      {
        kind: 'press',
        label: 'People’s Daily Online, «New Commemorative Bills/Coins to Mark Millennium» (24 noviembre 2000)',
        url: 'http://english.peopledaily.com.cn/english/200011/24/eng20001124_56056.html',
        note: 'Prensa contemporánea; escribe por error Bank of China en lugar de People’s Bank of China',
      },
      {
        kind: 'secondary',
        label: 'PMG, «From the Grading Room: Millennium Dragon» (18 noviembre 2014)',
        url: 'https://www.pmgnotes.com/news/article/4311/',
        note: 'Pick 902; atribución BPMC; prefijos J/I y pares sin cortar. No sustituye al anuncio del PBOC',
      },
      {
        kind: 'catalog',
        label: 'Standard Catalog of World Paper Money — Pick 902',
        note: 'Número de catálogo; no sustituye a las fuentes primarias',
      },
    ],
    related: [
      { href: '/coleccion/polimero-mundial/', title: 'Catálogo de Billetes de Polímero Mundial' },
      { href: '/coleccion/polimero-mundial/bangladesh-10-taka-2000/', title: 'Bangladesh Bank — 10 Taka (2000)' },
      { href: '/coleccion/polimero-mundial/brazil-10-reais-2000/', title: 'Banco Central do Brasil — 10 Reais (2000)' },
      { href: '/coleccion/polimero-mundial/hong-kong-10-dolares-2007/', title: 'Hong Kong — 10 Dólares (2007)' },
    ],
  },
  legacyFile: 'billete-china-100-yuan-2000-polimero.dc.html',
  sourceHash: createHash('sha1').update('china-100-yuan-2000-polimero-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '100 Yuan, China, Polymer (2000) | Notofilia',
      description:
        'Catalog record: People’s Bank of China polymer 100 yuan millennium note (2000). Pick 902. Notofilia collection.',
      ogTitle: 'China — polymer 100 Yuan (2000)',
      ogDescription:
        'People’s Bank of China commemorative 100 yuan, polymer, 28 November 2000. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'People’s Bank of China',
      eyebrow: 'World Polymer Banknotes · China · 2000',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
