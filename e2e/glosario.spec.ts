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
    await search.fill('conversion day');
    await expect(page.locator('[data-glossary-term]:visible')).toHaveCount(1);
    await expect(page.locator('#c-day')).toBeVisible();
    await page.getByRole('button', { name: 'Borrar búsqueda' }).click();
    await expect(page.locator('[data-glossary-term]:visible')).toHaveCount(95);

    await page.getByRole('button', { name: 'Disciplina' }).click();
    const visible = page.locator('[data-glossary-term]:visible');
    await expect(visible).toHaveCount(4);
    await expect(page.locator('#notafilia')).toBeVisible();
    await expect(page.locator('#numismatica')).toBeVisible();
    await expect(page.locator('#escripofilia')).toBeVisible();
    await expect(page.locator('#exonumia')).toBeVisible();
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

  test('defined terms on cream cards are ink or darker, never cream', async ({ page }) => {
    await page.goto('/glosario/', { waitUntil: 'domcontentloaded' });
    const card = page.locator('#abrasiones');
    await expect(card).toBeVisible();
    const colors = await card.evaluate((el) => {
      const term = el.querySelector('h2 a');
      const body = el.querySelector('p');
      const related = el.querySelector('p a');
      const css = (node) => {
        if (!node) return null;
        const value = getComputedStyle(node).color;
        const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return { value, luminance: null };
        const [r, g, b] = match.slice(1).map(Number);
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        return { value, luminance, r, g, b };
      };
      return { term: css(term), body: css(body), related: css(related) };
    });
    expect(colors.term.luminance, JSON.stringify(colors)).toBeLessThanOrEqual(colors.body.luminance);
    // Cream #e7ddc4 is ~0.87 luminance; ink/bg on cream cards must stay dark.
    expect(colors.term.luminance).toBeLessThan(0.35);
    expect(colors.related.luminance).toBeLessThan(0.35);
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
    if (term.slug === 'notafilia') {
      const wiki = page.getByRole('link', { name: /Wikipedia en español/i });
      await expect(wiki).toHaveAttribute('href', 'https://es.wikipedia.org/wiki/Notafilia');
      await expect(wiki).toContainText('se abre en una pestaña nueva');
    }
  });
}

test('built glossary HTML contains notafilia with scripts stripped', async () => {
  const file = path.join(process.cwd(), 'dist/glosario/index.html');
  const html = await readFile(file, 'utf8');
  const withoutScripts = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  expect(withoutScripts.toLowerCase()).toContain('notafilia');
  expect((withoutScripts.match(/notafilia/gi) ?? []).length).toBeGreaterThan(0);
});
