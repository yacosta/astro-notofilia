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
        await expect(page.locator('script[src="/catalog-zoom.js"]')).toHaveCount(1);
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

test('catalog piece exposes research chrome', async ({ page }) => {
  await page.goto('/coleccion/reserva-federal/cien-dolares-1990-cleveland/');
  await expect(page.getByText('Identificador permanente')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Datos de la ficha' })).toBeVisible();
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
});

test('coins have a dedicated numismática catalog page', async ({ page }) => {
  await page.goto('/coleccion/numismatica/');
  await expect(page.locator('script[src="/support.js"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: 'Catálogo de Numismática' })).toBeVisible();
  await expect(page.locator('.catalog-banknote-card')).toHaveCount(7);
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
  await expect(page.getByText(/Serie 1\.\s*ª,\s*N\.\s*°\s*170390/)).toBeVisible();

  const meta = page.locator('.catalog-record-meta');
  await expect(meta.getByText('Veinticinco Pesos, en moneda corriente')).toBeVisible();
  await expect(meta.getByText('N.° 170390')).toBeVisible();
  await expect(meta.getByText('Bogotá, 4 de marzo de 1895')).toBeVisible();
  await expect(meta.getByText('Circulado')).toBeVisible();
  await expect(meta).not.toContainText(/specimen/i);
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
  await expect(drawer.getByRole('link', { name: 'Explorar la colección' })).toBeHidden();

  await numismatica.locator(':scope > summary').click();
  await expect(numismatica).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Catálogo de Numismática' })).toBeVisible();
  await expect(drawer.getByRole('link', { name: /Felipe V/ })).toBeVisible();

  await notafilia.locator(':scope > summary').click();
  await expect(notafilia).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Explorar la colección' })).toBeVisible();

  const colombia = page.locator('#nav-sec-colombia');
  await expect(colombia).not.toHaveAttribute('open');
  await colombia.locator(':scope > summary').click();
  await expect(colombia).toHaveAttribute('open');
  await expect(drawer.getByRole('link', { name: 'Catálogo de Billetes de Colombia' })).toBeVisible();
});
