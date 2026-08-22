import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'coleccion-hub', path: '/coleccion/' },
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

      if (pageDef.path.startsWith('/coleccion/') && pageDef.path !== '/coleccion/') {
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
    await expect(page.getByText(sample.spec).first()).toBeVisible();
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

test('colombia catalog lists banknotes by issue date', async ({ page }) => {
  await page.goto('/coleccion/colombia/');
  const cards = page.locator('.catalog-banknote-card');
  await expect(cards.first()).toContainText('1813');
  await expect(cards.first()).toContainText('Cartagena');
  await expect(cards.last()).toContainText('2016');
  await expect(cards.last()).toHaveAttribute('href', /50000-pesos/);
  await expect(page.getByRole('heading', { name: 'Cartagena de Indias (1811–1815)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bonos y Libranzas Fiscales' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Errores de impresión' })).toBeVisible();

  const hrefs = await cards.evaluateAll((els) =>
    els.map((el) => (el instanceof HTMLAnchorElement ? el.getAttribute('href') : null)),
  );
  expect(hrefs.at(-1)).not.toContain('libranza');
  expect(hrefs.indexOf('/coleccion/colombia/boyaca-libranza-500-pesos-1883/')).toBeGreaterThan(0);
  expect(hrefs.indexOf('/coleccion/colombia/boyaca-libranza-500-pesos-1883/')).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/banco-nacional-25-pesos-1895/') ?? Number.POSITIVE_INFINITY,
  );

  await expect(page.getByRole('heading', { name: 'El Banco Hipotecario' }).last()).toBeVisible();
  const hipotecario = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-hipotecario-5-pesos-1881/"]',
  );
  await expect(hipotecario).toBeVisible();
  await expect(hipotecario).toContainText('1881');
  await expect(hipotecario).toContainText('Cinco Pesos');
  const hipotecarioIdx = hrefs.indexOf('/coleccion/colombia/banco-hipotecario-5-pesos-1881/');
  expect(hipotecarioIdx).toBeGreaterThan(
    hrefs.indexOf('/coleccion/colombia/estado-soberano-cundinamarca-1-peso-1870/') ?? -1,
  );
  await expect(hipotecarioIdx).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/republica-bolivar-1-2-pesos-1882/#un-peso') ?? Number.POSITIVE_INFINITY,
  );

  await expect(page.getByRole('heading', { name: 'El Banco de Rio Hacha' }).last()).toBeVisible();
  const rioHacha = page.locator(
    'a.catalog-banknote-card[href="/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/"]',
  );
  await expect(rioHacha).toBeVisible();
  await expect(rioHacha).toContainText('1883');
  await expect(rioHacha).toContainText('Cinco Pesos');
  const rioHachaIdx = hrefs.indexOf('/coleccion/colombia/banco-de-rio-hacha-5-pesos-1883/');
  expect(rioHachaIdx).toBeGreaterThan(
    hrefs.indexOf('/coleccion/colombia/estado-soberano-cauca-5-pesos-1882/') ?? -1,
  );
  expect(rioHachaIdx).toBeLessThan(
    hrefs.indexOf('/coleccion/colombia/banco-nacional-25-pesos-1895/') ?? Number.POSITIVE_INFINITY,
  );
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

test('MPC Serie 692 $20 ficha shows landscape side-by-side photo', async ({ page }) => {
  await page.goto('/coleccion/certificados-de-pago-militar/20-dolares-serie-692/');
  const img = page.locator('main img[src="/uploads/mpc-series-692-20-dollars-dfa4d4f6.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1448');
  await expect(img).toHaveAttribute('height', '1086');
  await expect(img).toHaveAttribute('alt', /izquierda.*derecha/);
  await expect(page.getByText('Anverso (izquierda) y reverso (derecha) — Colección de Notofilia.com')).toBeVisible();
});

test('English MPC Series 692 $20 ficha shows landscape side-by-side photo', async ({ page }) => {
  await page.goto('/en/collection/military-payment-certificates/20-dollars-series-692/');
  const img = page.locator('main img[src="/uploads/mpc-series-692-20-dollars-dfa4d4f6.jpg"]').first();
  await expect(img).toHaveAttribute('width', '1448');
  await expect(img).toHaveAttribute('height', '1086');
  await expect(img).toHaveAttribute('alt', /at left.*at right/);
  await expect(page.getByText('Obverse (left) and reverse (right) — Notofilia.com Collection')).toBeVisible();
});

test('homepage Logros del Mes features the MPC Serie 692 $20', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('section[aria-labelledby="logros-heading"]');
  const card = section.getByRole('link', { name: /MPC Serie 692 — Veinte Dólares/ });
  await expect(card).toBeVisible();
  await expect(card).toHaveAttribute('href', '/coleccion/certificados-de-pago-militar/20-dolares-serie-692/');
  await expect(card.getByRole('img')).toHaveAttribute('src', '/uploads/mpc-series-692-20-dollars-dfa4d4f6-card.jpg');
});

test('English Colombia catalog lists the Banco Hipotecario proofs', async ({ page }) => {
  await page.goto('/en/collection/colombia/');
  await expect(page.getByRole('heading', { level: 1, name: 'Colombia Banknote Catalog' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: 'El Banco de Rio Hacha' }).last()).toBeVisible();
  const card = page.locator(
    'a.catalog-banknote-card[href="/en/collection/colombia/banco-de-rio-hacha-5-pesos-1883/"]',
  );
  await expect(card).toBeVisible();
  await expect(card).toContainText('Five Pesos (proofs)');
  await expect(card).toContainText('1883');
});

test('coins have a dedicated numismática catalog page', async ({ page }) => {
  await page.goto('/coleccion/numismatica/');
  await expect(page.locator('script[src="/support.js"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: 'Catálogo de Numismática' })).toBeVisible();
  await expect(page.locator('.catalog-banknote-card')).toHaveCount(8);
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

test('collection hub points to the coins catalog', async ({ page }) => {
  await page.goto('/coleccion/');
  await expect(page.getByRole('link', { name: /Catálogo de numismática/i }).first()).toBeVisible();
});

test('collection hub groups banknotes by country', async ({ page }) => {
  await page.goto('/coleccion/');
  await expect(page.locator('#catalog-browser')).not.toHaveAttribute('data-loading', {
    timeout: 15_000,
  });
  const colombia = page.locator('.catalog-country-group[data-country="Colombia"]');
  const unitedStates = page.locator('.catalog-country-group[data-country="Estados Unidos"]');
  await expect(page.getByRole('heading', { level: 3, name: 'Colombia' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Estados Unidos' })).toBeVisible();
  await expect(colombia.locator('.catalog-result-link').first()).toBeVisible();
  await expect(unitedStates.locator('.catalog-result-link').first()).toBeVisible();

  const colombiaHrefs = await colombia.locator('.catalog-result-link').evaluateAll((els) =>
    els.map((el) => (el instanceof HTMLAnchorElement ? el.getAttribute('href') : '')),
  );
  const usHrefs = await unitedStates.locator('.catalog-result-link').evaluateAll((els) =>
    els.map((el) => (el instanceof HTMLAnchorElement ? el.getAttribute('href') : '')),
  );
  expect(colombiaHrefs.length).toBeGreaterThan(0);
  expect(usHrefs.length).toBeGreaterThan(0);
  expect(colombiaHrefs.every((href) => href?.includes('/coleccion/colombia/'))).toBe(true);
  expect(usHrefs.every((href) => !href?.includes('/coleccion/colombia/'))).toBe(true);
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

test('menu drawer restores collection accordions', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menú' }).click();
  const drawer = page.locator('#site-menu-drawer');
  await expect(drawer).toBeVisible();

  const numismatica = page.locator('#nav-sec-numismatica');
  const notafilia = page.locator('#nav-sec-notafilia');
  await expect(numismatica.locator(':scope > summary')).toContainText('Colección virtual - Numismática');
  await expect(notafilia.locator(':scope > summary')).toContainText('Colección virtual - Notafilia');
  await expect(numismatica).not.toHaveAttribute('open');
  await expect(notafilia).not.toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Catálogo de Numismática' })).toBeHidden();
  await expect(drawer.getByRole('link', { name: 'Explorar la colección' })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Specimens' })).toHaveCount(0);

  await numismatica.locator(':scope > summary').click();
  await expect(numismatica).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Catálogo de Numismática' })).toBeVisible();

  const monedasColombia = page.locator('#nav-sec-monedas-colombia');
  await expect(monedasColombia).not.toHaveAttribute('open');
  await monedasColombia.locator(':scope > summary').click();
  await expect(monedasColombia).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: /Felipe V/ })).toBeVisible();

  const monedasMundial = page.locator('#nav-sec-monedas-mundial');
  await expect(monedasMundial).not.toHaveAttribute('open');
  await monedasMundial.locator(':scope > summary').click();
  await expect(monedasMundial).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: /Utrecht, 1761/ })).toBeVisible();

  await notafilia.locator(':scope > summary').click();
  await expect(notafilia).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Explorar la colección' })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Specimens' })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Errores de imprenta' })).toHaveCount(0);
  await expect(drawer.getByRole('link', { name: 'Printing errors' })).toHaveCount(0);

  const colombia = page.locator('#nav-sec-colombia');
  await expect(colombia).not.toHaveAttribute('open');
  await colombia.locator(':scope > summary').click();
  await expect(colombia).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Catálogo de Billetes de Colombia' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Catálogo de Banca Libre' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: /Banco Hipotecario — 5 Pesos/ })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de Pamplona (1883–1884)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de Barranquilla (1900)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de Medellín (188X)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de Oriente (1888)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco Internacional (1884)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Banco de Antioquia, Libranza (1900)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de la Unión (1883)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco del Cauca (1888)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco Unión (Cartagena, 188X)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de Panamá (188X)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco del Norte (1882)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de Colombia (1919)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de Caldas (1919)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco Colombiano, Guatemala (1900)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco Nacional (1895)' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'El Banco de la República' })).toBeVisible();

  const polimero = page.locator('#nav-sec-polimero');
  await expect(polimero).not.toHaveAttribute('open');
  await polimero.locator(':scope > summary').click();
  await expect(polimero).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Catálogo de polímero mundial' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Nepal' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'México' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Chile' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'Bangladesh' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'China' })).toBeVisible();
});
