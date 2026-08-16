import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test.describe('glossary index', () => {
  test('ships every term in the initial HTML without JavaScript', async ({ page }) => {
    await page.goto('/glosario/', { waitUntil: 'domcontentloaded' });
    const html = await page.content();
    expect(html.toLowerCase()).toContain('notafilia');
    expect(html).toMatch(/DefinedTermSet/);
    await expect(page.getByRole('heading', { level: 1, name: 'Glosario de Numismática y Notafilia' })).toBeVisible();
    await expect(page.locator('[data-glossary-term]')).toHaveCount(95);
    await expect(page.locator('#notafilia')).toBeVisible();
    await expect(page.locator('#specimen')).toBeVisible();
    await expect(page.locator('#c-day')).toBeVisible();
  });

  test('search and category filters are progressive enhancement', async ({ page }) => {
    await page.goto('/glosario/');
    const search = page.getByRole('searchbox', { name: 'Buscar en el glosario' });
    await search.fill('notafilia');
    await expect(page.locator('[data-glossary-term]:visible')).toHaveCount(1);
    await expect(page.locator('#notafilia')).toBeVisible();
    await page.getByRole('button', { name: 'Borrar búsqueda' }).click();
    await expect(page.locator('[data-glossary-term]:visible')).toHaveCount(95);

    await page.getByRole('button', { name: 'Disciplina' }).click();
    const visible = page.locator('[data-glossary-term]:visible');
    await expect(visible).toHaveCount(4);
    await expect(visible).toContainText(['Notafilia', 'Numismática', 'Escripofilia', 'Exonumia']);
  });

  test('has no serious accessibility violations', async ({ page }) => {
    await page.goto('/glosario/', { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .analyze();
    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact || ''),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

const TERM_PAGES = [
  { slug: 'notafilia', heading: 'Notafilia' },
  { slug: 'specimen', heading: 'Specimen' },
  { slug: 'pick', heading: 'Pick number' },
  { slug: 'friedberg', heading: 'Catálogo Friedberg' },
  { slug: 'billete-sin-circular', heading: 'Sin circular (UNC)' },
];

for (const term of TERM_PAGES) {
  test(`term page /glosario/${term.slug}/ renders DefinedTerm HTML`, async ({ page }) => {
    const response = await page.goto(`/glosario/${term.slug}/`, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    const html = await page.content();
    expect(html).toMatch(/DefinedTerm/);
    await expect(page.getByRole('heading', { level: 1, name: term.heading })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Volver al glosario' })).toHaveAttribute('href', '/glosario/');
  });
}

test('built glossary HTML contains notafilia with scripts stripped', async () => {
  const file = path.join(process.cwd(), 'dist/glosario/index.html');
  const html = await readFile(file, 'utf8');
  const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  expect(withoutScripts.toLowerCase()).toContain('notafilia');
  expect((withoutScripts.match(/notafilia/gi) ?? []).length).toBeGreaterThan(0);
});
