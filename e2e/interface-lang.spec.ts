import { test, expect } from '@playwright/test';

const PAGES_WITH_PILL = [
  '/',
  '/coleccion/',
  '/glosario/',
  '/editorial/',
  '/editorial/equipo/',
  '/politica-privacidad-cookies/',
  '/coleccion/polimero-mundial/nepal-10-rupias-2005/',
  '/buscar/',
];

for (const path of PAGES_WITH_PILL) {
  test(`${path} shows the ES/EN interface-language pill`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    const group = page.getByRole('group', { name: /Idioma de la interfaz/ });
    await expect(group).toBeVisible();
    await expect(page.getByRole('button', { name: 'Interfaz en español' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Interface in English' })).toBeVisible();
  });
}

test('EN chrome does not flip html lang and updates header Colección', async ({ page }) => {
  await page.goto('/coleccion/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('html')).toHaveAttribute('data-interface-lang', 'en');
  await expect(page.getByRole('link', { name: 'Collection' })).toBeVisible();
});

test('interface language persists across pages', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await page.goto('/editorial/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-interface-lang', 'en');
  await expect(page.getByRole('button', { name: 'Interface in English' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('privacy policy body follows the header language pill', async ({ page }) => {
  await page.goto('/politica-privacidad-cookies/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy and Cookie Policy' })).toBeVisible();
  await expect(page.locator('[data-privacy-panel="en"]')).toBeVisible();
  await expect(page.locator('[data-privacy-panel="es"]')).toBeHidden();
});
