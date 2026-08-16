import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const MUSTACHE = /\{\{[^}]*\}\}/;

async function builtHtml(route: string) {
  const relative = route.replace(/^\//, '').replace(/\/$/, '');
  const file = path.join(process.cwd(), 'dist', relative, 'index.html');
  return readFile(file, 'utf8');
}

test('shipped HTML has no unresolved Mustache', async () => {
  for (const route of ['/j-s-g-boggs/', '/contacto/', '/politica-privacidad-cookies/']) {
    const html = await builtHtml(route);
    expect(html, route).not.toMatch(MUSTACHE);
  }
});

test('Boggs zoom percent is a static 100% fallback', async ({ page }) => {
  const html = await builtHtml('/j-s-g-boggs/');
  expect(html).not.toContain('{{ zoomPercent }}');
  expect(html).toContain('data-zoom-percent');
  expect(html).toMatch(/data-zoom-percent[^>]*>100%/);

  const response = await page.goto('/j-s-g-boggs/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await expect(page.locator('script[src="/support.js"]')).toHaveCount(0);
  await expect(page.locator('script[src="/catalog-zoom.js"]')).toHaveCount(1);
  await expect(page.locator('[data-zoom-percent]')).toHaveText('100%');
});

test('contact and privacy load as native Astro routes', async ({ page }) => {
  const contact = await page.goto('/contacto/', { waitUntil: 'domcontentloaded' });
  expect(contact?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Contacto', level: 1 })).toBeVisible();
  await expect(page.locator('#web3forms-contact-form')).toBeVisible();

  const privacy = await page.goto('/politica-privacidad-cookies/', { waitUntil: 'domcontentloaded' });
  expect(privacy?.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Privacidad|Privacy/);
});
