import { test, expect } from '@playwright/test';

type CollectionStats = {
  billetes: number;
  monedas: number;
  paises: number;
  fichas: number;
  paginas: number;
};

test('live inventory counts match across home, editorial, and llms.txt', async ({
  page,
  request,
}) => {
  const indexRes = await request.get('/data/catalog-index.json');
  expect(indexRes.ok()).toBeTruthy();
  const index = await indexRes.json();
  const stats = index.stats as CollectionStats;
  expect(stats.paises).toBe(index.countries.length);
  expect(stats.fichas).toBe(index.pieceCount);

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const footer = page.locator('footer');
  await expect(footer).toContainText(`${stats.billetes} billetes`);
  await expect(footer).toContainText(`${stats.monedas} monedas`);
  await expect(footer).toContainText(`${stats.paises} países`);
  await expect(footer).toContainText(`${stats.fichas} fichas`);
  await expect(page.locator('main')).toContainText(`${stats.billetes} billetes`);

  await page.goto('/editorial/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main')).toContainText(
    'Una ficha es la entrada de catálogo; un billete es cada ejemplar documentado',
  );
  await expect(page.getByRole('heading', { name: 'Fuentes del catálogo' })).toBeVisible();
  await expect(page.locator('main')).toContainText('no confirmado');
  await expect(page.locator('main')).toContainText('Banknote World');

  const llms = await request.get('/llms.txt');
  expect(llms.ok()).toBeTruthy();
  const llmsText = await llms.text();
  expect(llmsText).toContain(`${stats.fichas} fichas`);
  expect(llmsText).toContain(`${stats.billetes} billetes`);
  expect(llmsText).toContain(`${stats.paises} países`);
});
