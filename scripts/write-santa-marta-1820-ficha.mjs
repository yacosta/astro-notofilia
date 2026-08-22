/**
 * Generator for the Santa Marta 1820 ¼ real (cuartillo) catalog ficha.
 * Usage: node scripts/write-santa-marta-1820-ficha.mjs
 *
 * Optional env:
 *   SLUG=colombia-santa-marta-1-4-real-1820-<hash>
 *   IMG_WIDTH / IMG_HEIGHT  (defaults from the processed JPEG if present)
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/colombia/santa-marta-1-4-real-1820/';
const EN_PATH = '/en/collection/colombia/santa-marta-quarter-real-1820/';
const STABLE = 'colombia-santa-marta-1-4-real-1820';
const ZOOM_ID = 'santa-marta-1-4-real-1820';
const OUT = path.join(process.cwd(), 'src/content/catalog/colombia--santa-marta-1-4-real-1820.json');

const processed = process.env.SLUG
  ? process.env.SLUG
  : (() => {
      const names = readdirSync(path.join(process.cwd(), 'public/uploads')).filter(
        (n) =>
          n.startsWith(`${STABLE}-`) &&
          n.endsWith('.jpg') &&
          !n.includes('-card') &&
          !n.includes('-640'),
      );
      return names.length === 1 ? names[0].replace(/\.jpg$/, '') : STABLE;
    })();

const SLUG = processed;
const IMG = `/uploads/${SLUG}`;
const jpgPath = path.join(process.cwd(), `public/uploads/${SLUG}.jpg`);
let IMG_WIDTH = Number(process.env.IMG_WIDTH) || 1600;
let IMG_HEIGHT = Number(process.env.IMG_HEIGHT) || 800;
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
  'Cuartillo de cobre de Santa Marta, 1820: reverso con corona, 1/4 y fecha (izquierda) y anverso con cruz, S y M (derecha)';
const ALT_EN =
  'Santa Marta copper quarter-real, 1820: reverse with crown, 1/4 and date (left) and obverse with cross, S and M (right)';

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
  const enlargeAria =
    lang === 'es' ? 'Ampliar imagen de la moneda' : 'Enlarge image of the coin';
  const caption =
    lang === 'es'
      ? 'Reverso (izquierda) y anverso (derecha) — Colección de Notofilia.com'
      : 'Reverse (left) and obverse (right) — Notofilia.com Collection';
  return `<button
            data-zoom-trigger="${ZOOM_ID}"
            aria-label="${enlargeAria}"
            style="all:unset; display:block; width:100%; position:relative; cursor:zoom-in; background:#ffffff; border-radius:4px; padding:16px;"
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
  const dialogLabel = isEs ? 'Moneda ampliada' : 'Enlarged coin';
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
  const hubHref = isEs ? '/coleccion/numismatica/' : '/en/collection/numismatics/';
  const hubLabel = isEs ? '&larr; Catálogo de Numismática' : '&larr; Numismatics catalog';
  const screen = isEs
    ? 'Santa Marta — ¼ real de cobre, 1820'
    : 'Santa Marta — copper ¼ real, 1820';
  const eyebrow = isEs
    ? 'Plaza realista de Santa Marta &middot; Nueva Granada &middot; Fernando VII'
    : 'Royalist Santa Marta &middot; New Granada &middot; Ferdinand VII';
  const h1 = isEs ? '¼ real de cobre &mdash; 1820' : 'Copper ¼ real &mdash; 1820';
  const subtitle = isEs
    ? 'Cuartillo de necesidad &middot; KM# B4 &middot; Restrepo 104'
    : 'Necessity cuartillo &middot; KM# B4 &middot; Restrepo 104';
  const alt = isEs ? ALT_ES : ALT_EN;

  const rows = isEs
    ? [
        ['País', 'Nueva Granada (actual Colombia)'],
        [
          'Entidad Emisora',
          'Autoridades realistas de Santa Marta, en nombre de Fernando VII',
        ],
        ['Ceca', 'Santa Marta (ceca de necesidad; no es la Casa de Moneda de Santa Fe)'],
        ['Denominación', '¼ real (cuartillo)'],
        ['Tipo de Emisión', 'Moneda de emergencia / de sitio, cobre de necesidad'],
        ['Año de acuñación', '1820'],
        ['Composición', 'Cobre'],
        [
          'Peso',
          'Catálogo: &asymp; 2,15 g (Numista). Los ejemplares de guerra varían de forma notable. Medición propia: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Diámetro',
          'Catálogo: &asymp; 21 mm (Numista). Forma irregular. Medición propia: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Canto', 'Liso (Numista)'],
        ['Forma', 'Circular irregular'],
        [
          'Referencias catalográficas',
          'KM# B4 &middot; Restrepo #104 / 104.1 &middot; Hernández #11 &middot; Numista N# 18073',
        ],
        ['Tirada', '<span style="font-style:italic;">no confirmado</span>'],
        [
          'Variedades conocidas',
          'Numista registra el tipo con o sin puntos (boulets) bajo la espada del anverso. Variedad de este ejemplar: <span style="font-style:italic;">no confirmado</span>',
        ],
        [
          'Fechas de circulación',
          '1820; la plaza realista de Santa Marta cayó en 1821, de modo que la circulación debió ser breve',
        ],
        [
          'Base de la rareza',
          'Cobre de necesidad de una plaza sitiada; acuñación tosca y planchets irregulares. Índice de rareza Numista: 54 (dato de catálogo secundario, no una población certificada)',
        ],
        [
          'Estado del ejemplar mostrado',
          'Sin encapsular, reverso a la izquierda y anverso a la derecha sobre fondo blanco; pátina cobriza, superficie picada, golpe descentrado hacia la derecha en el reverso. La identificación de tipo es firme; autenticidad y grado no se confirman solo con esta fotografía. Peso, diámetro y canto de este ejemplar: <span style="font-style:italic;">no confirmado</span>',
        ],
        ['Fecha de última revisión factual', '22 de agosto de 2026', true],
      ]
    : [
        ['Country', 'New Granada (present-day Colombia)'],
        [
          'Issuing Entity',
          'Royalist authorities of Santa Marta, in the name of Ferdinand VII',
        ],
        ['Mint', 'Santa Marta (necessity mint; not the Santa Fe de Bogotá mint)'],
        ['Denomination', '¼ real (cuartillo)'],
        ['Type of Issue', 'Emergency / siege coinage, necessity copper'],
        ['Year of minting', '1820'],
        ['Composition', 'Copper'],
        [
          'Weight',
          'Catalog: &asymp; 2.15 g (Numista). Wartime pieces vary considerably. Own measurement: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Diameter',
          'Catalog: &asymp; 21 mm (Numista). Irregular shape. Own measurement: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Edge', 'Plain (Numista)'],
        ['Shape', 'Irregular round'],
        [
          'Catalog references',
          'KM# B4 &middot; Restrepo #104 / 104.1 &middot; Hernández #11 &middot; Numista N# 18073',
        ],
        ['Print Run', '<span style="font-style:italic;">unconfirmed</span>'],
        [
          'Known Varieties',
          'Numista records the type with or without pellets (boulets) under the sword on the obverse. Variety of this specimen: <span style="font-style:italic;">unconfirmed</span>',
        ],
        [
          'Circulation Dates',
          '1820; the royalist plaza of Santa Marta fell in 1821, so circulation was almost certainly brief',
        ],
        [
          'Rarity Basis',
          'Necessity copper from a besieged plaza; crude strike and irregular planchets. Numista rarity index: 54 (secondary catalog figure, not a certified population)',
        ],
        [
          'Shown Specimen State',
          'Unencapsulated, reverse at left and obverse at right on a white background; copper patina, pitted surface, reverse strike off-center to the right. Type identification is firm; authenticity and grade are not confirmed from this photograph alone. Weight, diameter, and edge of this specimen: <span style="font-style:italic;">unconfirmed</span>',
        ],
        ['Date of Last Factual Review', '22 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const context = isEs
    ? [
        p(
          `<strong style="color:#1c1a15;">Una plaza realista en 1820:</strong> Santa Marta permaneció en manos de las autoridades de Fernando VII cuando gran parte de la Nueva Granada ya combatía por la independencia. Ante la escasez de circulante menudo, la plaza acuñó cobres toscos. En 1820 —el último año en que Santa Marta produjo moneda— salieron cuartillos y piezas de 2 reales.<sup style="font-size:12px;">1</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">No es la ceca de Santa Fe:</strong> este cuartillo no sale de la Casa de Moneda de Bogotá. Es cobre de necesidad de una ceca improvisada en la costa. El tipo oficial de ¼ real de leones y castillos (cecas NR y Popayán) es otra serie; tampoco debe confundirse con los cuartillos republicanos posteriores (KM 85).<sup style="font-size:12px;">2</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">Antecedentes de 1813–1818:</strong> los realistas de Santa Marta ya habían acuñado cobres en 1813 (iniciales S.M. y F.VII). Una Real Orden del 26 de febrero de 1814 mandó recogerlos. En 1817 el ayuntamiento pidió reponer el circulante menudo; el virrey Montalvo acabó autorizando nuevas piezas, y un bando de Sámano del 14 de diciembre de 1818 las mandó recoger de nuevo por las falsificaciones.<sup style="font-size:12px;">1</sup> El tipo de 1820 es, por tanto, la última emisión samaria, no la primera.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Circulación breve:</strong> la plaza realista cayó en 1821. Los ejemplares supervivientes suelen mostrar poco desgaste de bolsillo y, en cambio, golpes blandos, descentrados y planchets defectuosos —huella de la prisa de guerra, no de un largo uso comercial.<sup style="font-size:12px;">2</sup>`,
        ),
      ]
    : [
        p(
          `<strong style="color:#1c1a15;">A royalist plaza in 1820:</strong> Santa Marta remained in the hands of Ferdinand VII’s authorities while much of New Granada was already fighting for independence. Facing a shortage of small change, the plaza struck crude coppers. In 1820 —the last year Santa Marta produced coinage— it issued cuartillos and 2-real pieces.<sup style="font-size:12px;">1</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">Not the Santa Fe mint:</strong> this cuartillo does not come from the Bogotá mint. It is necessity copper from an improvised coastal mint. The official lions-and-castles ¼ real (NR and Popayán) is a different series; so are the later republican quarter-reales (KM 85).<sup style="font-size:12px;">2</sup>`,
        ),
        p(
          `<strong style="color:#1c1a15;">1813–1818 background:</strong> Santa Marta royalists had already struck coppers in 1813 (initials S.M. and F.VII). A royal order of 26 February 1814 recalled them. In 1817 the cabildo asked for small change to be restored; Viceroy Montalvo eventually authorized new pieces, and a bando of Sámano dated 14 December 1818 recalled them again because of counterfeits.<sup style="font-size:12px;">1</sup> The 1820 type is therefore the last Samarian issue, not the first.`,
        ),
        p(
          `<strong style="color:#1c1a15;">Brief circulation:</strong> the royalist plaza fell in 1821. Surviving specimens often show little pocket wear and, instead, soft or off-center strikes and defective planchets — traces of wartime haste rather than long commercial use.<sup style="font-size:12px;">2</sup>`,
        ),
      ];

  const detailsTitle = isEs ? 'Detalles Clave Visibles en la Moneda' : 'Key Details Visible on the Coin';
  const details = isEs
    ? [
        bullet(
          `<strong style="color:#1c1a15;">Reverso (izquierda):</strong> corona simplificada sobre la fracción <em>1/4</em>; castillo de tres torres a la izquierda; espada y pirámide de balas de cañón a la derecha; fecha <em>1820</em> abajo. El golpe está ligeramente descentrado hacia la derecha.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Anverso (derecha):</strong> cruz que divide el campo en cuatro cuarteles: <em>S</em> (superior izquierdo) y <em>M</em> (superior derecho) por Santa Marta; castillo abajo a la izquierda; espada y balas de cañón abajo a la derecha.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Orla:</strong> borde denticulado en ambas caras; el módulo no es un círculo perfecto.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Metal y superficie:</strong> cobre con pátina pardo-anaranjada, grano irregular y picado propio de estas emisiones de emergencia.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Concordancia de tipo:</strong> el conjunto —fecha 1820, fracción 1/4, letras S/M, corona, castillo y trofeo de guerra— corresponde al KM# B4 / Restrepo 104 documentado por Numista.<sup style="font-size:12px;">3</sup>`,
        ),
      ]
    : [
        bullet(
          `<strong style="color:#1c1a15;">Reverse (left):</strong> a simplified crown above the fraction <em>1/4</em>; a three-towered castle at left; a sword and pyramid of cannonballs at right; date <em>1820</em> below. The strike is slightly off-center to the right.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Obverse (right):</strong> a cross divides the field into four quarters: <em>S</em> (upper left) and <em>M</em> (upper right) for Santa Marta; a castle at lower left; a sword and cannonballs at lower right.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Border:</strong> denticulated rim on both faces; the module is not a perfect circle.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Metal and surface:</strong> copper with a brownish-orange patina, irregular grain, and pitting typical of these emergency issues.`,
        ),
        bullet(
          `<strong style="color:#1c1a15;">Type match:</strong> the date 1820, fraction 1/4, letters S/M, crown, castle, and war trophy correspond to the KM# B4 / Restrepo 104 type documented by Numista.<sup style="font-size:12px;">3</sup>`,
        ),
      ];

  const notesTitle = isEs ? 'Notas' : 'Notes';
  const notes = isEs
    ? [
        noteP(
          `1. ${extLink('https://tesorillo.com/articulos/libro/249.htm', 'Tesorillo — «Los cobres de Santa Marta»', true)}: resume a Barriga Villalba (Casa de Moneda) sobre las emisiones de 1813, la Real Orden de 1814, Montalvo (1817) y Sámano (1818), y describe el tipo de 1820 (cuartillos y 2 reales) citando a Buttrey, <em>The Coinage of the Americas</em> (ANS, 1973).`,
        ),
        noteP(
          `2. ${extLink('https://coinvarieties.com/index.php/Santa_Marta_1820_1/4_real', 'CoinVarieties — Santa Marta 1820 1/4 real', true)}: distingue este cobre realista de los ¼ reales coloniales NR/Popayán y de los republicanos; anota que la derrota realista de 1821 acotó la circulación.`,
        ),
        noteP(
          `3. ${extLink('https://en.numista.com/catalogue/pieces18073.html', 'Numista N# 18073', true)}: KM# B4, Hernández #11, Restrepo #104; cobre, 2,15 g, 21 mm; anverso S/M + cruz; reverso corona + 1/4 + 1820; variedad con o sin puntos bajo la espada.`,
        ),
        noteP(
          `4. Krause–Mishler, <em>Standard Catalog of World Coins</em>, KM# B4; Restrepo, <em>Coins of Colombia</em>, #104 / 104.1; Hernández, <em>Monedas y Billetes de Colombia</em>, #11. Números de catálogo; no se citan precios de guía.`,
        ),
        noteP(
          `5. Sedwick y otras casas describen el tipo como cobre realista de necesidad, de golpe tosco y peso variable (p. ej. 1,65–1,9 g en lotes recientes). Es evidencia de tipo, no de autenticidad de este ejemplar.`,
        ),
      ]
    : [
        noteP(
          `1. ${extLink('https://tesorillo.com/articulos/libro/249.htm', 'Tesorillo — “Los cobres de Santa Marta”', false)}: summarizes Barriga Villalba (Casa de Moneda) on the 1813 issues, the 1814 royal order, Montalvo (1817) and Sámano (1818), and describes the 1820 type (cuartillos and 2 reales), citing Buttrey, <em>The Coinage of the Americas</em> (ANS, 1973).`,
        ),
        noteP(
          `2. ${extLink('https://coinvarieties.com/index.php/Santa_Marta_1820_1/4_real', 'CoinVarieties — Santa Marta 1820 1/4 real', false)}: distinguishes this royalist copper from the colonial NR/Popayán quarter-reales and later republican ones; notes that the 1821 royalist defeat limited circulation.`,
        ),
        noteP(
          `3. ${extLink('https://en.numista.com/catalogue/pieces18073.html', 'Numista N# 18073', false)}: KM# B4, Hernández #11, Restrepo #104; copper, 2.15 g, 21 mm; obverse S/M + cross; reverse crown + 1/4 + 1820; variety with or without pellets under the sword.`,
        ),
        noteP(
          `4. Krause–Mishler, <em>Standard Catalog of World Coins</em>, KM# B4; Restrepo, <em>Coins of Colombia</em>, #104 / 104.1; Hernández, <em>Monedas y Billetes de Colombia</em>, #11. Catalog numbers only; no guide prices are quoted.`,
        ),
        noteP(
          `5. Sedwick and other houses describe the type as royalist necessity copper, with a crude strike and variable weight (e.g. 1.65–1.9 g in recent lots). That is type evidence, not authentication of this specimen.`,
        ),
      ];

  const relatedTitle = isEs ? 'Sigue explorando' : 'Keep exploring';
  const related = isEs
    ? [
        ['/coleccion/numismatica/', 'Catálogo de Numismática'],
        ['/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1820/', '1 escudo, Bogotá 1820'],
        ['/coleccion/colombia/cartagena-1-real-1813/', 'Un Real de Cartagena, 1813'],
        ['/coleccion/colombia/', 'Catálogo de Colombia'],
      ]
    : [
        ['/en/collection/numismatics/', 'Numismatics catalog'],
        ['/en/collection/spanish-colonial-coinage/1-escudo-fernando-vii-1820/', '1 escudo, Bogotá 1820'],
        ['/en/collection/colombia/cartagena-1-real-1813/', 'One Real of Cartagena, 1813'],
        ['/en/collection/colombia/', 'Colombia catalog'],
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
              `<a href="${href}" style="display:block; min-height:44px; padding:16px; border:1px solid rgba(231,222,201,0.22); color:#d8d2cd; text-decoration:none; line-height:1.45;">${title}</a>`,
          )
          .join('\n        ')}
      </div>
    </aside>
  </main>

</div>`;
}

const data = {
  path: ES_PATH,
  title: 'Cuartillo Santa Marta 1820 | Notofilia',
  description:
    'Cuartillo de cobre de 1820, acuñado por las autoridades realistas de Santa Marta. KM# B4, Restrepo 104. Colección Notofilia.',
  keywords: [
    'santa marta',
    'cuartillo',
    '1/4 real',
    '1820',
    'KM B4',
    'restrepo 104',
    'hernandez 11',
    'cobre',
    'fernando vii',
    'moneda de sitio',
    'nueva granada',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: '¼ real de Santa Marta, 1820 — cobre realista',
  ogDescription:
    'Cuartillo de necesidad de 1820: corona y 1/4 al reverso, cruz con S y M al anverso. KM# B4. Colección Notofilia.',
  ogImage: `${IMG}.jpg`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Colección Virtual', item: `${SITE}/coleccion/` },
          { '@type': 'ListItem', position: 3, name: 'Numismática', item: `${SITE}/coleccion/numismatica/` },
          { '@type': 'ListItem', position: 4, name: '¼ real Santa Marta 1820', item: `${SITE}${ES_PATH}` },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Santa Marta — ¼ real de cobre, 1820 (KM# B4)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Cuartillo de cobre de necesidad acuñado en 1820 por las autoridades realistas de Santa Marta, Nueva Granada.',
        dateCreated: '1820',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/#website` },
        identifier: 'NF.colombia.santa-marta-1-4-real-1820',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'KM', value: 'B4' },
          { '@type': 'PropertyValue', name: 'Restrepo', value: '104 / 104.1' },
          { '@type': 'PropertyValue', name: 'Hernández', value: '11' },
          { '@type': 'PropertyValue', name: 'Numista', value: 'N# 18073' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.colombia.santa-marta-1-4-real-1820',
    kind: 'coin',
    title: '¼ real de cobre — Santa Marta, 1820',
    subtitle: 'Cuartillo de necesidad · KM# B4 · Restrepo 104',
    dateOrSeries: '1820',
    country: 'Nueva Granada (actual Colombia)',
    issuer: 'Autoridades realistas de Santa Marta, en nombre de Fernando VII',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colección', href: '/coleccion/' },
      { name: 'Numismática', href: '/coleccion/numismatica/' },
      { name: '¼ real Santa Marta 1820' },
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
      denomination: '¼ real (cuartillo)',
      currency: 'Real (Nueva Granada)',
      issuer: 'Autoridades realistas de Santa Marta, en nombre de Fernando VII',
      issueDate: '1820',
      catalogNumber: 'KM# B4 · Restrepo #104 / 104.1 · Hernández #11 · Numista N# 18073',
      composition: 'Cobre',
      material: 'Cobre',
      weight: 'Catálogo ≈ 2,15 g. Medición propia: no confirmado',
      diameter: 'Catálogo ≈ 21 mm. Medición propia: no confirmado',
      edge: 'Liso (Numista)',
      mint: 'Santa Marta (ceca de necesidad)',
      condition: 'Sin encapsular; autenticidad y grado no confirmados por fotografía',
      status: 'circulated',
      printRun: 'no confirmado',
      knownVarieties:
        'Con o sin puntos bajo la espada del anverso (Numista). Variedad de este ejemplar: no confirmado',
      circulationDates: '1820; la plaza realista de Santa Marta cayó en 1821',
      rarityBasis:
        'Cobre de necesidad de una plaza sitiada; golpe tosco. Índice Numista 54 (catálogo secundario)',
      shownSpecimenState:
        'Sin encapsular, reverso a la izquierda y anverso a la derecha; pátina cobriza y golpe descentrado. Autenticidad y grado: no confirmado. Peso y diámetro de este ejemplar: no confirmado',
      factualReviewDate: '2026-08-22',
    },
    render: 'astro-static',
    eyebrow: 'Plaza realista de Santa Marta · Nueva Granada · Fernando VII',
    resourced: true,
    context: {
      historical:
        'Última emisión de Santa Marta (1820): cuartillos y 2 reales de necesidad, en una plaza realista que cayó en 1821.',
      design:
        'Anverso: cruz con S y M, castillo y trofeo de guerra. Reverso: corona sobre 1/4, castillo, espada y balas, fecha 1820.',
      varieties: 'Numista: con o sin puntos bajo la espada del anverso. Este ejemplar: no confirmado',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia',
        note: 'Reverso (1/4, corona, 1820) a la izquierda; anverso (cruz, S, M) a la derecha; cobre picado, golpe descentrado',
      },
      {
        kind: 'catalog',
        label: 'Krause–Mishler KM# B4',
        note: 'Standard Catalog of World Coins — ¼ real, Santa Marta, 1820, cobre',
      },
      {
        kind: 'catalog',
        label: 'Restrepo #104 / 104.1',
        note: 'Coins of Colombia, 1619–2012 (4.ª ed., 2012)',
      },
      {
        kind: 'catalog',
        label: 'Hernández #11',
        note: 'Monedas y Billetes de Colombia (8.ª ed., 2023)',
      },
      {
        kind: 'catalog',
        label: 'Numista N# 18073',
        url: 'https://en.numista.com/catalogue/pieces18073.html',
        note: 'Tipo, peso y diámetro de catálogo; variedad con/sin puntos bajo la espada',
      },
      {
        kind: 'secondary',
        label: 'Tesorillo — Los cobres de Santa Marta (Barriga Villalba / Buttrey)',
        url: 'https://tesorillo.com/articulos/libro/249.htm',
        note: 'Emisiones de 1813, recogidas de 1814 y 1818; tipo de 1820 (cuartillos y 2 reales)',
      },
      {
        kind: 'secondary',
        label: 'CoinVarieties — Santa Marta 1820 1/4 real',
        url: 'https://coinvarieties.com/index.php/Santa_Marta_1820_1/4_real',
        note: 'Contexto realista; circulación acotada por la caída de 1821',
      },
    ],
    related: [
      { href: '/coleccion/numismatica/', title: 'Catálogo de Numismática' },
      {
        href: '/coleccion/moneda-colonial-espanola/1-escudo-fernando-vii-1820/',
        title: '1 escudo, Bogotá 1820',
      },
      { href: '/coleccion/colombia/cartagena-1-real-1813/', title: 'Un Real de Cartagena, 1813' },
    ],
    previous: {
      href: '/coleccion/numismatica/',
      title: 'Catálogo de Numismática',
    },
  },
  legacyFile: 'moneda-colombia-santa-marta-1-4-real-1820.dc.html',
  sourceHash: '',
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Santa Marta ¼ real, 1820 | Notofilia',
      description:
        '1820 copper quarter-real struck by royalist authorities at Santa Marta. KM# B4, Restrepo 104. Notofilia collection.',
      ogTitle: 'Santa Marta ¼ real, 1820 — royalist copper',
      ogDescription:
        '1820 necessity cuartillo: crown and 1/4 on the reverse, cross with S and M on the obverse. KM# B4. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'Copper ¼ real — Santa Marta, 1820',
      eyebrow: 'Royalist Santa Marta · New Granada · Ferdinand VII',
    },
  },
};

data.sourceHash = createHash('sha256').update(JSON.stringify(data)).digest('hex').slice(0, 16);

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image slug: ${SLUG} (${IMG_WIDTH}x${IMG_HEIGHT})`);
