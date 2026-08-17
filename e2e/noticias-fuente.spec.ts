import { test, expect } from '@playwright/test';

const PAYSANDU = '/noticias/paysandu-primer-encuentro-numismatico/';
const PAYSANDU_SOURCE = 'https://www.eltelegrafo.com/2026/08/paysandu-tuvo-su-primer-encuentro-numismatico/';

test('noticia article states Fuente with the original source link', async ({ page }) => {
  const response = await page.goto(PAYSANDU, { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();

  const credits = page.locator('.source-credit');
  await expect(credits).toHaveCount(2);
  await expect(credits.first()).toContainText('Fuente:');
  await expect(credits.last()).toContainText('Fuente:');

  const links = credits.getByRole('link');
  await expect(links).toHaveCount(2);
  for (const link of await links.all()) {
    await expect(link).toHaveAttribute('href', PAYSANDU_SOURCE);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toContainText('Diario El Telégrafo');
    await expect(link).toContainText('se abre en una pestaña nueva');
  }

  await expect(page.getByText('Revisado por')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Yezid Acosta' })).toHaveCount(0);
});

test('homepage featured news states Fuente with external source links', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const feature = page.locator('section[aria-labelledby="news-heading"]');
  await expect(feature.getByRole('heading', { name: 'Noticias seleccionadas' })).toBeVisible();

  const credits = feature.locator('.source-credit');
  await expect(credits).toHaveCount(4);
  const links = feature.locator('.source-credit a');
  await expect(links).toHaveCount(4);
  for (const link of await links.all()) {
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toContainText('se abre en una pestaña nueva');
  }
  await expect(feature.getByText('Fuente:')).toHaveCount(4);
});

test('noticias index states Fuente with the original source link', async ({ page }) => {
  await page.goto('/noticias/', { waitUntil: 'domcontentloaded' });
  const credits = page.locator('.source-credit');
  const count = await credits.count();
  expect(count).toBeGreaterThan(20);

  const paysandu = page.locator('li.card').filter({
    has: page.getByRole('heading', { name: 'Paysandú tuvo su primer encuentro numismático' }),
  });
  await expect(paysandu.locator('.source-credit')).toContainText('Fuente:');
  await expect(paysandu.getByRole('link', { name: /Diario El Telégrafo/ })).toHaveAttribute(
    'href',
    PAYSANDU_SOURCE,
  );
});

test('Fuente label switches to Source with the language pill', async ({ page }) => {
  await page.goto(PAYSANDU, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Interface in English' }).click();
  await expect(page.locator('.source-credit').first()).toContainText('Source:');
  await expect(page.locator('.source-credit a').first()).toContainText('opens in a new tab');
});
