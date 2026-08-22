/**
 * Generator for the Banco de la República 10 pesos oro 20 July 1943 ficha
 * (Pick 389b, PMG 50 EPQ, Serie N 6813011).
 *
 * Usage: node scripts/write-colombia-10-pesos-oro-1943-ficha.mjs
 *
 * Image dimensions default until the user-submitted slab photo is encoded
 * (scripts/process-colombia-10-pesos-oro-1943-image.mjs).
 */
import { createHash } from 'node:crypto';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/colombia/banco-de-la-republica-10-pesos-oro-1943/';
const EN_PATH = '/en/collection/colombia/banco-de-la-republica-10-pesos-oro-1943/';
const IMG = '/uploads/colombia-banco-de-la-republica-10-pesos-oro-1943';
const ZOOM_ID = 'colombia-banco-de-la-republica-10-pesos-oro-1943';
const OUT = path.join(process.cwd(), 'src/content/catalog/colombia--banco-de-la-republica-10-pesos-oro-1943.json');

const SOURCE_CANDIDATES = [
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-10-pesos-oro-1943.png'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-10-pesos-oro-1943.jpg'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-10-pesos-oro-1943-source.png'),
  path.join(process.cwd(), 'public/uploads/colombia-banco-de-la-republica-10-pesos-oro-1943-source.jpg'),
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
  'Billete encapsulado PMG de 10 pesos oro del Banco de la República, 20 de julio de 1943, Pick 389b, Serie N 6813011, grado 50 EPQ: anverso arriba con retrato de Antonio Nariño y reverso abajo con medallón de la Libertad';
const ALT_EN =
  'PMG-encapsulated Banco de la República 10 pesos oro of 20 July 1943, Pick 389b, Series N 6813011, grade 50 EPQ: obverse at top with Antonio Nariño and reverse below with the Liberty medallion';

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
    ? 'Banco de la República — Diez Pesos Oro (1943)'
    : 'Banco de la República — Ten Pesos Oro (1943)';
  const eyebrow = isEs
    ? 'Pesos oro &middot; Bogotá, Colombia &middot; 1943'
    : 'Pesos oro &middot; Bogotá, Colombia &middot; 1943';
  const subtitle = isEs
    ? 'Diez Pesos Oro &middot; 20 de julio de 1943 &middot; Retrato de Antonio Nariño'
    : 'Ten Pesos Oro &middot; 20 July 1943 &middot; Portrait of Antonio Nariño';
  const alt = isEs ? ALT_ES : ALT_EN;
  const tab = newTab(isEs);
  const unconfirmed = isEs
    ? '<span style="font-style:italic;">no confirmado</span>'
    : '<span style="font-style:italic;">unconfirmed</span>';
  const narinoHref = isEs
    ? '/coleccion/colombia/perfil-antonio-narino/'
    : '/en/collection/colombia/profile-antonio-narino/';
  const laterHref = isEs
    ? '/coleccion/colombia/banco-de-la-republica-10-pesos-oro/'
    : '/en/collection/colombia/banco-de-la-republica-10-pesos-oro/';

  const rows = isEs
    ? [
        ['País', 'Colombia'],
        ['Entidad Emisora', 'El Banco de la República, Bogotá, Colombia'],
        ['Denominación', 'Diez Pesos Oro'],
        ['Tipo de Emisión', 'Billete de circulación del tipo Pick 389 (pesos oro), impreso por American Bank Note Company.'],
        ['Material', 'Papel'],
        ['Impresor', 'American Bank Note Company'],
        [
          'Fecha impresa',
          '20 de julio de 1943. Foronum data esta fecha para la emisión de 1943 del tipo P#389.<sup style="font-size:12px;">1</sup>',
        ],
        ['Serie / Número', 'Serie N &middot; S/N 6813011'],
        [
          'Firmas',
          `Títulos visibles de Gerente y Secretario. Banknote World Educational atribuye Julio Caro y Luis Ángel Arango al Pick 389b.2 de 20.7.1944 (también Serie N).<sup style="font-size:12px;">2</sup> Nombres en <em>este</em> ejemplar de 1943: ${unconfirmed}.`,
        ],
        [
          'Dimensiones',
          'Catálogos secundarios: 140 &times; 70 mm.<sup style="font-size:12px;">1,2</sup> Medición directa de este ejemplar encapsulado: ' +
            unconfirmed,
        ],
        ['Marca de agua', 'Ninguna, según la ficha educativa del tipo 389b.2 (1944).<sup style="font-size:12px;">2</sup>'],
        ['Referencia de Catálogo', 'Pick 389b (esta pieza, según etiqueta PMG; tipo 1943–47)'],
        ['Tirada', unconfirmed],
        [
          'Variedades conocidas',
          'Pick 389 tipo 1941–1963 (ABNC);<sup style="font-size:12px;">3</sup> fechas de 20.7.1941, 20.7.1943, 20.7.1944, 1.1.1945, 7.8.1947, 12.10.1949, 1.1.1950 y 2.1.1963 en Foronum;<sup style="font-size:12px;">1</sup> prueba uniface Pick 389p (Heritage, otro ejemplar);<sup style="font-size:12px;">4</sup> rediseño Thomas De La Rue Pick 400 (1953–1961), documentado en otra ficha.<sup style="font-size:12px;">5</sup> Sufijos 389a y posteriores, salvo el 389b de esta etiqueta: ' +
            unconfirmed,
        ],
        [
          'Fechas de circulación',
          `La Ley 82 de 1931 dio poder liberatorio al billete del Banco de la República como moneda nacional.<sup style="font-size:12px;">6</sup> El tipo Pick 389 se data 1941–1963.<sup style="font-size:12px;">3</sup> Fecha de desmonetización de esta denominación: ${unconfirmed}.`,
        ],
        [
          'Base de la rareza',
          `Foronum califica la fecha 1943 como «muy escasa».<sup style="font-size:12px;">1</sup> Población PMG de Pick 389b: ${unconfirmed}. Este encapsulado es 50 EPQ (cert. 8011911-013), distinto de otros 389b vistos en el mercado.`,
        ],
        [
          'Estado del ejemplar mostrado',
          'Par encapsulado PMG: anverso y reverso en tenedores separados. Etiqueta: Colombia, Banco de la República, Pick 389b (dated 1943-47), 10 Pesos Oro, S/N N 6813011, ABNC, 50 EPQ. Certificado 8011911-013.',
        ],
        ['Fecha de última revisión factual', '22 de agosto de 2026', true],
      ]
    : [
        ['Country', 'Colombia'],
        ['Issuing Entity', 'El Banco de la República, Bogotá, Colombia'],
        ['Denomination', 'Ten Pesos Oro'],
        [
          'Type of Issue',
          'Circulating note of Pick type 389 (pesos oro), printed by American Bank Note Company.',
        ],
        ['Material', 'Paper'],
        ['Printer', 'American Bank Note Company'],
        [
          'Printed date',
          '20 July 1943. Foronum dates the 1943 issue of type P#389 to this day.<sup style="font-size:12px;">1</sup>',
        ],
        ['Series / Number', 'Series N &middot; S/N 6813011'],
        [
          'Signatures',
          `Visible titles Gerente and Secretario. Banknote World Educational attributes Julio Caro and Luis Ángel Arango to Pick 389b.2 of 20.7.1944 (also Series N).<sup style="font-size:12px;">2</sup> Names on <em>this</em> 1943 specimen: ${unconfirmed}.`,
        ],
        [
          'Dimensions',
          'Secondary catalogs: 140 &times; 70 mm.<sup style="font-size:12px;">1,2</sup> Direct measurement of this encapsulated specimen: ' +
            unconfirmed,
        ],
        [
          'Watermark',
          'None, per the educational record for type 389b.2 (1944).<sup style="font-size:12px;">2</sup>',
        ],
        ['Catalog Reference', 'Pick 389b (this piece, per the PMG label; type dated 1943–47)'],
        ['Print run', unconfirmed],
        [
          'Known varieties',
          'Pick 389 type 1941–1963 (ABNC);<sup style="font-size:12px;">3</sup> Foronum dates 20.7.1941, 20.7.1943, 20.7.1944, 1.1.1945, 7.8.1947, 12.10.1949, 1.1.1950 and 2.1.1963;<sup style="font-size:12px;">1</sup> uniface proof Pick 389p (Heritage, a different specimen);<sup style="font-size:12px;">4</sup> Thomas De La Rue redesign Pick 400 (1953–1961), documented on another record.<sup style="font-size:12px;">5</sup> Suffixes 389a and later, other than the 389b on this label: ' +
            unconfirmed,
        ],
        [
          'Circulation dates',
          `Law 82 of 1931 gave Banco de la República notes legal-tender status as national currency.<sup style="font-size:12px;">6</sup> Pick type 389 is dated 1941–1963.<sup style="font-size:12px;">3</sup> Demonetization date for this denomination: ${unconfirmed}.`,
        ],
        [
          'Basis of rarity',
          `Foronum rates the 1943 date “very scarce.”<sup style="font-size:12px;">1</sup> PMG population for Pick 389b: ${unconfirmed}. This holder is 50 EPQ (cert. 8011911-013), distinct from other 389b notes seen in the market.`,
        ],
        [
          'State of the specimen shown',
          'PMG-encapsulated pair: obverse and reverse in separate holders. Label: Colombia, Banco de la República, Pick 389b (dated 1943-47), 10 Pesos Oro, S/N N 6813011, ABNC, 50 EPQ. Certificate 8011911-013.',
        ],
        ['Date of last factual review', '22 August 2026', true],
      ];

  const contextTitle = isEs ? 'Contexto Histórico y de Emisión' : 'Historical and Issue Context';
  const detailsTitle = isEs ? 'Detalles Clave Visibles en el Billete' : 'Key Details Visible on the Banknote';
  const notesTitle = isEs ? 'Notas' : 'Notes';

  const context = isEs
    ? [
        sectionP(
          `<strong style="color:#1c1a15;">Un diez pesos oro de posguerra temprana:</strong> El Banco de la República emitió billetes en pesos oro desde 1923. La Ley 25 de 1923 los trató como moneda representativa del peso de oro; la Ley 82 de 1931 les concedió poder liberatorio como moneda nacional.<sup style="font-size:12px;">6</sup> Este ejemplar, fechado el 20 de julio de 1943 —día de la Independencia—, pertenece al tipo ABNC con retrato de <a href="${narinoHref}">Antonio Nariño</a>.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Pick 389, no Pick 400:</strong> el Standard Catalog agrupa el 10 pesos oro ABNC de 1941–1963 como Pick 389.<sup style="font-size:12px;">3</sup> PMG asigna a esta pieza el sufijo 389b (1943–47). El rediseño de Thomas De La Rue —Nariño con Mercurio y el edificio del Banco en Cali— es Pick 400 (1953–1961) y se documenta en la <a href="${laterHref}">ficha de 1949–1961</a>.<sup style="font-size:12px;">5</sup> No deben mezclarse.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">La familia de fechas:</strong> Foronum lista ocho fechas del tipo P#389, de 20.7.1941 a 2.1.1963.<sup style="font-size:12px;">1</sup> Banknote World Educational describe el 389b.2 de 20.7.1944 (Serie N; 140 &times; 70 mm; ABNC; Nariño de uniforme; sello de la Libertad al reverso).<sup style="font-size:12px;">2</sup> Heritage subastó una prueba uniface Pick 389p, PMG 65 EPQ —otro ejemplar.<sup style="font-size:12px;">4</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Este encapsulado:</strong> PMG 50 About Uncirculated EPQ, certificado 8011911-013, Serie N, serial 6813011. La etiqueta imprime «Pick# 389b (dated 1943-47)». No es la prueba de Heritage ni un 389b de otra fecha.`,
          true,
        ),
      ]
    : [
        sectionP(
          `<strong style="color:#1c1a15;">An early postwar ten pesos oro:</strong> Banco de la República issued pesos-oro notes from 1923. Law 25 of 1923 treated them as representative of the gold peso; Law 82 of 1931 gave them legal-tender status as national currency.<sup style="font-size:12px;">6</sup> This specimen, dated 20 July 1943 —Independence Day— belongs to the ABNC type with a portrait of <a href="${narinoHref}">Antonio Nariño</a>.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">Pick 389, not Pick 400:</strong> the Standard Catalog groups the ABNC 10 pesos oro of 1941–1963 as Pick 389.<sup style="font-size:12px;">3</sup> PMG assigns this piece the 389b suffix (1943–47). The Thomas De La Rue redesign —Nariño with Mercury and the Cali bank building— is Pick 400 (1953–1961) and is documented on the <a href="${laterHref}">1949–1961 record</a>.<sup style="font-size:12px;">5</sup> The types should not be mixed.`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">The date family:</strong> Foronum lists eight P#389 dates from 20.7.1941 to 2.1.1963.<sup style="font-size:12px;">1</sup> Banknote World Educational describes 389b.2 of 20.7.1944 (Series N; 140 &times; 70 mm; ABNC; Nariño in uniform; Liberty seal on the back).<sup style="font-size:12px;">2</sup> Heritage sold a uniface Pick 389p proof, PMG 65 EPQ —a different specimen.<sup style="font-size:12px;">4</sup>`,
        ),
        sectionP(
          `<strong style="color:#1c1a15;">This holder:</strong> PMG 50 About Uncirculated EPQ, certificate 8011911-013, Series N, serial 6813011. The label prints “Pick# 389b (dated 1943-47).” It is not the Heritage proof or a 389b of another date.`,
          true,
        ),
      ];

  const details = isEs
    ? [
        bullet(
          '<strong style="color:#1c1a15;">Texto principal:</strong> «EL BANCO DE LA REPÚBLICA» y «DIEZ PESOS ORO», con la fecha «BOGOTÁ, COLOMBIA 20 DE JULIO DE 1943».',
        ),
        bullet(
          `<strong style="color:#1c1a15;">Retrato:</strong> <a href="${narinoHref}">Antonio Nariño</a> en óvalo a la derecha, con la leyenda «NARIÑO» bajo el marco.`,
        ),
        bullet(
          '<strong style="color:#1c1a15;">Serie y serial:</strong> «SERIE N» y el número rojo 6813011, repetidos a izquierda y derecha del anverso.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Firmas:</strong> dos firmas manuscritas con los títulos «GERENTE» y «SECRETARIO».',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Colorido del anverso:</strong> guilloches en naranja, verde y amarillo, con grandes cifras «10» en las cuatro esquinas y al centro. Pie de imprenta «AMERICAN BANK NOTE COMPANY».',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverso:</strong> impresión verde con medallón de una figura femenina con gorro frigio (Libertad), leyenda «BANCO DE LA REPÚBLICA - BOGOTÁ COLOMBIA», cifras «10» laterales y «DIEZ PESOS ORO» al pie. Mismo pie ABNC.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Encapsulado:</strong> dos tenedores PMG. Anverso: 50 EPQ. Reverso: designación Exceptional Paper Quality, código de barras y certificado 8011911-013.',
        ),
      ]
    : [
        bullet(
          '<strong style="color:#1c1a15;">Main text:</strong> “EL BANCO DE LA REPÚBLICA” and “DIEZ PESOS ORO,” with the date “BOGOTÁ, COLOMBIA 20 DE JULIO DE 1943.”',
        ),
        bullet(
          `<strong style="color:#1c1a15;">Portrait:</strong> <a href="${narinoHref}">Antonio Nariño</a> in an oval at right, captioned “NARIÑO” below the frame.`,
        ),
        bullet(
          '<strong style="color:#1c1a15;">Series and serial:</strong> “SERIE N” and the red number 6813011, repeated at left and right on the face.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Signatures:</strong> two manuscript signatures titled “GERENTE” and “SECRETARIO.”',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Obverse color:</strong> orange, green, and yellow guilloche, with large “10” numerals in the four corners and at center. Imprint “AMERICAN BANK NOTE COMPANY.”',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Reverse:</strong> green printing with a medallion of a woman in a Phrygian cap (Liberty), legend “BANCO DE LA REPÚBLICA - BOGOTÁ COLOMBIA,” flanking “10” numerals, and “DIEZ PESOS ORO” at the foot. Same ABNC imprint.',
        ),
        bullet(
          '<strong style="color:#1c1a15;">Holder:</strong> two PMG holders. Face: 50 EPQ. Back: Exceptional Paper Quality designation, barcode, and certificate 8011911-013.',
        ),
      ];

  const notes = isEs
    ? [
        noteP(
          `1. <a href="https://www.foronum.com/catalogo-de-billetes/colombia/n-2577-10-pesos-oro/1943" target="_blank" rel="noopener noreferrer">Foronum — 10 Pesos Oro 1943, P#389 / FO#2577${tab}</a>: fecha 20 de julio de 1943; papel; 140 &times; 70 mm; rareza «muy escasa». Catálogo secundario de coleccionistas.`,
        ),
        noteP(
          `2. <a href="https://www.banknoteworld.org/colombia-10-pesos-oro-1944-p-389b-2.html" target="_blank" rel="noopener noreferrer">Banknote World Educational — Colombia 10 Pesos Oro, 1944, P-389b.2${tab}</a>: 20.7.1944; 140 &times; 70 mm; sin hilo ni marca de agua; ABNC; Serie N; firmas Julio Caro y Luis Ángel Arango; Nariño de uniforme; sello de la Libertad. Misma familia, fecha distinta de este 1943.`,
        ),
        noteP(
          `3. <a href="https://www.atsnotes.com/catalog/banknotes/colombia.html" target="_blank" rel="noopener noreferrer">ATS Notes — catálogo de billetes de Colombia${tab}</a>: Pick 389, 1941–1963, 10 pesos, Banco de la República. Pick 400–401: 10 y 20 pesos, 1953–1965 (otro tipo).`,
        ),
        noteP(
          `4. <a href="https://www.numisbids.com/sale/2703/lot/28693" target="_blank" rel="noopener noreferrer">Heritage / NumisBids, Long Beach Signature Currency Sale 4006, lote 28693${tab}</a>: prueba uniface de anverso Pick 389p, PMG Gem Uncirculated 65 EPQ. Ejemplar distinto.`,
        ),
        noteP(
          `5. <a href="${laterHref}">Notofilia — Diez Pesos Oro, 1949–1961</a>: ABNC de 1949 y rediseño Thomas De La Rue Pick 400 (1953–1961). No es este Pick 389b de 1943.`,
        ),
        noteP(
          `6. <a href="https://repositorio.banrep.gov.co/items/23567953-6250-4a4a-a417-3b48f118a465" target="_blank" rel="noopener noreferrer">Langebaek-Rueda y Alonso-Masmela, «90 años del Banco de la República: una aproximación numismática» (2013)${tab}</a>, en el volumen institucional del Banco: historia del papel moneda del siglo XX y de los motivos impresos. El régimen de Ley 25 de 1923 / Ley 82 de 1931 (peso oro y poder liberatorio) se resume en estudios del mismo repositorio del Emisor.`,
          true,
        ),
      ]
    : [
        noteP(
          `1. <a href="https://www.foronum.com/catalogo-de-billetes/colombia/n-2577-10-pesos-oro/1943" target="_blank" rel="noopener noreferrer">Foronum — 10 Pesos Oro 1943, P#389 / FO#2577${tab}</a>: dated 20 July 1943; paper; 140 &times; 70 mm; rarity “very scarce.” Secondary collector catalog.`,
        ),
        noteP(
          `2. <a href="https://www.banknoteworld.org/colombia-10-pesos-oro-1944-p-389b-2.html" target="_blank" rel="noopener noreferrer">Banknote World Educational — Colombia 10 Pesos Oro, 1944, P-389b.2${tab}</a>: 20.7.1944; 140 &times; 70 mm; no thread or watermark; ABNC; Series N; signatures Julio Caro and Luis Ángel Arango; Nariño in uniform; Liberty seal. Same family, different date from this 1943 note.`,
        ),
        noteP(
          `3. <a href="https://www.atsnotes.com/catalog/banknotes/colombia.html" target="_blank" rel="noopener noreferrer">ATS Notes — Colombia banknote catalog${tab}</a>: Pick 389, 1941–1963, 10 pesos, Banco de la República. Pick 400–401: 10 and 20 pesos, 1953–1965 (a different type).`,
        ),
        noteP(
          `4. <a href="https://www.numisbids.com/sale/2703/lot/28693" target="_blank" rel="noopener noreferrer">Heritage / NumisBids, Long Beach Signature Currency Sale 4006, lot 28693${tab}</a>: uniface face proof Pick 389p, PMG Gem Uncirculated 65 EPQ. A different specimen.`,
        ),
        noteP(
          `5. <a href="${laterHref}">Notofilia — Ten Pesos Oro, 1949–1961</a>: 1949 ABNC issue and Thomas De La Rue redesign Pick 400 (1953–1961). Not this 1943 Pick 389b.`,
        ),
        noteP(
          `6. <a href="https://repositorio.banrep.gov.co/items/23567953-6250-4a4a-a417-3b48f118a465" target="_blank" rel="noopener noreferrer">Langebaek-Rueda and Alonso-Masmela, “90 años del Banco de la República: una aproximación numismática” (2013)${tab}</a>, in the Bank’s institutional volume: twentieth-century paper money and printed subjects. The Law 25 of 1923 / Law 82 of 1931 regime (gold peso and legal tender) is summarized in studies in the same BanRep repository.`,
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
  title: 'Diez Pesos Oro 1943, Banco de la República | Notofilia',
  description:
    'Billete de 10 pesos oro del 20 de julio de 1943 (Pick 389b), PMG 50 EPQ, retrato de Nariño. Colección Notofilia.',
  keywords: [
    'banco de la república',
    'diez pesos oro 1943',
    'pick 389b',
    'antonio nariño',
    'american bank note company',
    'pmg 50 epq',
    'notafilia colombiana',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Banco de la República — 10 pesos oro, 1943',
  ogDescription: 'Pick 389b del 20 de julio de 1943, PMG 50 EPQ, Serie N 6813011. Colección Notofilia.',
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
            name: 'El Banco de la República — Diez Pesos Oro (1943)',
            item: `${SITE}${ES_PATH}`,
          },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'El Banco de la República — Diez Pesos Oro (20 de julio de 1943)',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.jpg`,
        description:
          'Billete de 10 pesos oro del Banco de la República, 20 de julio de 1943, Pick 389b, Serie N 6813011, PMG 50 EPQ, impreso por American Bank Note Company, con el retrato de Antonio Nariño.',
        dateCreated: '1943-07-20',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/coleccion/colombia/#page` },
        identifier: 'NF.colombia.banco-de-la-republica-10-pesos-oro-1943',
        additionalProperty: [
          { '@type': 'PropertyValue', name: 'Pick', value: '389b' },
          { '@type': 'PropertyValue', name: 'Impresor', value: 'American Bank Note Company' },
          { '@type': 'PropertyValue', name: 'Estado', value: 'PMG 50 EPQ' },
        ],
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.colombia.banco-de-la-republica-10-pesos-oro-1943',
    kind: 'banknote',
    title: 'El Banco de la República',
    subtitle: 'Diez Pesos Oro · 20 de julio de 1943 · Retrato de Antonio Nariño',
    dateOrSeries: '20 de julio de 1943',
    country: 'Colombia',
    issuer: 'El Banco de la República, Bogotá, Colombia',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colombia', href: '/coleccion/colombia/' },
      { name: 'El Banco de la República — Diez Pesos Oro (1943)' },
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
      denomination: 'Diez Pesos Oro',
      currency: 'Peso oro colombiano',
      issuer: 'El Banco de la República, Bogotá, Colombia',
      printer: 'American Bank Note Company',
      issueDate: '20 de julio de 1943',
      series: 'Serie N',
      serialNumber: 'N 6813011',
      catalogNumber: 'Pick 389b',
      material: 'Papel',
      dimensions: '140 × 70 mm (catálogo secundario); medición del ejemplar: no confirmado',
      watermark: 'Ninguna (ficha educativa del tipo 389b.2, 1944)',
      condition: 'PMG 50 EPQ About Uncirculated',
      gradingService: 'PMG',
      status: 'circulated',
      printRun: 'no confirmado',
      knownVarieties:
        'Pick 389 tipo 1941–1963 (ABNC); fechas Foronum 1941–1963; prueba 389p (otro ejemplar); Pick 400 TDLR 1953–1961 en otra ficha. Sufijos salvo 389b: no confirmado',
      circulationDates:
        'Ley 82 de 1931: poder liberatorio. Tipo Pick 389 datado 1941–1963. Desmonetización: no confirmado',
      rarityBasis:
        'Foronum: 1943 «muy escasa». Población PMG de 389b: no confirmado. Este encapsulado es 50 EPQ, cert. 8011911-013',
      shownSpecimenState:
        'Par PMG 50 EPQ (Pick 389b, dated 1943-47), Serie N, S/N 6813011, ABNC, certificado 8011911-013',
      factualReviewDate: '2026-08-22',
    },
    render: 'astro-static',
    eyebrow: 'Pesos oro · Bogotá, Colombia · 1943',
    resourced: true,
    context: {
      historical:
        'Billetes en pesos oro del Banco de la República desde 1923; Ley 82 de 1931 les dio poder liberatorio. Este 20 de julio de 1943 es el tipo ABNC con retrato de Nariño (Pick 389), no el rediseño TDLR Pick 400.',
      design:
        'Anverso: Nariño a la derecha, Serie N 6813011 en rojo, fecha 20 de julio de 1943, firmas de Gerente y Secretario, pie ABNC. Reverso verde: medallón de la Libertad con gorro frigio.',
      varieties:
        'Pick 389 (1941–1963 ABNC); 389b en esta etiqueta PMG (1943–47); prueba 389p (otro ejemplar); Pick 400 (1953–1961 TDLR) en ficha aparte. Otras: no confirmado.',
      population: 'no confirmado',
    },
    sources: [
      {
        kind: 'specimen',
        label: 'Examen del ejemplar de la colección Notofilia (PMG 50 EPQ, cert. 8011911-013)',
        note: 'Etiqueta PMG: Pick 389b (dated 1943-47), 10 Pesos Oro, Serie N, S/N 6813011, ABNC; fecha impresa 20 de julio de 1943; pie ABNC en ambas caras',
      },
      {
        kind: 'printer',
        label: 'Imprenta American Bank Note Company (pie de imprenta en anverso y reverso)',
        note: 'Visible en el ejemplar; no hay ficha de archivo ABNC citada aquí para esta plancha',
      },
      {
        kind: 'central_bank',
        label: 'Langebaek-Rueda y Alonso-Masmela, «90 años del Banco de la República: una aproximación numismática» (2013)',
        url: 'https://repositorio.banrep.gov.co/items/23567953-6250-4a4a-a417-3b48f118a465',
        note: 'Volumen institucional del Emisor sobre papel moneda del siglo XX y motivos impresos; contexto de la banca central desde 1923',
      },
      {
        kind: 'catalog',
        label: 'ATS Notes — Pick concordance for Colombia',
        url: 'https://www.atsnotes.com/catalog/banknotes/colombia.html',
        note: 'Pick 389: 1941–1963, 10 pesos, Banco de la República. Pick 400–401: 1953–1965 (otro tipo)',
      },
      {
        kind: 'catalog',
        label: 'Foronum — 10 Pesos Oro 1943, P#389 / FO#2577',
        url: 'https://www.foronum.com/catalogo-de-billetes/colombia/n-2577-10-pesos-oro/1943',
        note: '20 de julio de 1943; 140 × 70 mm; papel; rareza «muy escasa». Catálogo secundario',
      },
      {
        kind: 'catalog',
        label: 'Banknote World Educational — P-389b.2 (1944)',
        url: 'https://www.banknoteworld.org/colombia-10-pesos-oro-1944-p-389b-2.html',
        note: 'Misma familia 389b, fecha 20.7.1944; Serie N; 140 × 70 mm; ABNC; Julio Caro / Luis Ángel Arango; Nariño; sello de la Libertad. No es este ejemplar de 1943',
      },
      {
        kind: 'auction',
        label: 'Heritage / NumisBids — Long Beach 4006, lote 28693, Pick 389p',
        url: 'https://www.numisbids.com/sale/2703/lot/28693',
        note: 'Prueba uniface de anverso, PMG 65 EPQ. Ejemplar distinto de este 50 EPQ emitido',
      },
    ],
    related: [
      { href: '/coleccion/colombia/perfil-antonio-narino/', title: 'Antonio Nariño — perfil histórico' },
      { href: '/coleccion/colombia/banco-de-la-republica-10-pesos-oro/', title: 'Diez Pesos Oro, 1949–1961 (Pick 400 y ABNC tardío)' },
      { href: '/coleccion/colombia/banco-de-la-republica-5-pesos-plata-1941/', title: 'Cinco Pesos Plata (1941)' },
    ],
  },
  legacyFile: 'billete-colombia-banco-de-la-republica-10-pesos-oro-1943.dc.html',
  sourceHash: createHash('sha1').update('banco-de-la-republica-10-pesos-oro-1943-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: 'Ten Pesos Oro 1943, Banco de la República | Notofilia',
      description:
        '10 Pesos Oro of 20 July 1943 (Pick 389b), PMG 50 EPQ, Nariño portrait. Notofilia collection.',
      ogTitle: 'Banco de la República — 10 pesos oro, 1943',
      ogDescription: 'Pick 389b of 20 July 1943, PMG 50 EPQ, Series N 6813011. Notofilia collection.',
      template: buildTemplate('en'),
      recordTitle: 'El Banco de la República',
      eyebrow: 'Pesos oro · Bogotá, Colombia · 1943',
    },
  },
};

writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${OUT}`);
console.log(`Image dimensions in ficha: ${IMG_WIDTH}x${IMG_HEIGHT}`);
