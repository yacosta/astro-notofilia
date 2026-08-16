import { test, expect } from '@playwright/test';

const PAGES_WITHOUT_KEYWORDS = [
  '/',
  '/editorial/',
  '/editorial/equipo/',
  '/glosario/notafilia/',
  '/coleccion/polimero-mundial/nepal-10-rupias-2005/',
];

for (const path of PAGES_WITHOUT_KEYWORDS) {
  test(`${path} does not emit meta keywords`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
  });
}

test('Nepal ficha is not stuffed with Colombia meta keywords', async ({ page }) => {
  await page.goto('/coleccion/polimero-mundial/nepal-10-rupias-2005/', {
    waitUntil: 'domcontentloaded',
  });
  const keywords = page.locator('meta[name="keywords"]');
  await expect(keywords).toHaveCount(0);
  const html = await page.locator('head').innerHTML();
  expect(html.toLowerCase()).not.toMatch(/<meta[^>]*name="keywords"[^>]*billetes de colombia/i);
});

test('named editor profile is Yezid Acosta', async ({ page }) => {
  await page.goto('/editorial/equipo/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { level: 1, name: 'Yezid Acosta' })).toBeVisible();
  await expect(page.locator('meta[name="author"]')).toHaveAttribute('content', 'Yezid Acosta');
  await expect(
    page.getByRole('link', { name: /github\.com\/yacosta/i }),
  ).toHaveAttribute('href', 'https://github.com/yacosta');
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  const person = jsonLd['@graph'].find((node: { '@type': string }) => node['@type'] === 'Person');
  expect(person.name).toBe('Yezid Acosta');
  expect(person.jobTitle).toBe('Editor');
  expect(person.sameAs).toContain('https://github.com/yacosta');
});

test('homepage Organization JSON-LD names the founder', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  const org = jsonLd['@graph'].find((node: { '@type': string }) => node['@type'] === 'Organization');
  expect(org.founder.name).toBe('Yezid Acosta');
  expect(org.founder['@id']).toBe('https://notofilia.com/editorial/equipo/#person');
});

test('glossary Notafilia claims the Wikipedia article', async ({ page }) => {
  await page.goto('/glosario/notafilia/', { waitUntil: 'domcontentloaded' });
  const wiki = page.getByRole('link', { name: /Wikipedia en español/i });
  await expect(wiki).toHaveAttribute('href', 'https://es.wikipedia.org/wiki/Notafilia');
  await expect(wiki).toHaveAttribute('target', '_blank');
  await expect(wiki).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(wiki).toContainText('se abre en una pestaña nueva');
  const jsonLd = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  const term = jsonLd['@graph'].find((node: { '@type': string }) => node['@type'] === 'DefinedTerm');
  expect(term.sameAs).toBe('https://es.wikipedia.org/wiki/Notafilia');
});

test('editorial policy documents the Wikipedia listing without claiming PageRank', async ({
  page,
}) => {
  await page.goto('/editorial/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Mención en Wikipedia' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Notafilia en la Wikipedia/i })).toHaveAttribute(
    'href',
    'https://es.wikipedia.org/wiki/Notafilia',
  );
  await expect(page.locator('#wikipedia + p')).toContainText('nofollow');
  await expect(page.locator('#wikipedia + p')).toContainText('archive.org');
});
