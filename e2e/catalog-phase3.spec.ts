import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'home', path: '/' },
  {
    name: 'catalog-piece',
    path: '/coleccion/reserva-federal/cien-dolares-1990-cleveland/',
  },
  {
    name: 'catalog-coin',
    path: '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1774/',
  },
  { name: 'catalog-country-hub', path: '/coleccion/colombia/' },
];

for (const pageDef of PAGES) {
  test.describe(pageDef.name, () => {
    test('loads without dc-runtime on catalog surfaces', async ({ page }) => {
      const response = await page.goto(pageDef.path, { waitUntil: 'domcontentloaded' });
      expect(response?.ok()).toBeTruthy();

      if (pageDef.path.startsWith('/coleccion/')) {
        await expect(page.locator('script[src="/support.js"]')).toHaveCount(0);
        await expect(page.locator('script[src^="/catalog-zoom.js"]')).toHaveCount(1);
        await expect(page.locator('[data-catalog-record]').first()).toBeVisible();
      }
    });

    test('has no serious accessibility violations', async ({ page }) => {
      await page.goto(pageDef.path, { waitUntil: 'domcontentloaded' });
      // Hide consent overlay so it does not dominate the scan.
      await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        // Site-wide gold-on-dark contrast is tracked separately from Phase 3 architecture work.
        .disableRules(['color-contrast'])
        .analyze();
      const serious = results.violations.filter((v) =>
        ['serious', 'critical'].includes(v.impact || ''),
      );
      expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
    });

    test('visual regression snapshot', async ({ page }) => {
      await page.goto(pageDef.path, { waitUntil: 'networkidle' });
      // Hide cookie banner / motion to stabilize screenshots.
      await page.addStyleTag({
        content: '#cookie-banner{display:none!important;} *,*::before,*::after{animation:none!important;transition:none!important;}',
      });
      await expect(page).toHaveScreenshot(`${pageDef.name}.png`, {
        fullPage: false,
      });
    });
  });
}

test('nepal showcase uses primary sources and visible no confirmado fields', async ({ page }) => {
  await page.goto('/coleccion/polimero-mundial/nepal-10-rupias-2005/');
  await expect(page.getByRole('heading', { name: 'Nepal Rastra Bank', exact: true }).first()).toBeVisible();
  await expect(page.getByText('Emisiones nepalíes en polímero')).toBeVisible();
  await expect(page.getByText('Los únicos billetes de polímero de Nepal')).toHaveCount(0);
  await expect(page.getByText('Banknote World')).toHaveCount(0);
  await expect(page.getByText('Tirada').first()).toBeVisible();
  await expect(page.getByText('no confirmado').first()).toBeVisible();
  await expect(page.getByText('Fecha de última revisión factual').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Reserve Bank of Australia, Annual Report 2003/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Nepal Rastra Bank — sitio oficial/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Fuentes' })).toBeVisible();
});

test('catalog piece exposes research chrome', async ({ page }) => {
  await page.goto('/coleccion/reserva-federal/cien-dolares-1990-cleveland/');
  await expect(page.getByText('Identificador permanente')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Datos de la ficha' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Cómo citar esta ficha' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Reportar un error o aportar información' }),
  ).toBeVisible();
});

test('country hub renders native cards without BanknoteCard imports', async ({ page }) => {
  await page.goto('/coleccion/colombia/');
  await expect(page.locator('dc-import')).toHaveCount(0);
  await expect(page.locator('.catalog-banknote-card').first()).toBeVisible();
});

test('Colombia catalog cards open fichas with the scan under the title', async ({ page }) => {
  const samples = [
    {
      href: '/coleccion/colombia/cartagena-1-real-1813/',
      spec: 'Pick #S101',
    },
    {
      href: '/coleccion/colombia/banco-de-la-republica-medio-peso-oro-specimen/',
      spec: 'Pick P-384s',
    },
    {
      href: '/coleccion/colombia/nueva-granada-1-peso-1861/',
      spec: 'Denominación',
    },
  ];
  await page.goto('/coleccion/colombia/', { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });

  for (const sample of samples) {
    const card = page.locator(`a.catalog-banknote-card[href="${sample.href}"]`);
    await expect(card).toBeVisible();
    await card.click();
    await expect(page).toHaveURL(new RegExp(`${sample.href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });
    await expect(page.locator('h1').first()).toBeInViewport();
    await expect(page.locator('[data-zoom-trigger] img').first()).toBeInViewport();
    await expect(page.getByText(sample.spec).first()).toBeVisible();
    const dialogs = page.locator('[data-zoom-dialog], .catalog-shell [role="dialog"][aria-modal="true"]');
    const count = await dialogs.count();
    for (let i = 0; i < count; i += 1) {
      await expect(dialogs.nth(i)).toBeHidden();
    }
    await page.goto('/coleccion/colombia/', { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });
  }
});

test('catalog fichas outside Colombia also show the scan under the title', async ({ page }) => {
  const samples = [
    {
      path: '/coleccion/reserva-federal/cien-dolares-1990-cleveland/',
      spec: 'D 79155860 A',
    },
    {
      path: '/coleccion/polimero-mundial/mexico-20-50-100-pesos/',
      spec: 'Pick-116',
    },
    {
      path: '/coleccion/polimero-mundial/nepal-10-rupias-2005/',
      spec: 'Tirada',
    },
    {
      path: '/coleccion/ecuador/100-sucres-1993/',
      spec: '00000002',
    },
    {
      path: '/coleccion/diez-dolares-1934-distritos/',
      spec: 'D — Cleveland, Ohio',
    },
    {
      path: '/coleccion/moneda-colonial-espanola/1-escudo-carlos-iii-1774/',
      spec: 'Santa Fe de Bogotá',
    },
  ];
  for (const sample of samples) {
    const response = await page.goto(sample.path, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });
    await expect(page.locator('h1').first()).toBeInViewport();
    await expect(page.locator('[data-zoom-trigger] img').first()).toBeInViewport();
    await expect(page.locator('#main-content').getByText(sample.spec).first()).toBeVisible();
    const dialogs = page.locator('[data-zoom-dialog], .catalog-shell [role="dialog"][aria-modal="true"]');
    const count = await dialogs.count();
    for (let i = 0; i < count; i += 1) {
      await expect(dialogs.nth(i)).toBeHidden();
    }
  }
});

test('Colombia catalog card for 10.000 pesos opens the scan under the title', async ({
  page,
}) => {
  await page.goto('/coleccion/colombia/', { waitUntil: 'domcontentloaded' });
  await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });
  const card = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-de-la-republica-10000-pesos-specimen/"]',
  );
  await expect(card).toContainText('Diez Mil Pesos (Specimen)');
  await card.click();
  await expect(page).toHaveURL(/\/coleccion\/colombia\/banco-de-la-republica-10000-pesos-specimen\/$/);
  await expect(page.locator('h1').first()).toBeInViewport();
  await expect(page.locator('[data-zoom-trigger] img').first()).toBeInViewport();
  await expect(page.getByText('Pick P-440 (variante conmemorativa)', { exact: true })).toBeVisible();
  await expect(page.locator('[data-zoom-dialog]').first()).toBeHidden();
});

test('Colombia 10.000 pesos specimen ficha lists both notes and their details', async ({
  page,
}) => {
  const response = await page.goto('/coleccion/colombia/banco-de-la-republica-10000-pesos-specimen/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.ok()).toBeTruthy();

  await expect(
    page.getByRole('heading', { level: 1, name: 'El Banco de la República' }),
  ).toBeVisible();
  await expect(page.getByText('Diez Mil Pesos · 15 de octubre de 1994')).toBeVisible();
  await expect(page.getByText('Diez Mil Pesos · 1 de marzo de 1995')).toBeVisible();
  await expect(page.getByText('Pick P-440 (variante conmemorativa)', { exact: true })).toBeVisible();
  await expect(page.getByText('Pick P-441 (variante por fecha)', { exact: true })).toBeVisible();
  await expect(page.getByText(/retrato de una mujer del pueblo emberá/i)).toBeVisible();
  await expect(page.getByText(/Policarpa Salavarrieta/i).first()).toBeVisible();

  const embera = page.locator(
    'img[src="/uploads/colombia-banco-de-la-republica-10000-pesos-1994-embera-specimen.jpg"]',
  );
  const laPola = page.locator(
    'img[src="/uploads/colombia-banco-de-la-republica-10000-pesos-1995-la-pola-specimen.jpg"]',
  );
  await expect(embera.first()).toBeVisible();
  await expect(laPola.first()).toBeVisible();

  const dialogs = page.locator('[data-zoom-dialog]');
  await expect(dialogs).toHaveCount(2);
  await expect(dialogs.nth(0)).toBeHidden();
  await expect(dialogs.nth(1)).toBeHidden();

  await page.getByRole('button', { name: /Ampliar imagen del billete: Diez Mil Pesos · 15 de octubre de 1994/ }).click();
  const emberaDialog = page.locator('[data-zoom-dialog="1994-embera"]');
  await expect(emberaDialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(emberaDialog).toBeHidden();

  await expect(page.getByRole('heading', { name: 'Datos de la ficha' })).toHaveCount(0);
  await expect(page.getByText('Pick P-440 (variante conmemorativa)', { exact: true })).toBeVisible();
  await expect(page.locator('script[src="/support.js"]')).toHaveCount(0);
  await expect(page.locator('sc-for')).toHaveCount(0);
});

test('Colombia 1.000 pesos gallery still lists Bolívar, Gaitán, and the printing error', async ({
  page,
}) => {
  const response = await page.goto('/coleccion/colombia/banco-de-la-republica-1000-pesos/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByText('1 de enero de 1990', { exact: true })).toBeVisible();
  await expect(page.getByText('Pick #433 (tipo temprano)').first()).toBeVisible();
  await expect(page.getByText('Pick #448').first()).toBeVisible();
  await expect(page.getByText(/Gruesa barra de tinta negra/)).toBeVisible();
  await expect(page.locator('[data-zoom-trigger]')).toHaveCount(19);
  await expect(page.locator('sc-for')).toHaveCount(0);
});

test('colombia catalog groups banknotes by era, issuer, and denomination', async ({ page }) => {
  await page.goto('/coleccion/colombia/');
  const cards = page.locator('.catalog-banknote-card');
  await expect(cards.first()).toContainText('1813');
  await expect(cards.first()).toContainText('Cartagena');
  await expect(cards.last()).toContainText('2016');
  await expect(cards.last()).toHaveAttribute('href', /50000-pesos/);

  await expect(page.getByRole('heading', { level: 2, name: 'Billetes del Siglo Pasado' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Deuda Pública Estatal' })).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Billetes del Banco de la República (Desde 1923)' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 3, name: 'Catálogo de Billetes de Colombia', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Estados Unidos de Nueva Granada (1861)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Estados Unidos de Colombia' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Estados soberanos (1882)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bonos y Libranzas Fiscales' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Banca Libre', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'El Banco Nacional', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'República de Colombia', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Errores de impresión' })).toHaveCount(0);

  for (const denomination of [
    '1/2 Peso',
    '1 Peso',
    '2 Pesos',
    '5 Pesos',
    '10 Pesos',
    '50 Pesos',
    '100 Pesos',
    '200 Pesos',
    '500 Pesos',
    '1000 Pesos',
    '2000 Pesos',
    '5000 Pesos',
    '10000 Pesos',
    '50000 Pesos',
  ]) {
    await expect(page.getByRole('heading', { level: 3, name: denomination, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('heading', { name: '20000 Pesos' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '100000 Pesos' })).toHaveCount(0);

  const hrefs = await cards.evaluateAll((els) =>
    els.map((el) => (el instanceof HTMLAnchorElement ? el.getAttribute('href') : null)),
  );
  expect(hrefs.at(-1)).not.toContain('libranza');
  const boyacaIdx = hrefs.indexOf('/coleccion/colombia/boyaca-libranza-500-pesos-1883/');
  expect(boyacaIdx).toBeGreaterThan(
    hrefs.indexOf('/coleccion/colombia/republica-1910-1915-emisiones/') ?? -1,
  );
  expect(boyacaIdx).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/banco-de-la-republica-medio-peso-oro-specimen/') ??
      Number.POSITIVE_INFINITY,
  );
  const deuda = page.locator('#catalog-era-deuda-publica-estatal');
  await expect(deuda.getByRole('heading', { name: 'Bonos y Libranzas Fiscales' })).toBeVisible();
  await expect(
    deuda.locator('a.catalog-banknote-card[href="/coleccion/colombia/boyaca-libranza-500-pesos-1883/"]'),
  ).toBeVisible();

  const sigloPasado = page.locator('#catalog-era-billetes-del-siglo-pasado');
  await expect(sigloPasado.getByRole('heading', { name: 'El Banco Hipotecario' })).toBeVisible();
  const hipotecario = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-hipotecario-5-pesos-1881/"]',
  );
  await expect(hipotecario).toBeVisible();
  await expect(hipotecario).toContainText('1881');
  await expect(hipotecario).toContainText('Cinco Pesos');
  const hipotecarioIdx = hrefs.indexOf('/coleccion/colombia/banco-hipotecario-5-pesos-1881/');
  expect(hipotecarioIdx).toBeGreaterThan(
    hrefs.indexOf('/coleccion/colombia/estado-soberano-cauca-5-pesos-1882/') ?? -1,
  );
  expect(hipotecarioIdx).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/banco-nacional-25-pesos-1895/') ?? Number.POSITIVE_INFINITY,
  );

  await expect(sigloPasado.getByRole('heading', { name: 'El Banco de Rio Hacha' })).toBeVisible();
  const rioHacha = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/"]',
  );
  await expect(rioHacha).toBeVisible();
  await expect(rioHacha).toContainText('1883');
  await expect(rioHacha).toContainText('Cinco Pesos');
  const rioHachaIdx = hrefs.indexOf('/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/');
  expect(rioHachaIdx).toBeGreaterThan(hipotecarioIdx);
  expect(rioHachaIdx).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/banco-nacional-25-pesos-1895/') ?? Number.POSITIVE_INFINITY,
  );

  await expect(sigloPasado.getByRole('heading', { name: 'El Banco del Cauca' })).toBeVisible();
  const cauca = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-del-cauca-1-5-pesos-1888/#un-peso"]',
  );
  await expect(cauca).toBeVisible();
  await expect(cauca).toContainText('1888');
  await expect(cauca).toContainText('Un Peso');
  const caucaIdx = hrefs.indexOf('/coleccion/colombia/banco-del-cauca-1-5-pesos-1888/#un-peso');
  expect(caucaIdx).toBeGreaterThan(rioHachaIdx);
  expect(caucaIdx).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/banco-nacional-25-pesos-1895/') ?? Number.POSITIVE_INFINITY,
  );
  await expect(
    page.locator(
      'a.catalog-banknote-card[href="/coleccion/colombia/banco-del-cauca-1-5-pesos-1888/#cinco-pesos"]',
    ),
  ).toBeVisible();

  await expect(sigloPasado.getByRole('heading', { name: 'El Banco de Medellín' })).toBeVisible();
  const medellin = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-de-medellin-50-centavos/"]',
  );
  await expect(medellin).toBeVisible();
  await expect(medellin).toContainText('Cincuenta Centavos');
  const medellinIdx = hrefs.indexOf('/coleccion/colombia/banco-de-medellin-50-centavos/');
  expect(medellinIdx).toBeGreaterThan(caucaIdx);

  await expect(sigloPasado.getByRole('heading', { name: 'El Banco de Pamplona' })).toBeVisible();
  const pamplona = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-de-pamplona-10-pesos-1884/#un-peso"]',
  );
  await expect(pamplona).toBeVisible();
  await expect(pamplona).toContainText('1883');
  await expect(pamplona).toContainText('Un Peso');
  const pamplonaIdx = hrefs.indexOf('/coleccion/colombia/banco-de-pamplona-10-pesos-1884/#un-peso');
  expect(pamplonaIdx).toBeGreaterThan(medellinIdx);
  expect(pamplonaIdx).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/banco-nacional-25-pesos-1895/') ?? Number.POSITIVE_INFINITY,
  );
  await expect(
    page.locator(
      'a.catalog-banknote-card[href="/coleccion/colombia/banco-de-pamplona-10-pesos-1884/#diez-pesos"]',
    ),
  ).toBeVisible();

  const missingBancaLibre = [
    ['El Banco del Norte', '/coleccion/colombia/banco-del-norte-5-pesos-1882/'],
    ['El Banco de la Unión', '/coleccion/colombia/banco-de-la-union-5-10-pesos-1883/#cinco-pesos'],
    ['El Banco Internacional', '/coleccion/colombia/banco-internacional-1-peso-1884/#un-peso'],
    ['Vicente B. Villa é Hijos', '/coleccion/colombia/vicente-villa-e-hijos-5-pesos/'],
    ['El Banco Unión', '/coleccion/colombia/banco-union-cartagena-1-peso-1880s/'],
    ['El Banco de Panamá', '/coleccion/colombia/banco-de-panama-1-5-pesos/#un-peso'],
    ['El Banco de Oriente', '/coleccion/colombia/banco-de-oriente-5-pesos-1888/'],
    ['Banco de Antioquia', '/coleccion/colombia/banco-de-antioquia-libranza-10-centavos-1900/'],
    ['El Banco de Barranquilla', '/coleccion/colombia/banco-de-barranquilla-50-centavos-1900/'],
    ['El Banco de Caldas', '/coleccion/colombia/banco-de-caldas-1-peso-1919/'],
    ['El Banco de Colombia', '/coleccion/colombia/banco-de-colombia-1-peso-oro-1919/'],
    ['Departamento de Antioquia', '/coleccion/colombia/departamento-de-antioquia-centavos/'],
  ] as const;
  let previousIdx = pamplonaIdx;
  for (const [heading, href] of missingBancaLibre) {
    await expect(sigloPasado.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(sigloPasado.locator(`a.catalog-banknote-card[href="${href}"]`)).toBeVisible();
    const idx = hrefs.indexOf(href);
    expect(idx, heading).toBeGreaterThan(previousIdx);
    expect(idx, heading).toBeLessThan(
      hrefs.indexOf('/coleccion/colombia/banco-nacional-25-pesos-1895/') ?? Number.POSITIVE_INFINITY,
    );
    previousIdx = idx;
  }
  await expect(
    deuda.locator(
      'a.catalog-banknote-card[href="/coleccion/colombia/banco-de-antioquia-libranza-10-centavos-1900/"]',
    ),
  ).toHaveCount(0);
  await expect(
    page.locator('#catalog-subgroup-billetes-del-siglo-pasado-banca-libre-el-banco-union').locator(
      'a.catalog-banknote-card[href="/coleccion/colombia/banco-union-cartagena-1-peso-1880s/"]',
    ),
  ).toBeVisible();

  const twoThousand = page.locator('#catalog-group-billetes-del-banco-de-la-republica-desde-1923-2000-pesos');
  await expect(
    twoThousand.locator('a.catalog-banknote-card[href="/coleccion/colombia/banco-de-la-republica-2000-pesos-oro/"]'),
  ).toBeVisible();
  await expect(
    twoThousand.locator('a.catalog-banknote-card[href="/coleccion/colombia/2000-pesos-error-mariposa/"]'),
  ).toBeVisible();
  const halfPesoIdx = hrefs.indexOf(
    '/coleccion/colombia/banco-de-la-republica-medio-peso-oro-specimen/',
  );
  const onePesoIdx = hrefs.indexOf('/coleccion/colombia/banco-de-la-republica-1-peso-specimen/');
  expect(halfPesoIdx).toBeGreaterThan(-1);
  expect(onePesoIdx).toBeGreaterThan(halfPesoIdx);
});

test('retired Tesorería Victory Series page is not a live document', async ({ page }) => {
  const es = await page.goto('/coleccion/filipinas/tesoreria-victory-series/', {
    waitUntil: 'domcontentloaded',
  });
  expect(es?.ok()).toBeFalsy();
  await expect(page.getByRole('heading', { name: 'Tesorería de Filipinas · Victory Series' })).toHaveCount(0);
  const en = await page.goto('/en/collection/philippines/treasury-victory-series/', {
    waitUntil: 'domcontentloaded',
  });
  expect(en?.ok()).toBeFalsy();
  await expect(
    page.getByRole('heading', { name: 'Treasury of the Philippines · Victory Series' }),
  ).toHaveCount(0);
});

test('Filipinas catalog lists the 1 peso Victory note ahead of the 2 pesos', async ({ page }) => {
  await page.goto('/coleccion/filipinas/');
  const cards = page.locator('.catalog-banknote-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toHaveAttribute('href', '/coleccion/filipinas/1-peso-victory-series-66/');
  await expect(cards.nth(0)).toContainText('1 Peso Victory Series No. 66');
  await expect(cards.nth(1)).toHaveAttribute('href', '/coleccion/filipinas/2-pesos-victory-series-66/');
  await expect(cards.nth(1)).toContainText('2 Pesos Victory Series No. 66');
});

test('English Philippines catalog lists the 1 peso Victory note ahead of the 2 pesos', async ({ page }) => {
  await page.goto('/en/collection/philippines/');
  const cards = page.locator('.catalog-banknote-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toHaveAttribute('href', '/en/collection/philippines/1-peso-victory-series-66/');
  await expect(cards.nth(0)).toContainText('1 Peso Victory Series No. 66');
  await expect(cards.nth(1)).toHaveAttribute('href', '/en/collection/philippines/2-pesos-victory-series-66/');
  await expect(cards.nth(1)).toContainText('2 Pesos Victory Series No. 66');
});

test('homepage Logros del Mes features the 1943 10 pesos oro first', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  await expect(section.getByRole('heading', { name: 'Logros del Mes — Colección Virtual' })).toBeVisible();
  const first = section.locator('ul > li > a').first();
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute('href', '/coleccion/colombia/banco-de-la-republica-10-pesos-oro-1943/');
  await expect(first).toContainText('Banco de la República — 10 pesos oro, 1943');
  await expect(first.getByRole('img')).toHaveAttribute(
    'alt',
    /10 pesos oro del Banco de la República, 20 de julio de 1943/,
  );
  await expect(first.getByRole('img')).toHaveAttribute(
    'src',
    '/uploads/colombia-banco-de-la-republica-10-pesos-oro-1943-card.jpg',
  );
});

test('English homepage Logros features the 1943 10 pesos oro first', async ({ page }) => {
  await page.goto('/en/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  await expect(section.getByRole('heading', { name: 'Monthly Milestones — Virtual Collection' })).toBeVisible();
  const first = section.locator('ul > li > a').first();
  await expect(first).toHaveAttribute(
    'href',
    '/en/collection/colombia/banco-de-la-republica-10-pesos-oro-1943/',
  );
  await expect(first).toContainText('Banco de la República — 10 pesos oro, 1943');
  await expect(first.getByRole('img')).toHaveAttribute(
    'alt',
    /Banco de la República 10 pesos oro, 20 July 1943/,
  );
});

test('homepage Logros del Mes still features the Santa Marta 1820 cuartillo', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /Santa Marta — ¼ real de cobre, 1820/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/colombia/santa-marta-1-4-real-1820/');
});

test('English homepage Logros still features the Santa Marta 1820 cuartillo', async ({ page }) => {
  await page.goto('/en/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /Santa Marta — copper ¼ real, 1820/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/en/collection/colombia/santa-marta-quarter-real-1820/');
});

test('homepage Logros del Mes features the Philippines Victory Series 66 2 pesos', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  await expect(section.getByRole('heading', { name: 'Logros del Mes — Colección Virtual' })).toBeVisible();
  const card = section.getByRole('link', { name: /Filipinas — 2 pesos Victory Series 66/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/filipinas/2-pesos-victory-series-66/');
  await expect(card.getByRole('img')).toHaveAttribute(
    'alt',
    /Certificado del Tesoro de Filipinas de 2 pesos/,
  );
  await expect(card.getByRole('img')).toHaveAttribute(
    'src',
    '/uploads/philippines-treasury-certificate-2-pesos-victory-series-66-cc5b2834-card.jpg',
  );
});

test('English homepage Logros features the Philippines Victory Series 66 2 pesos', async ({ page }) => {
  await page.goto('/en/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  await expect(section.getByRole('heading', { name: 'Monthly Milestones — Virtual Collection' })).toBeVisible();
  const card = section.getByRole('link', { name: /Philippines — 2 pesos Victory Series 66/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/en/collection/philippines/2-pesos-victory-series-66/');
  await expect(card.getByRole('img')).toHaveAttribute(
    'alt',
    /Philippines Treasury Certificate of 2 pesos/,
  );
});

test('homepage Logros del Mes features the Philippines Victory Series 66 1 peso', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /Filipinas — 1 peso Victory Series 66/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/filipinas/1-peso-victory-series-66/');
});

test('English homepage Logros features the Philippines Victory Series 66 1 peso', async ({ page }) => {
  await page.goto('/en/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /Philippines — 1 peso Victory Series 66/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/en/collection/philippines/1-peso-victory-series-66/');
});

test('homepage Logros del Mes still features the China 2000 polymer 100 yuan', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /China — 100 yuan de polímero, 2000/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/polimero-mundial/china-100-yuan-2000/');
  await expect(card.getByRole('img')).toHaveAttribute('alt', /Banco Popular de China/);
});

test('English homepage Logros still features the China 2000 polymer 100 yuan', async ({ page }) => {
  await page.goto('/en/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /China — polymer 100 yuan, 2000/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/en/collection/world-polymer/china-100-yuan-2000/');
});

test('homepage Logros del Mes features the Banco de Rio Hacha 1883 proofs', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  await expect(section.getByRole('heading', { name: 'Logros del Mes — Colección Virtual' })).toBeVisible();
  const card = section.getByRole('link', { name: /Banco de Rio Hacha — 5 pesos, 1883/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/');
  await expect(card.getByRole('img')).toHaveAttribute('alt', /Banco de Rio Hacha/);
});

test('homepage Logros del Mes features the Banco Hipotecario 1881 proofs', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  await expect(section.getByRole('heading', { name: 'Logros del Mes — Colección Virtual' })).toBeVisible();
  const card = section.getByRole('link', { name: /Banco Hipotecario — 5 pesos, 1881/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/colombia/banco-hipotecario-5-pesos-1881/');
  await expect(card.getByRole('img')).toHaveAttribute('alt', /Banco Hipotecario/);
});

test('Nueva Granada 1861 ficha shows landscape side-by-side banknote photo', async ({ page }) => {
  await page.goto('/coleccion/colombia/nueva-granada-1-peso-1861/');
  const img = page.locator('main img[src="/uploads/colombia-nueva-granada-1-peso-1861-92c64225.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1448');
  await expect(img).toHaveAttribute('height', '1086');
  await expect(img).toHaveAttribute('alt', /izquierda.*derecha/);
  await expect(page.getByText('Anverso (izquierda) y reverso (derecha) — Colección de Notofilia.com')).toBeVisible();
});

test('English Nueva Granada 1861 ficha shows landscape side-by-side banknote photo', async ({ page }) => {
  await page.goto('/en/collection/colombia/new-granada-1-peso-1861/');
  const img = page.locator('main img[src="/uploads/colombia-nueva-granada-1-peso-1861-92c64225.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1448');
  await expect(img).toHaveAttribute('height', '1086');
  await expect(img).toHaveAttribute('alt', /at left.*at right/);
  await expect(page.getByText('Obverse (left) and reverse (right) — Notofilia.com Collection')).toBeVisible();
});

test('Banco Hipotecario ficha shows landscape side-by-side PMG proofs', async ({ page }) => {
  await page.goto('/coleccion/colombia/banco-hipotecario-5-pesos-1881/');
  const img = page.locator('main img[src="/uploads/colombia-banco-hipotecario-5-pesos-1881-38a93057.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1821');
  await expect(img).toHaveAttribute('height', '864');
  await expect(img).toHaveAttribute('alt', /izquierda.*derecha/);
  await expect(page.getByText('Anverso (izquierda) y reverso (derecha) — Colección de Notofilia.com')).toBeVisible();
});

test('English Banco Hipotecario ficha shows landscape side-by-side PMG proofs', async ({ page }) => {
  await page.goto('/en/collection/colombia/banco-hipotecario-5-pesos-1881/');
  const img = page.locator('main img[src="/uploads/colombia-banco-hipotecario-5-pesos-1881-38a93057.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1821');
  await expect(img).toHaveAttribute('height', '864');
  await expect(img).toHaveAttribute('alt', /at left.*at right/);
  await expect(page.getByText('Obverse (left) and reverse (right) — Notofilia.com Collection')).toBeVisible();
});

test('MPC Serie 692 $20 ficha shows stacked landscape photo', async ({ page }) => {
  await page.goto('/coleccion/certificados-de-pago-militar/20-dolares-serie-692/');
  const img = page.locator('main img[src="/uploads/mpc-series-692-20-dollars-3f285359.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1536');
  await expect(img).toHaveAttribute('height', '1024');
  await expect(img).toHaveAttribute('alt', /arriba.*abajo/);
  await expect(page.getByText('Anverso (arriba) y reverso (abajo) — Colección de Notofilia.com')).toBeVisible();
});

test('English MPC Series 692 $20 ficha shows stacked landscape photo', async ({ page }) => {
  await page.goto('/en/collection/military-payment-certificates/20-dollars-series-692/');
  const img = page.locator('main img[src="/uploads/mpc-series-692-20-dollars-3f285359.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1536');
  await expect(img).toHaveAttribute('height', '1024');
  await expect(img).toHaveAttribute('alt', /at top.*at bottom/);
  await expect(page.getByText('Obverse (top) and reverse (bottom) — Notofilia.com Collection')).toBeVisible();
});

test('homepage Logros del Mes features the MPC Serie 692 $20', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /MPC Serie 692 — Veinte Dólares/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/certificados-de-pago-militar/20-dolares-serie-692/');
  await expect(card.getByRole('img')).toHaveAttribute('src', '/uploads/mpc-series-692-20-dollars-3f285359-card.jpg');
});

test('English Colombia catalog lists the Banco Hipotecario proofs', async ({ page }) => {
  await page.goto('/en/collection/colombia/');
  await expect(page.getByRole('heading', { level: 1, name: 'Colombia Banknote Catalog' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Banknotes of the Last Century' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'State Public Debt' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Free Banking', exact: true })).toBeVisible();
  await expect(page.locator('.catalog-hub-group-title', { hasText: 'Colombian Free Banking' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'El Banco Hipotecario' }).last()).toBeVisible();
  const card = page.locator(
    'a.catalog-banknote-card[href="/en/collection/colombia/banco-hipotecario-5-pesos-1881/"]',
  );
  await expect(card).toBeVisible();
  await expect(card).toContainText('Five Pesos (proofs)');
  await expect(card).toContainText('1881');
});

test('English Colombia catalog lists the Banco de Rio Hacha proofs', async ({ page }) => {
  await page.goto('/en/collection/colombia/');
  await expect(page.getByRole('heading', { level: 1, name: 'Colombia Banknote Catalog' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Banco de la República Banknotes (From 1923)' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'El Banco de Rio Hacha' }).last()).toBeVisible();
  const card = page.locator(
    'a.catalog-banknote-card[href="/en/collection/colombia/banco-de-rio-hacha-5-pesos-1883/"]',
  );
  await expect(card).toBeVisible();
  await expect(card).toContainText('Five Pesos (proofs)');
  await expect(card).toContainText('1883');
});

test('English Colombia catalog nests Cauca, Medellín, and Pamplona under Free Banking', async ({
  page,
}) => {
  await page.goto('/en/collection/colombia/');
  const lastCentury = page.locator('#catalog-era-billetes-del-siglo-pasado');
  await expect(lastCentury.getByRole('heading', { name: 'Free Banking', exact: true })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco del Cauca' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de Medellín' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de Pamplona' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco del Norte' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de la Unión' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco Internacional' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'Vicente B. Villa é Hijos' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco Unión' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de Panamá' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de Oriente' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'Banco de Antioquia' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de Barranquilla' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de Caldas' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'El Banco de Colombia' })).toBeVisible();
  await expect(lastCentury.getByRole('heading', { name: 'Departamento de Antioquia' })).toBeVisible();
  await expect(
    page.locator(
      'a.catalog-banknote-card[href="/en/collection/colombia/banco-del-cauca-1-5-pesos-1888/#un-peso"]',
    ),
  ).toBeVisible();
  await expect(
    page.locator('a.catalog-banknote-card[href="/en/collection/colombia/banco-de-medellin-50-centavos/"]'),
  ).toBeVisible();
  await expect(
    page.locator(
      'a.catalog-banknote-card[href="/en/collection/colombia/banco-de-pamplona-10-pesos-1884/#un-peso"]',
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      'a.catalog-banknote-card[href="/en/collection/colombia/banco-union-cartagena-1-peso-1880s/"]',
    ),
  ).toBeVisible();
  await expect(
    page.locator(
      'a.catalog-banknote-card[href="/en/collection/colombia/banco-de-antioquia-warrant-10-centavos-1900/"]',
    ),
  ).toBeVisible();
});

test('coins have a dedicated numismática catalog page', async ({ page }) => {
  await page.goto('/coleccion/numismatica/');
  await expect(page.locator('script[src="/support.js"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: 'Catálogo de Numismática' })).toBeVisible();
  await expect(page.locator('.catalog-banknote-card')).toHaveCount(9);
  await expect(page.getByRole('heading', { name: 'Plaza realista de Santa Marta' })).toBeVisible();
  await expect(
    page.locator('a.catalog-banknote-card[href="/coleccion/colombia/santa-marta-1-4-real-1820/"]'),
  ).toBeVisible();
  // Newest group leads the page
  await expect(page.locator('.catalog-hub-group-title').first()).toHaveText('Plaza realista de Santa Marta');
  await expect(page.getByRole('link', { name: /Ducado de oro|Utrecht|1761/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Felipe V/ })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Moneda colonial española' }).first()).toBeVisible();
});

test('spanish colonial catalog shows grouped coin cards', async ({ page }) => {
  await page.goto('/coleccion/moneda-colonial-espanola/');
  await expect(page.getByRole('heading', { name: 'Catálogo de Moneda Colonial Española' })).toBeVisible();
  await expect(page.locator('.catalog-banknote-card')).toHaveCount(7);
  await expect(page.getByRole('heading', { name: 'Reinado de Felipe V' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reinado de Carlos III' })).toBeVisible();
});

test('1895 Banco Nacional 25 pesos is an issued note, not a specimen', async ({ page }) => {
  await page.goto('/coleccion/colombia/banco-nacional-25-pesos-1895/');
  await expect(page.getByRole('heading', { name: 'Veinticinco Pesos' })).toBeVisible();
  await expect(page.getByText('Serie 1.ª, N.° 170390 · Bogotá, 4 de marzo de 1895')).toBeVisible();

  const veinticinco = page.locator('#veinticinco-pesos');
  await expect(veinticinco.getByText('Veinticinco Pesos, en moneda corriente')).toBeVisible();
  await expect(veinticinco.getByText('Serie 1.ª, N.° 170390', { exact: true })).toBeVisible();
  await expect(veinticinco.getByText('Bogotá, 4 de marzo de 1895', { exact: true })).toBeVisible();
  await expect(veinticinco).not.toContainText(/specimen/i);
});

test('MPC Serie 681 $1 is listed on the hub and documents Fr. M915 / Schwan S915-1', async ({ page }) => {
  await page.goto('/coleccion/certificados-de-pago-militar/');
  await expect(page.getByRole('heading', { level: 1, name: 'Certificados de Pago Militar (MPC)' })).toBeVisible();
  const card = page.locator('.catalog-banknote-card[href="/coleccion/certificados-de-pago-militar/1-dolar-serie-681/"]');
  await expect(card).toBeVisible();
  await expect(card).toContainText('$1.00');
  await expect(card).toContainText('1969–1970');

  await page.goto('/coleccion/certificados-de-pago-militar/1-dolar-serie-681/');
  await expect(page.getByRole('heading', { level: 1, name: 'MPC Serie 681 — Un Dólar (Vietnam, 1969–1970)' })).toBeVisible();
  const ficha = page.locator('#main-content');
  await expect(ficha.getByText('Fr. M915 · Schwan S915-1 · Pick M79').first()).toBeVisible();
  await expect(ficha.getByText('C10102847C').first()).toBeVisible();
  await expect(ficha.getByText('22.400.000').first()).toBeVisible();
  await expect(ficha.getByText('S915-1r').first()).toBeVisible();
  await expect(ficha.getByText('C22400000C').first()).toBeVisible();
  await expect(ficha.getByText('C00560000').first()).toBeVisible();
  await expect(ficha.getByRole('heading', { name: 'Rareza en Uncirculated' })).toBeVisible();
  await expect(ficha.getByText('Superb Gem UNC 67 EPQ').first()).toBeVisible();
  await expect(ficha.getByText('Superb Gem UNC 68 EPQ').first()).toBeVisible();
  await expect(ficha.getByText('70 USD').first()).toBeVisible();
  await expect(ficha.getByText('195 USD').first()).toBeVisible();
  await expect(ficha.getByRole('heading', { name: 'Sobre este valor' })).toBeVisible();
  await expect(ficha.getByText('Valoración de catálogo').first()).toBeVisible();
  await expect(ficha.getByRole('heading', { name: 'Este ejemplar' })).toBeVisible();
  await expect(ficha.getByText('14 certificados').first()).toBeVisible();
  const fuentes = ficha.locator('section').filter({ has: page.getByRole('heading', { name: 'Fuentes' }) });
  await expect(fuentes.getByRole('heading', { name: 'Fuentes' })).toBeVisible();
  const sourceHrefs = [
    'https://www.bep.gov/media/1041/download?inline=',
    'https://www.coin-currency.com/page8.html',
    'https://www.money.org/uploads/Mili.pdf',
    'https://www.greysheet.com/publications/greensheet',
    'https://notes.www.collectors-society.com/registry/notes/SlotScoreDetail.aspx?SlotID=5896',
    'https://www.pmgnotes.com/paper-money-grading/grading-scale/',
    'https://www.pmgnotes.com/news/article/4845/aim-high-with-military-payment-certificates/',
    'https://art-hanoi.com/collection/vnpaper/681.html',
    'https://coinweek.com/vietnam-era-1969-military-payment-certificate-series-681/',
    'https://coinweek.com/money-of-necessity-u-s-military-payment-certificates/',
    'https://www.worldbanknotescoins.com/2014/11/us-military-payment-certificate-one-dollar-mpc-series-681.html',
    'http://banknote.ws/COLLECTION/countries/AME/USA/USA-MIL/USAM0079.htm',
    'https://collectingpapermoney.spmc.org/wiki/Collecting_U.S._Military_Payment_Certificates_%28MPC%29',
    'https://en.wikipedia.org/wiki/Military_payment_certificate',
  ];
  for (const href of sourceHrefs) {
    await expect(fuentes.locator(`a[href="${href}"]`)).toHaveCount(1);
  }
  await expect(fuentes.getByText('S915-1 (regular) y S915-1r (reemplazo)')).toBeVisible();
  await expect(fuentes.getByText('ISBN 0-931960-54-1')).toBeVisible();
  await expect(fuentes.locator('a[target="_blank"][rel="noopener noreferrer"]')).toHaveCount(sourceHrefs.length);
  await expect(ficha.getByText('veteranos de Vietnam reconocen de inmediato').first()).toBeVisible();
  await expect(ficha.locator('a[href="/glosario/#c-day"]')).toHaveCount(1);
  await expect(ficha.getByText('puerta de entrada al programa MPC')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Datos de la ficha' })).toHaveCount(0);
  await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
  await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute(
    'href',
    'https://notofilia.com/coleccion/certificados-de-pago-militar/1-dolar-serie-681/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    'https://notofilia.com/en/collection/military-payment-certificates/1-dollar-series-681/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
    'href',
    'https://notofilia.com/coleccion/certificados-de-pago-militar/1-dolar-serie-681/',
  );
  await expect(page.locator('script[src="/support.js"]')).toHaveCount(0);
  await expect(page.locator('#main-content')).toHaveAttribute('tabindex', '-1');
});

test('desktop header lists virtual notaphily hubs and coin pages', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const desktop = page.locator('#site-desktop-nav');
  await expect(desktop).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir menú', exact: true })).toBeHidden();
  await expect(desktop.getByRole('link', { name: 'Colección', exact: true })).toHaveAttribute(
    'href',
    '/coleccion/colombia/',
  );
  await expect(desktop.getByRole('link', { name: 'Contacto' })).toBeVisible();
  await expect(desktop.getByRole('link', { name: /Logros del Mes/ })).toHaveCount(0);
  await expect(desktop.getByRole('link', { name: /Política de Privacidad/ })).toHaveCount(0);

  const collectionPanel = page.locator('#nav-panel-collection');
  await expect(collectionPanel).toBeHidden();
  await page.locator('[data-nav-item="collection"]').hover();
  await expect(collectionPanel).toBeVisible();
  await expect(collectionPanel.getByText('Colecciones principales')).toHaveCount(0);
  await expect(collectionPanel.getByText('Colecciones especiales', { exact: true })).toHaveCount(0);
  await expect(collectionPanel.getByText('Explorar', { exact: true })).toHaveCount(0);
  await expect(collectionPanel.getByText('Colecciones virtuales — Notafilia')).toBeVisible();
  await expect(collectionPanel.getByText('Colecciones virtuales — Numismática')).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Catálogo completo' })).toHaveCount(0);
  await expect(collectionPanel.getByRole('link', { name: 'Monedas', exact: true })).toHaveCount(0);
  await expect(collectionPanel.getByRole('link', { name: 'Añadidos recientes' })).toHaveCount(0);
  await expect(collectionPanel.getByRole('link', { name: 'Estados Unidos' })).toHaveCount(0);
  await collectionPanel.locator('summary', { hasText: 'Colecciones virtuales — Notafilia' }).click();
  await expect(collectionPanel.getByRole('link', { name: 'Estados Unidos' })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Banca Libre (Colombia)' })).toHaveCount(0);
  await collectionPanel.getByRole('button', { name: 'Mostrar secciones de Colombia' }).click();
  await expect(collectionPanel.getByRole('link', { name: 'Billetes del Siglo Pasado', exact: true })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Billetes del Banco de la República', exact: true })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Emisiones colombianas en el extranjero', exact: true })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Moneda Colonial', exact: true })).toHaveCount(0);
  await collectionPanel.getByRole('button', { name: 'Mostrar secciones de Estados Unidos' }).click();
  await expect(collectionPanel.getByRole('link', { name: 'Moneda Colonial', exact: true })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Billetes obsoletos', exact: true })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Departamento del Tesoro', exact: true })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Ecuador' })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'España' })).toHaveCount(0);
  await collectionPanel.locator('summary', { hasText: 'Colecciones virtuales — Numismática' }).click();
  await expect(collectionPanel.getByRole('link', { name: 'España' })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: 'Specimens' })).toHaveCount(0);
  await expect(collectionPanel.getByRole('link', { name: 'Errores de imprenta' })).toHaveCount(0);
  await expect(collectionPanel.getByRole('link', { name: 'Billetes obsoletos de EE. UU.' })).toHaveCount(0);
  await expect(collectionPanel.getByRole('link', { name: /Felipe V/ })).toBeVisible();
  await expect(collectionPanel.getByRole('link', { name: /Banco de Pamplona/ })).toHaveCount(0);
  await expect(collectionPanel.getByRole('link', { name: 'Nepal' })).toHaveCount(0);
});

test('mobile drawer lists virtual notaphily hubs and coin pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  const drawer = page.locator('#site-menu-drawer');
  await expect(drawer).toBeVisible();
  await expect(drawer.getByLabel('Buscar en la colección')).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Inicio' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Colección', exact: true })).toHaveAttribute(
    'href',
    '/coleccion/colombia/',
  );

  await drawer.getByRole('button', { name: 'Mostrar enlaces de la colección' }).click();
  await expect(drawer.getByText('Explorar', { exact: true })).toHaveCount(0);
  await expect(drawer.getByText('Colecciones virtuales — Notafilia')).toBeVisible();
  await expect(drawer.getByText('Colecciones virtuales — Numismática')).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Catálogo completo' })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Monedas', exact: true })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Ver todos los países' })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Colombia', exact: true })).toHaveCount(0);
  await drawer.locator('summary', { hasText: 'Colecciones virtuales — Notafilia' }).click();
  await expect(drawer.getByRole('link', { name: 'Colombia', exact: true })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Colombia', exact: true })).toHaveClass(/site-header__accordion-lead/);
  await expect(drawer.getByRole('link', { name: 'Estados Unidos', exact: true })).toHaveClass(/site-header__accordion-lead/);
  await expect(drawer.getByRole('link', { name: 'Banca Libre (Colombia)' })).toHaveCount(0);
  await expect(drawer.getByRole('button', { name: 'Mostrar secciones de Colombia' })).toBeVisible();
  await drawer.getByRole('button', { name: 'Mostrar secciones de Colombia' }).click();
  await expect(drawer.getByRole('link', { name: 'Billetes del Siglo Pasado', exact: true })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Billetes del Banco de la República', exact: true })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Emisiones colombianas en el extranjero', exact: true })).toBeVisible();
  await expect(drawer.getByRole('button', { name: 'Mostrar secciones de Estados Unidos' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Moneda Colonial', exact: true })).toHaveCount(0);
  await drawer.getByRole('button', { name: 'Mostrar secciones de Estados Unidos' }).click();
  await expect(drawer.getByRole('link', { name: 'Moneda Colonial', exact: true })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Billetes obsoletos', exact: true })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Departamento del Tesoro', exact: true })).toBeVisible();
  await expect(drawer.locator('.site-header__accordion--nested')).toHaveCount(2);
  await expect(drawer.getByRole('link', { name: /Felipe V/ })).toHaveCount(0);
  await drawer.locator('summary', { hasText: 'Colecciones virtuales — Numismática' }).click();
  await expect(drawer.getByRole('link', { name: /Felipe V/ })).toBeVisible();
  await expect(drawer.getByRole('link', { name: /Banco Hipotecario/ })).toHaveCount(0);

  await page.locator('#nav-sec-resources summary').click();
  await expect(drawer.getByRole('link', { name: 'Guías para coleccionistas' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Noticias numismáticas' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Glosario' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Sobre Notofilia' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Política editorial y valoración' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Contacto' })).toBeVisible();
});
