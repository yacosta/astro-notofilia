import { test, expect } from '@playwright/test';

test('About pages explain the private collection', async ({ page }) => {
  const es = await page.goto('/nosotros/', { waitUntil: 'domcontentloaded' });
  expect(es?.ok()).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1, name: 'Sobre Notofilia' })).toBeVisible();
  await expect(page.getByText('Las piezas no están a la venta')).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://notofilia.com/nosotros/',
  );
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
    'href',
    'https://notofilia.com/en/about/',
  );

  const en = await page.goto('/en/about/', { waitUntil: 'domcontentloaded' });
  expect(en?.ok()).toBeTruthy();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'About Notofilia' })).toBeVisible();
  await expect(page.getByText('Items are not for sale')).toBeVisible();
});

test('United States and Spain landings list documented pieces', async ({ page }) => {
  await page.goto('/coleccion/estados-unidos/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Estados Unidos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Catálogo de Estados Unidos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Emisores y periodos' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Ejemplares destacados' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Colecciones especiales relacionadas' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Certificado de Oro/ }).first()).toBeVisible();

  await page.goto('/coleccion/espana/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'España' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Colecciones especiales relacionadas' })).toHaveCount(0);

  await page.goto('/en/collection/spain/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1, name: 'Spain' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Related special collections' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Felipe V/ }).first()).toBeVisible();
});

test('collection hub exposes stable recent and countries anchors', async ({ page }) => {
  await page.goto('/coleccion/#recent', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#recent')).toBeVisible();
  await expect(page.locator('#countries')).toBeAttached();
  await page.goto('/en/collection/#countries', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#countries')).toBeVisible();
});

test('desktop collection menu stays open when moving onto a category', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  const collectionItem = page.locator('[data-nav-item="collection"]');
  const collectionPanel = page.locator('#nav-panel-collection');
  const unitedStates = collectionPanel.getByRole('link', { name: 'Estados Unidos' });

  await collectionItem.hover();
  await expect(collectionPanel).toBeVisible();
  await unitedStates.hover();
  await expect(collectionPanel).toBeVisible();
  await expect(unitedStates).toBeVisible();

  await page.getByRole('button', { name: 'Abrir menú de Colección' }).click();
  await unitedStates.hover();
  await expect(collectionPanel).toBeVisible();
});

test('world polymer hub cards show country names in alphabetical order', async ({ page }) => {
  await page.goto('/coleccion/polimero-mundial/', { waitUntil: 'domcontentloaded' });
  const cards = page.locator('.catalog-hub-grid a.catalog-banknote-card');
  await expect(cards.first()).toContainText('Bangladesh');
  await expect(cards.first()).not.toContainText('10 Taka');
  await expect(cards.first()).not.toContainText('2000');
  const names = await cards.locator('.font-display').allTextContents();
  expect(names).toEqual(
    [...names].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' })),
  );

  await page.goto('/en/collection/world-polymer/', { waitUntil: 'domcontentloaded' });
  const enCards = page.locator('.catalog-hub-grid a.catalog-banknote-card');
  const enNames = await enCards.locator('.font-display').allTextContents();
  expect(enNames).toEqual(
    [...enNames].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })),
  );
  await expect(enCards.getByText('Qatar', { exact: true })).toBeVisible();
  await expect(enCards.getByText('Solomon Islands', { exact: true })).toBeVisible();
});

test('contact form prefills catalog identifier and URL', async ({ page }) => {
  await page.goto('/contacto/?ficha=NF.test&url=/coleccion/ejemplo/', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('#cf-message')).toHaveValue(/Ficha: NF.test/);
  await expect(page.locator('#cf-message')).toHaveValue(/URL: \/coleccion\/ejemplo\//);
});
