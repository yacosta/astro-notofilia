/**
 * Generator for the Banco de Rio Hacha 5 pesos 1883 PMG proof ficha.
 * Usage: node scripts/write-banco-rio-hacha-ficha.mjs
 *
 * Image dimensions default to a 3:2 landscape until the user-submitted
 * photo is encoded (scripts/process-rio-hacha-slab-image.mjs).
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/';
const EN_PATH = '/en/collection/colombia/banco-de-rio-hacha-5-pesos-1883/';
const IMG = '/uploads/colombia-banco-de-rio-hacha-5-pesos-1883';
const ZOOM_ID = 'colombia-banco-de-rio-hacha-5-pesos-1883';
const OUT = path.join(process.cwd(), 'src/content/catalog/colombia--banco-de-rio-hacha-5-pesos-1883.json');

const SOURCE_CANDIDATES = [
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-rio-hacha-5-pesos-1883.png'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-rio-hacha-5-pesos-1883.jpg'),
  path.join(process.cwd(), 'public/uploads/Colombia-El Banco de Rio Hacha - 5 pesos.png'),
  path.join(process.cwd(), 'public/uploads/Colombia - El Banco de Rio Hacha 5 pesos - Proof.png'),
];

let IMG_WIDTH = 1600;
let IMG_HEIGHT = 1067;
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
  'Pruebas encapsuladas PMG del 5 pesos del Banco de Rio Hacha, 1883: anverso a la izquierda (Pick S819p1, 64 EPQ) y reverso a la derecha (Pick S819p2, 62 Uncirculated)';
const ALT_EN =
  'PMG-encapsulated proofs of the Banco de Rio Hacha 5 pesos, 1883: obverse at left (Pick S819p1, 64 EPQ) and reverse at right (Pick S819p2, 62 Uncirculated)';

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
      ? 'Anverso (izquierda) y reverso (derecha) — Colección de Notofilia.com'
      : 'Obverse (left) and reverse (right) — Notofilia.com Collection';
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
  const backHref = isEs ? '/coleccion/colombia/banca-libre/' : '/en/collection/colombia/free-banking/';
  const backLabel = isEs ? 'Catálogo de Banca Libre' : 'Free Banking catalog';
  const screen = isEs
    ? 'El Banco de Rio Hacha — Cinco Pesos (1883)'
    : 'El Banco de Rio Hacha — Five Pesos (1883)';
  const eyebrow = isEs ? 'Banca Libre &middot; Riohacha &middot; 1883' : 'Free Banking &middot; Riohacha &middot; 1883';
  const subtitle = isEs
    ? 'Cinco Pesos &middot; Pruebas de anverso y reverso &middot; Serie C &middot; febrero de 1883'
    : 'Five Pesos &middot; Face and back proofs &middot; Series C &middot; February 1883';
  const alt = isEs ? ALT_ES : ALT_EN;
  const tab = newTab(isEs);
  const unconfirmed = isEs
    ? '<span style="font-style:italic;">no confirmado</span>'
    : '<span style="font-style:italic;">unconfirmed</span>';

  const rows = isEs
    ? [
        ['País', 'Colombia (Riohacha, Guajira)'],
        ['Entidad Emisora', 'El Banco de Rio Hacha'],
        ['Denominación', 'Cinco Pesos'],
        [
          'Tipo de Emisión',
          'Pruebas de imprenta (front proof / back proof) de un billete al portador en moneda corriente. El ejemplar mostrado no es un billete emitido para circulación.',
        ],
        ['Material', 'Papel'],
        ['Impresor', 'American Bank Note Company, New York'],
        [
          'Fecha impresa',
          'En esta prueba de anverso: febrero de 1883. El Standard Catalog of World Paper Money data la emisión el 1.1.1883.<sup style="font-size:12px;">1</sup>',
        ],
        ['Serie / Número', 'Serie C &middot; S/N C 00000'],
        [
          'Firmas',
          `En estas pruebas las firmas manuscritas no están aplicadas. Firmas de los billetes emitidos: ${unconfirmed}.`,
        ],
        ['Dimensiones', unconfirmed],
        ['Referencia de Catálogo', 'Pick S819p1 (anverso) / S819p2 (reverso)'],
        ['Tirada', unconfirmed],
        [
          'Variedades conocidas',
          'Pruebas de anverso y reverso (esta ficha); 1 peso Pick S818 / PPH 1108;<sup style="font-size:12px;">2,3</sup> 10 pesos Pick S819A (pruebas).<sup style="font-size:12px;">4</sup> Otras: ' +
            unconfirmed,
        ],
        [
          'Fechas de circulación',
          `Fuentes secundarias sitúan la creación del banco el 1.&ordm; de abril de 1882 (capital autorizado 50.000 pesos) y, en otro pasaje del mismo artículo, en 1885 con 15.000 pesos.<sup style="font-size:12px;">5</sup> Gómez describe una única emisión en 1883.<sup style="font-size:12px;">2</sup> Estas pruebas no circularon. Duración de la entidad: efímera; ${unconfirmed} en fuente primaria.`,
        ],
        [
          'Base de la rareza',
          `Pruebas de archivo ABNC de un banco de vida breve en La Guajira.<sup style="font-size:12px;">2</sup> Población PMG de S819p: ${unconfirmed}. Un ejemplar distinto (colección Eldorado, lote 10429) se certificó 65 EPQ; no es este par 64 EPQ / 62.<sup style="font-size:12px;">6</sup>`,
        ],
        [
          'Estado del ejemplar mostrado',
          'Par de pruebas encapsuladas por separado: anverso PMG 64 EPQ Choice Uncirculated (FRONT PROOF, Pick S819p1, Serie C, S/N C 00000, 1883) y reverso PMG 62 Uncirculated (BACK PROOF, Pick S819p2, ND 1883).',
        ],
        ['Fecha de última revisión factual', '21 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Colombia (Riohacha, Guajira)'],
        ['Issuing Entity', 'El Banco de Rio Hacha'],
        ['Denomination', 'Five Pesos'],
        [
          'Type of Issue',
          'Printer’s proofs (front proof / back proof) of a bearer note in current money. The specimen shown is not an issued circulating note.',
        ],
        ['Material', 'Paper'],
        ['Printer', 'American Bank Note Company, New York'],
        [
          'Printed date',
          'On this face proof: February 1883. The Standard Catalog of World Paper Money dates the issue 1.1.1883.<sup style="font-size:12px;">1</sup>',
        ],
        ['Series / Number', 'Series C &middot; S/N C 00000'],
        [
          'Signatures',
          `These proofs do not carry applied manuscript signatures. Signatures on issued notes: ${unconfirmed}.`,
        ],
        ['Dimensions', unconfirmed],
        ['Catalog Reference', 'Pick S819p1 (obverse) / S819p2 (reverse)'],
        ['Print run', unconfirmed],
        [
          'Known varieties',
          'Face and back proofs (this record); 1 peso Pick S818 / PPH 1108;<sup style="font-size:12px;">2,3</sup> 10 pesos Pick S819A (proofs).<sup style="font-size:12px;">4</sup> Others: ' +
            unconfirmed,
        ],
        [
          'Circulation dates',
          `Secondary sources place the bank’s creation on 1 April 1882 (authorized capital 50,000 pesos) and, in another passage of the same article, in 1885 with 15,000 pesos.<sup style="font-size:12px;">5</sup> Gómez describes a single 1883 issue.<sup style="font-size:12px;">2</sup> These proofs did not circulate. Length of operations: ephemeral; ${unconfirmed} in a primary source.`,
        ],
        [
          'Basis of rarity',
          `ABNC archive proofs of a short-lived Guajira bank.<sup style="font-size:12px;">2</sup> PMG population for S819p: ${unconfirmed}. A different specimen (Eldorado Collection, lot 10429) was certified 65 EPQ; it is not this 64 EPQ / 62 pair.<sup style="font-size:12px;">6</sup>`,
        ],
        [
          'State of the specimen shown',
          'Pair of separately encapsulated proofs: obverse PMG 64 EPQ Choice Uncirculated (FRONT PROOF, Pick S819p1, Series C, S/N C 00000, 1883) and reverse PMG 62 Uncirculated (BACK PROOF, Pick S819p2, ND 1883).',
        ],
        ['Date of last factual review', '21 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          '<strong style="color:#1c1a15;">Un banco privado en Riohacha:</strong> El Banco de Rio Hacha operó en el territorio de La Guajira, en el norte de Colombia. Gómez lo describe como una entidad de única emisión en 1883, con billetes grabados por American Bank Note Co., New York.<sup style="font-size:12px;">2</sup> No debe confundirse con el posterior Banco Dugand (emisiones de 1919–1922).',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Fechas de fundación en conflicto:</strong> un artículo de historia local, citando a González Zubiría, afirma que el banco se creó el 1.&ordm; de abril de 1882 con capital autorizado de 50.000 pesos y licencia para funcionar con algo más de 15.000, y en el mismo texto sitúa la fundación en 1885 con 15.000 pesos.<sup style="font-size:12px;">5</sup> Son fuentes secundarias incompatibles entre sí; no se aplana aquí esa contradicción. La vida de la entidad se describe como efímera.',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">La familia de 1883:</strong> el Standard Catalog agrupa el 5 pesos como Pick S819p (negro sobre fondo marrón; armas a la izquierda, Simón Bolívar al centro, mujer con rueda a la derecha; serie C; reverso marrón; ABNC; prueba).<sup style="font-size:12px;">1</sup> El 1 peso es Pick S818 (Bolívar a la izquierda, Nariño a la derecha, PPH 1108);<sup style="font-size:12px;">2,3</sup> el 10 pesos aparece como Pick S819A.<sup style="font-size:12px;">4</sup> Esta ficha documenta solo el par de pruebas de 5 pesos.',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Un par de archivo, no un billete de curso:</strong> PMG cataloga el anverso como FRONT PROOF (Pick S819p1, 1883) a 64 EPQ Choice Uncirculated y el reverso como BACK PROOF (Pick S819p2, ND 1883) a 62 Uncirculated, con serial de ceros y serie C. La fecha impresa en esta prueba de anverso es febrero de 1883, distinta de la fecha de catálogo 1.1.1883.<sup style="font-size:12px;">1</sup> Un ejemplar distinto de S819p, certificado 65 EPQ, formó parte del lote 10429 de la colección Eldorado; no es esta pieza.<sup style="font-size:12px;">6</sup>',
          true,
        ),
      ]
    : [
        sectionP(
          '<strong style="color:#1c1a15;">A private bank in Riohacha:</strong> El Banco de Rio Hacha operated in the Guajira territory of northern Colombia. Gómez describes a single 1883 issue, engraved by American Bank Note Co., New York.<sup style="font-size:12px;">2</sup> It should not be confused with the later Banco Dugand (1919–1922 issues).',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">Conflicting founding dates:</strong> a local-history article, citing González Zubiría, says the bank was created on 1 April 1882 with authorized capital of 50,000 pesos and a license to operate with a little over 15,000, and in the same text places the founding in 1885 with 15,000 pesos.<sup style="font-size:12px;">5</sup> Those secondary statements conflict; they are not flattened here. The institution’s life is described as ephemeral.',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">The 1883 family:</strong> the Standard Catalog lists the 5 pesos as Pick S819p (black on brown underprint; arms at left, Simón Bolívar at center, woman with a wheel at right; series C; brown back; ABNC; proof).<sup style="font-size:12px;">1</sup> The 1 peso is Pick S818 (Bolívar at left, Nariño at right, PPH 1108);<sup style="font-size:12px;">2,3</sup> the 10 pesos appears as Pick S819A.<sup style="font-size:12px;">4</sup> This record documents only the 5-peso proof pair.',
        ),
        sectionP(
          '<strong style="color:#1c1a15;">An archive pair, not a circulating note:</strong> PMG catalogs the obverse as FRONT PROOF (Pick S819p1, 1883) at 64 EPQ Choice Uncirculated and the reverse as BACK PROOF (Pick S819p2, ND 1883) at 62 Uncirculated, with zero serials and series C. The date printed on this face proof is February 1883, distinct from the catalog date 1.1.1883.<sup style="font-size:12px;">1</sup> A different S819p specimen, certified 65 EPQ, appeared as Eldorado Collection lot 10429; it is not this piece.<sup style="font-size:12px;">6</sup>',
          true,
        ),
      ];

  const details = isEs
    ? [
        bullet(
          '<strong style="color:#1c1a15;">Texto principal:</strong> «EL BANCO DE RIO HACHA» y la promesa de pagar al portador cinco pesos en moneda corriente, con la fecha impresa de febrero de 1883.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Viñeta izquierda:</strong> escudo con cóndor, y la leyenda «Serie C».',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Viñeta central:</strong> retrato circular de un militar de uniforme (Simón Bolívar, según el catálogo).<sup style="font-size:12px;">1</sup> Debajo, el serial rojo «00000».',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Viñeta derecha:</strong> figura femenina sentada junto a una rueda (industria o comercio).',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Identificadores de prueba:</strong> dos orificios de cancelación en el centro inferior del anverso; serial de ceros; encapsulados PMG separados para cada cara.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverso:</strong> impresión monocroma pardo-sepia con guillochés simétricos, óvalo central en blanco, «EL CAJERO» sobre ese óvalo y numerales «5» a ambos lados. Pie de imprenta «AMERICAN BANK NOTE COMPANY, NEW YORK».',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Colorido:</strong> anverso en negro sobre papel crema; reverso en marrón.<sup style="font-size:12px;">1</sup>',
        ),
      ]
    : [
        bullet(
          '<strong style="color:#1c1a15;">Main text:</strong> “EL BANCO DE RIO HACHA” and the promise to pay the bearer five pesos in current money, with the printed date February 1883.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Left vignette:</strong> coat of arms with a condor, and the legend “Serie C”.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Center vignette:</strong> circular portrait of a man in military uniform (Simón Bolívar, per the catalog).<sup style="font-size:12px;">1</sup> Below it, the red serial “00000”.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Right vignette:</strong> a seated woman beside a wheel (industry or commerce).',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Proof identifiers:</strong> two cancellation holes at the lower center of the face; zero serials; separate PMG holders for each face.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverse:</strong> monochrome brown-sepia printing with symmetrical guilloche, a blank central oval, “EL CAJERO” above that oval, and numerals “5” at both sides. Imprint “AMERICAN BANK NOTE COMPANY, NEW YORK”.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Color:</strong> obverse in black on cream paper; reverse in brown.<sup style="font-size:12px;">1</sup>',
        ),
      ];

  const notes = isEs
    ? [
        noteP(
          `1. <a href="https://www.realbanknotes.com/banknote/73133-Colombia-pS819p-5-Pesos-from-1883" target="_blank" rel="noopener noreferrer">RealBanknotes / Standard Catalog of World Paper Money, Pick S819p${tab}</a>: 1.1.1883; negro sobre fondo marrón; armas a la izquierda, Simón Bolívar al centro, mujer con rueda a la derecha; serie C; reverso marrón; impresor ABNC; prueba.`,
        ),
        noteP(
          `2. <a href="https://www.mascoleccionismo.com/publicaciones/JAG/JAG-133_may2014.pdf" target="_blank" rel="noopener noreferrer">José Arcelio Gómez, Boletín Digital Numismático n.&deg; 133 (mayo 2014)${tab}</a>: Banco de Rio Hacha en La Guajira; única emisión 1883; ABNC; el 1 peso (PPH 1108) con Nariño a la derecha y Bolívar a la izquierda —denominación distinta de este 5 pesos.`,
        ),
        noteP(
          `3. <a href="https://www.realbanknotes.com/banknote/73131-Colombia-pS818p-1-Peso-from-1883" target="_blank" rel="noopener noreferrer">RealBanknotes, Pick S818p${tab}</a>: 1 peso, 1.1.1883, serie B, ABNC (prueba). No es el ejemplar de esta ficha.`,
        ),
        noteP(
          `4. <a href="https://www.realbanknotes.com/banknote/73135-Colombia-pS819Ap-10-Pesos-from-1883" target="_blank" rel="noopener noreferrer">RealBanknotes, Pick S819Ap${tab}</a>: 10 pesos, 1.1.1883, serie D, ABNC (prueba). No es el ejemplar de esta ficha.`,
        ),
        noteP(
          `5. <a href="http://maicaoaldia.blogspot.com/2011/12/historia-de-riohacha-capital-de-la.html" target="_blank" rel="noopener noreferrer">Alejandro Rutto Martínez, «Historia de Riohacha», Maicao al día (2011)${tab}</a>, citando a González Zubiría (2005): fundación el 1.&ordm; de abril de 1882 (50.000 pesos autorizados) y, en el mismo artículo, 1885 con 15.000 pesos. Fuentes secundarias en conflicto.`,
        ),
        noteP(
          `6. <a href="https://www.pmgnotes.com/news/article/6302/January-Auction-to-Feature-PMG-Graded-Notes-From-the-Eldorado-Collection/" target="_blank" rel="noopener noreferrer">PMG, «January Auction to Feature PMG-Graded Notes From the Eldorado Collection» (19 diciembre 2017)${tab}</a>: lote 10429, Banco de Rio Hacha, Pick S819p, 1883, 5 pesos, prueba, PMG 65 EPQ. Ejemplar distinto de este par 64 EPQ / 62.`,
          true,
        ),
      ]
    : [
        noteP(
          `1. <a href="https://www.realbanknotes.com/banknote/73133-Colombia-pS819p-5-Pesos-from-1883" target="_blank" rel="noopener noreferrer">RealBanknotes / Standard Catalog of World Paper Money, Pick S819p${tab}</a>: 1.1.1883; black on brown underprint; arms at left, Simón Bolívar at center, woman with a wheel at right; series C; brown back; printer ABNC; proof.`,
        ),
        noteP(
          `2. <a href="https://www.mascoleccionismo.com/publicaciones/JAG/JAG-133_may2014.pdf" target="_blank" rel="noopener noreferrer">José Arcelio Gómez, Boletín Digital Numismático no. 133 (May 2014)${tab}</a>: Banco de Rio Hacha in La Guajira; a single 1883 issue; ABNC; the 1 peso (PPH 1108) with Nariño at right and Bolívar at left —a different denomination from this 5 pesos.`,
        ),
        noteP(
          `3. <a href="https://www.realbanknotes.com/banknote/73131-Colombia-pS818p-1-Peso-from-1883" target="_blank" rel="noopener noreferrer">RealBanknotes, Pick S818p${tab}</a>: 1 peso, 1.1.1883, series B, ABNC (proof). Not the specimen on this record.`,
        ),
        noteP(
          `4. <a href="https://www.realbanknotes.com/banknote/73135-Colombia-pS819Ap-10-Pesos-from-1883" target="_blank" rel="noopener noreferrer">RealBanknotes, Pick S819Ap${tab}</a>: 10 pesos, 1.1.1883, series D, ABNC (proof). Not the specimen on this record.`,
        ),
        noteP(
          `5. <a href="http://maicaoaldia.blogspot.com/2011/12/historia-de-riohacha-capital-de-la.html" target="_blank" rel="noopener noreferrer">Alejandro Rutto Martínez, “Historia de Riohacha,” Maicao al día (2011)${tab}</a>, citing González Zubiría (2005): founding on 1 April 1882 (50,000 pesos authorized) and, in the same article, 1885 with 15,000 pesos. Conflicting secondary sources.`,
        ),
        noteP(
          `6. <a href="https://www.pmgnotes.com/news/article/6302/January-Auction-to-Feature-PMG-Graded-Notes-From-the-Eldorado-Collection/" target="_blank" rel="noopener noreferrer">PMG, “January Auction to Feature PMG-Graded Notes From the Eldorado Collection” (19 December 2017)${tab}</a>: lot 10429, Banco de Rio Hacha, Pick S819p, 1883, 5 pesos, proof, PMG 65 EPQ. A different specimen from this 64 EPQ / 62 pair.`,
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

          <h1 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(28px,4vw,44px); line-height:1.08; letter-spacing:0.01em; color:#1c1a15; margin:0 0 12px;">El Banco de Rio Hacha</h1>

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
  title: 'Cinco Pesos, Banco de Rio Hacha (1883) | Notofilia',
  description:
    'Pruebas PMG 64 EPQ / 62 del 5 pesos del Banco de Rio Hacha, 1883 (Pick S819p). Colección Notofilia.',
  keywords: [
    'banco de rio hacha',
    'riohacha',
    'cinco pesos 1883',
    'pick s819',
    'prueba abnc',
    'banca libre colombia',
    'american bank note company',
    'pmg 64 epq',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Banco de Rio Hacha — 5 pesos, prueba 1883',
  ogDescription: 'Pruebas de anverso y reverso del 5 pesos de 1883, Pick S819p, PMG 64 EPQ / 62. Colección Notofilia.',
  ogImage: `${IMG}.jpg`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Colombia', item: `${SITE}/coleccion/colombia/` },
          { '@type': 'ListItem', position: 3, name: 'Banca Libre', item: `${SITE}/coleccion/colombia/banca-libre/` },
          {
            '@type': 'ListItem',
            position: 4,
            name: 'El Banco de Rio Hacha — Cinco Pesos (1883)',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'El Banco de Rio Hacha — Pruebas de Cinco Pesos (1883)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Par de pruebas de anverso y reverso del billete de 5 pesos del Banco de Rio Hacha, 1883, Pick S819p1/S819p2, PMG 64 EPQ y 62 Uncirculated.',
        dateCreated: '1883-02',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/colombia/banca-libre/#page` },
        identifier: 'NF.colombia.banco-de-rio-hacha-5-pesos-1883',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: 'S819p1 / S819p2' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'American Bank Note Company, New York' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'PMG 64 EPQ / 62 Uncirculated (pruebas)' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.colombia.banco-de-rio-hacha-5-pesos-1883',
    kind: 'banknote',
    title: 'El Banco de Rio Hacha',
    subtitle: 'Cinco Pesos · Pruebas de anverso y reverso · Serie C · febrero de 1883',
    dateOrSeries: 'Serie C, febrero de 1883',
    country: 'Colombia (Riohacha, Guajira)',
    issuer: 'El Banco de Rio Hacha',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colombia', href: '/coleccion/colombia/' },
      { name: 'Banca Libre', href: '/coleccion/colombia/banca-libre/' },
      { name: 'El Banco de Rio Hacha — Cinco Pesos (1883)' },
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
      denomination: 'Cinco Pesos',
      currency: 'Peso colombiano (moneda corriente)',
      issuer: 'El Banco de Rio Hacha',
      printer: 'American Bank Note Company, New York',
      issueDate: 'febrero de 1883 (impreso en esta prueba); catálogo 1.1.1883',
      series: 'Serie C',
      serialNumber: 'C 00000',
      catalogNumber: 'Pick S819p1 (anverso) / S819p2 (reverso)',
      material: 'Papel',
      dimensions: 'no confirmado',
      condition: 'PMG 64 EPQ / 62 Uncirculated',
      gradingService: 'PMG',
      status: 'proof',
      printRun: 'no confirmado',
      knownVarieties:
        'Pruebas p1/p2 (esta ficha); 1 peso Pick S818 / PPH 1108; 10 pesos Pick S819A. Otras: no confirmado',
      circulationDates:
        'Fuentes secundarias: creación 1 abril 1882 (50.000 pesos) o 1885 (15.000 pesos). Gómez: única emisión 1883. Estas pruebas no circularon. Duración: efímera; no confirmado en fuente primaria.',
      rarityBasis:
        'Pruebas ABNC de un banco de vida breve. Población PMG de S819p: no confirmado. Eldorado lote 10429 (65 EPQ) es otro ejemplar.',
      shownSpecimenState:
        'Par de pruebas encapsuladas por separado: anverso PMG 64 EPQ Choice Uncirculated (FRONT PROOF S819p1, Serie C, C 00000) y reverso PMG 62 Uncirculated (BACK PROOF S819p2, ND 1883)',
      factualReviewDate: '2026-08-21',
    },
    render: 'astro-static',
    eyebrow: 'Banca Libre · Riohacha · 1883',
    resourced: true,
    context: {
      historical:
        'El Banco de Rio Hacha operó en La Guajira. Gómez describe una única emisión de 1883 impresa por ABNC. Fuentes secundarias locales dan fechas de fundación contradictorias (1 abril 1882 / 1885). No debe confundirse con el Banco Dugand de 1919–1922.',
      design:
        'Anverso en negro: armas con cóndor a la izquierda, Bolívar al centro, mujer con rueda a la derecha, serie C y serial 00000. Reverso marrón con guilloché, óvalo en blanco, «EL CAJERO» y pie ABNC. Fecha impresa en esta prueba: febrero de 1883.',
      varieties:
        'Pick S818 (1 peso), S819 (5 pesos, esta ficha) y S819A (10 pesos). Esta ficha documenta las pruebas S819p1/S819p2. Otras: no confirmado.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (PMG S819p1 / S819p2)',
        note: 'Etiquetas PMG 64 EPQ FRONT PROOF y 62 Uncirculated BACK PROOF, serie C, serial C 00000, fecha impresa febrero 1883, pie ABNC, dos orificios de cancelación',
      },
      {
        kind: 'printer',
        label: 'Imprenta American Bank Note Company, New York (pie de imprenta en la prueba de reverso)',
        note: 'Visible en el ejemplar; no hay ficha de archivo ABNC citada aquí para esta plancha',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes / Standard Catalog of World Paper Money — Pick S819p',
        url: 'https://www.realbanknotes.com/banknote/73133-Colombia-pS819p-5-Pesos-from-1883',
        note: '1.1.1883; negro sobre fondo marrón; armas, Bolívar, mujer con rueda; serie C; reverso marrón; ABNC; prueba',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes — Pick S818p (1 peso del mismo banco)',
        url: 'https://www.realbanknotes.com/banknote/73131-Colombia-pS818p-1-Peso-from-1883',
        note: 'Otra denominación de 1883; no es este ejemplar de 5 pesos',
      },
      {
        kind: 'catalog',
        label: 'RealBanknotes — Pick S819Ap (10 pesos del mismo banco)',
        url: 'https://www.realbanknotes.com/banknote/73135-Colombia-pS819Ap-10-Pesos-from-1883',
        note: 'Otra denominación de 1883; no es este ejemplar de 5 pesos',
      },
      {
        kind: 'auction',
        label: 'PMG — lote 10429 de la colección Eldorado, Pick S819p 65 EPQ (2018)',
        url: 'https://www.pmgnotes.com/news/article/6302/January-Auction-to-Feature-PMG-Graded-Notes-From-the-Eldorado-Collection/',
        note: 'Mismo tipo S819p, grado distinto (65 EPQ); no es este par 64 EPQ / 62',
      },
      {
        kind: 'secondary',
        label: 'José Arcelio Gómez, Boletín Digital Numismático n.º 133 (mayo 2014)',
        url: 'https://www.mascoleccionismo.com/publicaciones/JAG/JAG-133_may2014.pdf',
        note: 'Única emisión 1883 en La Guajira; ABNC; describe el 1 peso PPH 1108, no este 5 pesos',
      },
      {
        kind: 'secondary',
        label: 'Alejandro Rutto Martínez, «Historia de Riohacha», Maicao al día (2011)',
        url: 'http://maicaoaldia.blogspot.com/2011/12/historia-de-riohacha-capital-de-la.html',
        note: 'Cita a González Zubiría (2005): fundación 1 abril 1882 (50.000) y, en el mismo artículo, 1885 (15.000). Fuentes en conflicto',
      },
    ],
    related: [
      { href: '/coleccion/colombia/banca-libre/', title: 'Catálogo de la Banca Libre Colombiana' },
      { href: '/coleccion/colombia/banco-hipotecario-5-pesos-1881/', title: 'El Banco Hipotecario — Cinco Pesos (1881)' },
      { href: '/coleccion/colombia/banco-internacional-1-peso-1884/', title: 'El Banco Internacional — Un Peso (1884)' },
    ],
  },
  legacyFile: 'billete-colombia-banco-de-rio-hacha-5-pesos-1883.dc.html',
  sourceHash: createHash('sha1').update('banco-de-rio-hacha-5-pesos-1883-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Five Pesos, Banco de Rio Hacha (1883) | Notofilia',
      description:
        'PMG 64 EPQ / 62 proofs of the Banco de Rio Hacha 5 pesos, 1883 (Pick S819p). Notofilia collection.',
      ogTitle: 'Banco de Rio Hacha — 5 pesos proof, 1883',
      ogDescription: 'Face and back proofs of the 1883 5 pesos, Pick S819p, PMG 64 EPQ / 62. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'El Banco de Rio Hacha',
      eyebrow: 'Free Banking · Riohacha · 1883',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
