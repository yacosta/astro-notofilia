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
