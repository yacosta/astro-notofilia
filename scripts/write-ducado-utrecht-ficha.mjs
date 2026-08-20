/**
 * One-off generator for the 1761 Utrecht gold ducat catalog ficha.
 * Usage: node scripts/write-ducado-utrecht-ficha.mjs
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const SITE = 'https://notofilia.com';
const ES_PATH = '/coleccion/ducado-oro-utrecht-1761/';
const EN_PATH = '/en/collection/1761-utrecht-gold-ducat/';
const IMG = '/uploads/1761-netherland-ducat-utrecht';
const ZOOM_ID = 'utrecht-ducat-1761';

const styles =
  "body { margin: 0; }\n    a { color: #6b521f; text-decoration: underline; text-decoration-color: rgba(138,109,59,0.35); }\n    a:hover { color: #5c4826; }\n    ::selection { background: rgba(138,109,59,0.25); }";

function pictureBlock(lang, alt, eager = true) {
  const loading = eager ? 'eager' : 'lazy';
  const enlarge = lang === 'es' ? 'Ampliar' : 'Enlarge';
  const enlargeAria = lang === 'es' ? 'ampliar' : 'enlarge';
  return `<div style="width:100%; max-width:760px; display:flex; flex-direction:column; gap:14px; margin:0 auto 40px;">
<button
            data-zoom-trigger="${ZOOM_ID}"
            aria-label="${alt.replace(/"/g, '&quot;')} — ${enlargeAria}"
            style="all:unset; display:block; width:100%; position:relative; cursor:zoom-in; background:#1c1a15; border-radius:4px; padding:24px;"
          >
            <picture>
              <source srcset="${IMG}-640.webp 640w, ${IMG}.webp 1576w" sizes="(max-width: 792px) 100vw, 712px" type="image/webp" />
              <img
                src="${IMG}.png"
                alt="${alt.replace(/"/g, '&quot;')}"
                width="1576"
                height="1024"
                loading="${loading}"
                decoding="async"
                style="display:block; width:100%; height:auto;"
              />
            </picture>
            <span style="position:absolute; bottom:22px; right:22px; display:flex; align-items:center; gap:8px; background:rgba(10,10,9,0.82); color:#d8d2cd; font-size:13px; letter-spacing:0.08em; padding:8px 14px; border-radius:999px;">
              <span style="width:6px; height:6px; background:#d8d2cd; transform:rotate(45deg);"></span>
              ${enlarge}
            </span>
          </button>
          <span style="font-size:13px; letter-spacing:0.08em; color:#5c4e33; text-align:center; font-style:italic;">Anverso (izquierda) y reverso (derecho) &mdash; Colecci&oacute;n de Notofilia.com</span>
</div>`;
}

function zoomDialog(lang, alt) {
  const isEs = lang === 'es';
  const close = isEs ? 'Cerrar' : 'Close';
  const zoomOut = isEs ? 'Alejar' : 'Zoom out';
  const zoomIn = isEs ? 'Acercar' : 'Zoom in';
  const hint = isEs
    ? 'Arrastra para mover &middot; Rueda del rat&oacute;n para ampliar'
    : 'Drag to move &middot; Mouse wheel to zoom';
  return `<div
              role="dialog"
              aria-modal="true"
              aria-label="${alt.replace(/"/g, '&quot;')}"
              data-zoom-dialog="${ZOOM_ID}" hidden
             class="catalog-zoom-dialog">
              <button
                data-zoom-close
                aria-label="${close}"
                style="position:absolute; top:24px; right:28px; background:transparent; border:1px solid rgba(231,222,201,0.4); color:#d8d2cd; font-size:22px; line-height:1; width:44px; height:44px; border-radius:50%; cursor:pointer;"
              >&times;</button>
              <div style="position:absolute; top:24px; left:28px; display:flex; align-items:center; gap:6px; background:rgba(10,10,9,0.5); border:1px solid rgba(231,222,201,0.25); border-radius:999px; padding:6px;">
                <button disabled="true" aria-label="${zoomOut}" style="width:38px; height:38px; border-radius:50%; border:none; background:transparent; color:#d8d2cd; font-size:20px; cursor:pointer;">&minus;</button>
                <span style="min-width:56px; text-align:center; font-size:14px; color:#e7ddc4; letter-spacing:0.05em;">100%</span>
                <button disabled="false" aria-label="${zoomIn}" style="width:38px; height:38px; border-radius:50%; border:none; background:transparent; color:#d8d2cd; font-size:20px; cursor:pointer;">&#43;</button>
              </div>
              <div style="overflow:hidden; max-width:92vw; max-height:74vh; touch-action:none;">
                <picture>
                  <source srcset="${IMG}.webp" type="image/webp" />
                  <img
                    src="${IMG}.png"
                    alt="${alt.replace(/"/g, '&quot;')}"
                    draggable="false"
                    style="display:block; max-width:92vw; max-height:74vh; width:auto; height:auto; cursor:zoom-in; user-select:none;"
                  />
                </picture>
              </div>
              <span style="margin-top:18px; font-size:14px; letter-spacing:0.06em; color:#b7ab8a; font-style:italic;">${hint}</span>
            </div>`;
}

function metaRow(label, value) {
  return `<div style="display:grid; grid-template-columns:200px 1fr; gap:6px 20px; padding:14px 0; border-top:1px solid rgba(10,10,9,0.12);">
            <span style="font-size:14px; letter-spacing:0.1em; text-transform:uppercase; color:#5c4e33;">${label}</span>
            <span style="font-size:19px; color:#221f19;">${value}</span>
          </div>`;
}

function buildTemplate(lang) {
  const isEs = lang === 'es';
  const pagePath = isEs ? ES_PATH : EN_PATH;
  const backHref = isEs ? '/coleccion/numismatica/' : '/en/collection/numismatics/';
  const backLabel = isEs ? 'Catálogo de Numismática' : 'Numismatics catalog';
  const eyebrow = isEs
    ? 'Provincias Unidas de los Países Bajos &middot; Ceca de Utrecht &middot; 1761'
    : 'United Provinces of the Netherlands &middot; Utrecht Mint &middot; 1761';
  const h1 = isEs ? 'Ducado de oro &mdash; 1761' : 'Gold Ducat &mdash; 1761';
  const subtitle = isEs
    ? 'Ducado comercial neerlandés &middot; NGC AU Details (Edge Filing)'
    : 'Dutch trade ducat &middot; NGC AU Details (Edge Filing)';
  const intro = isEs
    ? 'El ducado comercial neerlandés es uno de los dise&ntilde;os monetarios m&aacute;s longevos de la historia: se acu&ntilde;&oacute; con el mismo caballero de pie desde finales del siglo XVI y, en su versi&oacute;n moderna de colecci&oacute;n, se sigue emitiendo hoy. Esta pieza de 1761 fue acu&ntilde;ada en la ceca provincial de Utrecht durante la Rep&uacute;blica de las Provincias Unidas.'
    : 'The Dutch trade ducat is one of the longest-running coin designs in history: the same standing-knight motif has been struck since the late 16th century and, in modern collector form, is still issued today. This 1761 example was struck at the Utrecht provincial mint during the era of the Dutch Republic (United Provinces).';
  const alt = isEs
    ? 'Ducado de oro de Utrecht de 1761 en cápsula NGC, anverso con caballero de pie y reverso con tablilla de leyenda'
    : '1761 Utrecht gold ducat in NGC holder, obverse with standing knight and reverse with inscribed tablet';
  const captionSide = isEs ? 'Anverso (izquierda) y reverso (derecho)' : 'Obverse (left) and reverse (right)';

  const rows = isEs
    ? [
        ['País', 'Provincias Unidas de los Países Bajos'],
        ['Ceca', 'Utrecht'],
        ['Año de acuñación', '1761'],
        ['Denominación', '1 ducado'],
        ['Composición', 'Oro .986'],
        ['Peso bruto', '3,49 g'],
        ['Oro fino contenido', '0,111 oz troy de oro fino'],
        ['Diámetro', '&asymp; 21 mm'],
        ['Referencias catalográficas', 'KM-7.4 &middot; Friedberg 285 &middot; Numista N# 323147'],
        ['Certificación', 'NGC AU Details &mdash; Edge Filing (n.&ordm; 4685927-012)'],
      ]
    : [
        ['Country', 'United Provinces of the Netherlands'],
        ['Mint', 'Utrecht'],
        ['Year of minting', '1761'],
        ['Denomination', '1 ducat'],
        ['Composition', 'Gold .986'],
        ['Gross weight', '3.49 g'],
        ['Fine gold content', '0.111 troy oz AGW'],
        ['Diameter', '&asymp; 21 mm'],
        ['Catalog references', 'KM-7.4 &middot; Friedberg 285 &middot; Numista N# 323147'],
        ['Certification', 'NGC AU Details &mdash; Edge Filing (No. 4685927-012)'],
      ];

  const obverseTitle = isEs ? 'Anverso' : 'Obverse';
  const reverseTitle = isEs ? 'Reverso' : 'Reverse';
  const obverseBody = isEs
    ? 'Caballero de pie a la derecha, con armadura tachonada y casco empenachado; sostiene una espada sobre el hombro derecho y, en la mano izquierda, un haz de siete flechas que representa las siete provincias unidas. El escudo de Utrecht aparece como marca de ceca. La fecha se divide en el campo (17 &ndash; 61).'
    : 'A knight stands facing right in studded armor and plumed helmet, sword resting on his right shoulder and, in his left hand, a bundle of seven arrows representing the seven united provinces. The shield of Utrecht serves as the mintmark. The date is split across the field (17 &ndash; 61).';
  const reverseBody = isEs
    ? 'Tablilla cuadrada enmarcada por un manto ornamental con leyenda en cinco l&iacute;neas.'
    : 'A square tablet framed by an ornamental mantle carries the legend in five lines.';
  const legendLabel = isEs ? 'Leyenda' : 'Legend';
  const transLabel = isEs ? 'Traducci&oacute;n' : 'Translation';
  const obLegend = 'CONCORDIA &middot; RES &middot; PARV&AElig; &middot; CRESCUNT';
  const obTrans = isEs
    ? '&laquo;Con la concordia, las cosas peque&ntilde;as crecen&raquo;.'
    : '&ldquo;Through concord, small things grow.&rdquo;';
  const revLegend = 'MO: ORD: PROVIN: FOEDER: BELG: AD LEG: IMP:';
  const revTrans = isEs
    ? '&laquo;Moneda de las Provincias Federadas de los Pa&iacute;ses Bajos, conforme a la ley del Imperio&raquo;.'
    : '&ldquo;Coin of the Federated Provinces of the Netherlands, in accordance with the law of the Empire.&rdquo;';

  const history = isEs
    ? 'El ducado de oro fue la gran moneda comercial de la Rep&uacute;blica Neerlandesa: circul&oacute; desde el B&aacute;ltico hasta las Indias Orientales como medio de pago de confianza en el comercio internacional, gracias a su ley y peso constantes. Su prestigio lleg&oacute; incluso a Australia: en la Proclamaci&oacute;n de 1800, el gobernador de Nueva Gales del Sur le asign&oacute; un valor oficial de 9 chelines y 6 peniques para retener el circulante en la colonia, por lo que el tipo tambi&eacute;n se considera una &laquo;moneda de proclamaci&oacute;n&raquo; australiana.'
    : 'The gold ducat was the Dutch Republic&rsquo;s great trade coin: it circulated from the Baltic to the East Indies as a trusted medium of international commerce thanks to its unwavering fineness and weight. Its reputation even reached Australia &mdash; under Governor Philip Gidley King&rsquo;s Proclamation of 1800, the ducat was assigned an official value of 9 shillings 6 pence to keep coinage within the New South Wales colony, making the type an Australian &ldquo;Proclamation coin&rdquo; as well.';

  const historyNote = isEs ? 'Nota de contexto hist&oacute;rico' : 'Historical context note';

  const certHeading = isEs ? 'Sobre la certificaci&oacute;n' : 'About the certification';
  const certBody = isEs
    ? 'La designaci&oacute;n <strong>AU Details &mdash; Edge Filing</strong> de NGC confirma la autenticidad de la pieza y un desgaste propio de &laquo;About Uncirculated&raquo;, pero sin calificaci&oacute;n num&eacute;rica debido a un limado en el canto. Este tipo de da&ntilde;o es muy habitual en los ducados de oro: durante siglos se rasparon peque&ntilde;as cantidades de oro del canto de las monedas en circulaci&oacute;n. Es, en cierto modo, una huella hist&oacute;rica del uso real de la pieza, aunque limita su valor de mercado frente a ejemplares con calificaci&oacute;n num&eacute;rica.'
    : 'NGC&rsquo;s <strong>AU Details &mdash; Edge Filing</strong> designation confirms the coin&rsquo;s authenticity and About Uncirculated wear, but withholds a numeric grade due to filing on the edge. This kind of damage is extremely common on gold ducats: for centuries, small amounts of gold were shaved from the edges of circulating coins. In a sense it is a historical fingerprint of real-world use, though it limits market value relative to straight-graded examples.';

  const sourcesHeading = isEs ? 'Fuentes' : 'Sources';
  const newTab = isEs
    ? '<span style="font-style:italic; font-weight:400;"> (se abre en una pesta&ntilde;a nueva)</span>'
    : '<span style="font-style:italic; font-weight:400;"> (opens in a new tab)</span>';

  const pic = pictureBlock(lang, alt).replace(
    'Anverso (izquierda) y reverso (derecho) &mdash; Colecci&oacute;n de Notofilia.com',
    `${captionSide} &mdash; ${isEs ? 'Colecci&oacute;n de Notofilia.com' : 'Notofilia.com Collection'}`,
  );

  return `<div lang="${lang}" style="width:100%; min-height:100vh; background:#0a0a09; font-family:'Cormorant Garamond', serif; box-sizing:border-box;">

  <main data-pagefind-meta="url:${pagePath}" id="main-content" tabindex="-1" style="max-width:1180px; margin:0 auto; padding:56px 24px 80px; outline:none;">

    <a href="${backHref}" style="display:inline-block; color:#e7ddc4; text-decoration:none; font-size:15px; letter-spacing:0.08em; margin-bottom:24px;">&larr; ${backLabel}</a>

    <div style="background:#d8d2cd; border:1px solid rgba(10,10,9,0.08); border-radius:3px; padding:clamp(28px,4vw,64px); box-shadow:0 30px 70px rgba(0,0,0,0.45);">

      <div style="text-align:center; max-width:760px; margin:0 auto 48px;">
        <span style="display:block; font-size:14px; letter-spacing:0.22em; text-transform:uppercase; color:#5c4e33; margin-bottom:14px;">${eyebrow}</span>
        <h1 style="font-family:'Montenegrin Gothic One', serif; font-weight:400; font-size:clamp(30px,4vw,46px); line-height:1.08; letter-spacing:0.01em; color:#1c1a15; margin:0 0 12px;">${h1}</h1>
        <p style="font-size:clamp(19px,2vw,23px); font-style:italic; color:#4a4331; margin:0;">${subtitle}</p>
      </div>
${pic}

      <p style="font-size:19px; line-height:1.75; color:#332e22; max-width:760px; margin:0 auto 40px;">${intro}</p>

      <section id="ducado-1761" style="max-width:760px; margin:0 auto;">

        <div style="display:flex; flex-direction:column; gap:14px; margin:0 0 40px;">
          <div style="display:flex; flex-direction:column;">
          ${rows.map(([l, v]) => metaRow(l, v)).join('\n          ')}
          <div style="border-bottom:1px solid rgba(10,10,9,0.12);"></div>
        </div>

          ${zoomDialog(lang, alt)}
        </div>

        <section style="margin-top:44px;">
          <h3 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${obverseTitle}</h3>
          <p style="font-size:19px; line-height:1.65; color:#332e22; margin:0 0 14px;">${obverseBody}</p>
          <p style="font-size:19px; line-height:1.65; color:#332e22; margin:0 0 6px;"><strong style="color:#1c1a15;">${legendLabel}:</strong> <em>${obLegend}</em></p>
          <p style="font-size:19px; line-height:1.65; color:#332e22; margin:0;"><strong style="color:#1c1a15;">${transLabel}:</strong> ${obTrans}</p>
        </section>

        <section style="margin-top:44px;">
          <h3 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${reverseTitle}</h3>
          <p style="font-size:19px; line-height:1.65; color:#332e22; margin:0 0 14px;">${reverseBody}</p>
          <p style="font-size:19px; line-height:1.65; color:#332e22; margin:0 0 6px;"><strong style="color:#1c1a15;">${legendLabel}:</strong> <em>${revLegend}</em></p>
          <p style="font-size:19px; line-height:1.65; color:#332e22; margin:0;"><strong style="color:#1c1a15;">${transLabel}:</strong> ${revTrans}</p>
        </section>

      </section>

      <blockquote style="max-width:760px; margin:56px auto 0; padding:28px 0 0; border-top:1px solid rgba(10,10,9,0.15);">
        <p style="font-size:20px; font-style:italic; line-height:1.7; color:#4a4331; margin:0 0 10px;">${history}</p>
        <span style="font-size:14px; letter-spacing:0.08em; color:#5c4e33;">&mdash; ${historyNote}</span>
      </blockquote>

      <section style="max-width:760px; margin:44px auto 0; padding-top:24px; border-top:1px solid rgba(10,10,9,0.12);">
        <h2 style="font-size:15px; letter-spacing:0.2em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 14px; font-style:normal;">${certHeading}</h2>
        <p style="font-size:19px; line-height:1.75; color:#332e22; margin:0;">${certBody}</p>
      </section>

      <section style="max-width:760px; margin:32px auto 0; padding-top:24px; border-top:1px solid rgba(10,10,9,0.12);">
        <h2 style="font-size:13px; letter-spacing:0.18em; text-transform:uppercase; color:#5c4e33; font-weight:600; margin:0 0 12px; font-style:normal;">${sourcesHeading}</h2>
        <ul style="margin:0; padding:0 0 0 20px; font-size:15px; line-height:1.7; color:#5c4e33; font-style:italic;">
          <li>Krause&ndash;Mishler (KM-7.4) &middot; Friedberg 285</li>
          <li>Numista &mdash; <a href="https://en.numista.com/catalogue/pieces323147.html" target="_blank" rel="noopener noreferrer" style="color:#6b521f;">N# 323147${newTab}</a></li>
          <li>NGC Cert Lookup &mdash; <a href="https://www.ngccoin.com/certlookup/4685927-012/" target="_blank" rel="noopener noreferrer" style="color:#6b521f;">4685927-012${newTab}</a></li>
        </ul>
      </section>

    </div>
  </main>

</div>`;
}

const data = {
  path: ES_PATH,
  title: 'Ducado de oro de Utrecht, 1761 | Notofilia',
  description:
    'Ducado de oro comercial de 1761 acuñado en Utrecht, certificado NGC AU Details (Edge Filing). Ficha con datos técnicos, leyendas e historia.',
  keywords: [
    'ducado oro utrecht 1761',
    'paises bajos',
    'provincias unidas',
    'KM-7.4',
    'friedberg 285',
    'NGC AU details',
    'edge filing',
    '4685927-012',
    'moneda proclamacion australia',
    'caballero de pie',
  ],
  robots: 'index, follow, max-image-preview:large',
  ogType: 'article',
  ogTitle: 'Ducado de oro de Utrecht, 1761 — Provincias Unidas',
  ogDescription:
    'Ducado comercial neerlandés de 1761, ceca de Utrecht. NGC AU Details (Edge Filing), cert. 4685927-012. Colección privada Notofilia.',
  ogImage: `${IMG}.png`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Notofilia', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Colección Virtual', item: `${SITE}/coleccion/` },
          { '@type': 'ListItem', position: 3, name: 'Numismática', item: `${SITE}/coleccion/numismatica/` },
          { '@type': 'ListItem', position: 4, name: 'Ducado de oro — Utrecht 1761', item: `${SITE}${ES_PATH}` },
        ],
      },
      {
        '@type': 'CreativeWork',
        name: 'Ducado de oro de Utrecht, 1761 — Provincias Unidas de los Países Bajos',
        url: `${SITE}${ES_PATH}`,
        image: `${SITE}${IMG}.png`,
        description:
          'Ducado de oro comercial de 1761 acuñado en la ceca provincial de Utrecht, certificado NGC AU Details (Edge Filing).',
        dateCreated: '1761',
        creditText: 'Colección privada de Notofilia.com — no está a la venta',
        inLanguage: 'es',
        isPartOf: { '@id': `${SITE}/#website` },
      },
    ],
  },
  styles,
  template: buildTemplate('es'),
  logic: '',
  record: {
    id: 'NF.ducado-oro-utrecht-1761',
    kind: 'coin',
    title: 'Ducado de oro — Utrecht, 1761',
    subtitle: 'Provincias Unidas · NGC AU Details (Edge Filing)',
    dateOrSeries: '1761',
    country: 'Provincias Unidas de los Países Bajos',
    issuer: 'Ceca provincial de Utrecht',
    breadcrumb: [
      { name: 'Notofilia', href: '/' },
      { name: 'Colección', href: '/coleccion/' },
      { name: 'Numismática', href: '/coleccion/numismatica/' },
      { name: 'Ducado de oro — Utrecht, 1761' },
    ],
    images: {
      stacked: {
        src: `${IMG}.png`,
        srcWebp: `${IMG}.webp`,
        alt: 'Ducado de oro de Utrecht de 1761, anverso con caballero de pie y reverso con tablilla de leyenda',
        altEn: '1761 Utrecht gold ducat, obverse with standing knight and reverse with inscribed tablet',
        width: 1576,
        height: 1024,
      },
      defaultView: 'stacked',
    },
    metadata: {
      denomination: '1 ducado',
      issueDate: '1761',
      catalogNumber: 'KM-7.4 · Friedberg 285 · Numista N# 323147',
      composition: 'Oro .986',
      weight: '3,49 g (0,111 oz t de oro fino)',
      diameter: '≈ 21 mm',
      mint: 'Utrecht',
      material: 'Oro',
      currency: 'Ducado (oro)',
      issuer: 'Ceca provincial de Utrecht',
      condition: 'NGC AU Details — Edge Filing (4685927-012)',
      status: 'circulated',
      shownSpecimenState: 'NGC AU Details (Edge Filing), cert. 4685927-012',
    },
    context: {
      historical:
        'Ducado comercial de la República Neerlandesa; tipo reconocido como moneda de proclamación en Nueva Gales del Sur (1800).',
      design: 'Caballero de pie (anverso) y tablilla con leyenda imperial (reverso); marca de ceca de Utrecht.',
    },
    sources: [
      { label: 'Krause–Mishler KM-7.4', note: 'Referencia catalográfica', kind: 'catalog' },
      { label: 'Friedberg 285', note: 'Gold Coins of the World', kind: 'catalog' },
      {
        label: 'Numista N# 323147',
        url: 'https://en.numista.com/catalogue/pieces323147.html',
        kind: 'catalog',
      },
      {
        label: 'NGC Cert 4685927-012',
        url: 'https://www.ngccoin.com/certlookup/4685927-012/',
        kind: 'secondary',
      },
    ],
    related: [
      { href: '/coleccion/numismatica/', title: 'Catálogo de Numismática' },
      { href: '/coleccion/moneda-colonial-espanola/', title: 'Moneda colonial española' },
    ],
    previous: { href: '/coleccion/numismatica/', title: 'Catálogo de Numismática' },
    render: 'astro-static',
    eyebrow: 'Provincias Unidas de los Países Bajos · Ceca de Utrecht · 1761',
  },
  legacyFile: 'ducado-oro-utrecht-1761.astro.json',
  sourceHash: createHash('sha1').update('ducado-oro-utrecht-1761-v1').digest('hex').slice(0, 16),
  i18n: {
    en: {
      path: EN_PATH,
      title: '1761 Utrecht Gold Ducat | Notofilia',
      description:
        '1761 gold trade ducat struck at Utrecht, certified NGC AU Details (Edge Filing). Catalogue entry with technical data, legends, and history.',
      ogTitle: '1761 Utrecht Gold Ducat — United Provinces',
      ogDescription:
        '1761 Dutch trade ducat from the Utrecht mint. NGC AU Details (Edge Filing), cert. 4685927-012. Notofilia private collection.',
      template: buildTemplate('en'),
      recordTitle: 'Gold Ducat — Utrecht, 1761',
      eyebrow: 'United Provinces of the Netherlands · Utrecht Mint · 1761',
    },
  },
};

const out = path.join(process.cwd(), 'src/content/catalog/ducado-oro-utrecht-1761.json');
writeFileSync(out, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Wrote ${out}`);
