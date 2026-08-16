import { test, expect } from '@playwright/test';

const PAGES_WITH_PILL = [
  '/',
  '/coleccion/',
  '/glosario/',
  '/editorial/',
  '/editorial/equipo/',
  '/politica-privacidad-cookies/',
  '/coleccion/certificados-de-pago-militar/',
  '/buscar/',
  '/contacto/',
  '/blog/como-empezar-coleccion-billetes/',
  '/j-s-g-boggs/',
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

test('catalog hub body switches to English with the header pill', async ({ page }) => {
  await page.goto('/coleccion/certificados-de-pago-militar/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Certificados de Pago Militar (MPC)' })).toBeVisible();
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1, name: 'Military Payment Certificates (MPC)' })).toBeVisible();
});

test('editorial policy body switches to English with the header pill', async ({ page }) => {
  await page.goto('/editorial/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Política editorial, fuentes y valoración' })).toBeVisible();
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Editorial policy, sources, and valuation' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What we publish' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('contact form labels switch to English', async ({ page }) => {
  await page.goto('/contacto/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Contact' })).toBeVisible();
  await expect(page.getByText('Send message', { exact: true })).toBeVisible();
});

test('blog article title and body switch to English', async ({ page }) => {
  await page.goto('/blog/como-empezar-coleccion-billetes/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Cómo empezar una colección de billetes' })).toBeVisible();
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'How to Start a Banknote Collection' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '1. Choose a focus' })).toBeVisible();
});

test('Boggs profile body switches to English', async ({ page }) => {
  await page.goto('/j-s-g-boggs/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.getByText('Nationality', { exact: true })).toBeVisible();
  await expect(page.getByText('Artist profile', { exact: false })).toBeVisible();
});
  const response = await page.goto('/this-page-does-not-exist/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('group', { name: /Idioma de la interfaz/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Interfaz en español' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Interface in English' })).toBeVisible();
});
