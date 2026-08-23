import { test, expect } from '@playwright/test';

const SWITCHER_PAGES = [
  { path: '/', enHref: '/en/' },
  { path: '/coleccion/colombia/', enHref: '/en/collection/colombia/' },
  {
    path: '/coleccion/pop-art/pele-bicycle-kick-the-king/',
    enHref: '/en/collection/pop-art/pele-bicycle-kick-the-king/',
  },
  { path: '/coleccion/pop-art/', enHref: '/en/collection/pop-art/' },
  {
    path: '/coleccion/colombia/cartagena-1-real-1813/',
    enHref: '/en/collection/colombia/cartagena-1-real-1813/',
  },
  {
    path: '/coleccion/un-dolar-sello-rojo-1928/',
    enHref: '/en/collection/one-dollar-red-seal-1928/',
  },
  {
    path: '/coleccion/food-coupons-usda/',
    enHref: '/en/collection/usda-food-coupons/',
  },
  {
    path: '/coleccion/polimero-mundial/',
    enHref: '/en/collection/world-polymer/',
  },
  { path: '/glosario/', enHref: '/en/glossary/' },
  { path: '/editorial/', enHref: '/en/editorial/' },
  { path: '/editorial/equipo/', enHref: '/en/editorial/team/' },
  { path: '/politica-privacidad-cookies/', enHref: '/en/privacy-cookies/' },
  { path: '/contacto/', enHref: '/en/contact/' },
  { path: '/blog/como-empezar-coleccion-billetes/', enHref: '/en/blog/how-to-start-a-banknote-collection/' },
  { path: '/j-s-g-boggs/', enHref: '/en/j-s-g-boggs/' },
  { path: '/buscar/', enHref: '/en/' },
];

for (const { path, enHref } of SWITCHER_PAGES) {
  test(`${path} switcher is an <a href> to ${enHref}`, async ({ page }) => {
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#lang-es, #lang-en')).toHaveCount(0);

    const nav = page.getByRole('group', { name: 'Idioma' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('button')).toHaveCount(0);
    await expect(nav.locator('[aria-current="page"]')).toHaveText(/ES/);
    const en = nav.getByRole('link', { name: /EN/ });
    await expect(en).toBeVisible();
    await expect(en).toHaveAttribute('href', enHref);
    await expect(en).toHaveAttribute('hreflang', 'en');
  });
}

test('homepage ES → /en/ and EN → / without localStorage', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).not.toHaveAttribute('lang', 'es');

  const es = page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /ES/ });
  await expect(es).toHaveAttribute('href', '/');
  await es.click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
});

test('Pelé ficha is a reciprocal pair with English body copy', async ({ page }) => {
  await page.goto('/coleccion/pop-art/pele-bicycle-kick-the-king/', {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/collection\/pop-art\/pele-bicycle-kick-the-king\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pelé — The King');
  await expect(page.getByRole('heading', { name: 'About the Work' })).toBeVisible();
  await expect(page.locator('main')).toContainText('hand-signed by Rency');
  await expect(page.locator('main')).not.toContainText('firmado a mano por Rency');
  await expect(
    page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /ES/ }),
  ).toHaveAttribute('href', '/coleccion/pop-art/pele-bicycle-kick-the-king/');
});

test('Colombia hub is a reciprocal pair', async ({ page }) => {
  await page.goto('/coleccion/colombia/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/collection\/colombia\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /ES/ }),
  ).toHaveAttribute('href', '/coleccion/colombia/');
});

test('Cartagena ficha is a reciprocal pair with English body copy', async ({ page }) => {
  await page.goto('/coleccion/colombia/cartagena-1-real-1813/', {
    waitUntil: 'domcontentloaded',
  });
  await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/collection\/colombia\/cartagena-1-real-1813\/?$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('main')).not.toContainText('Ampliar imagen');
  await expect(
    page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /ES/ }),
  ).toHaveAttribute('href', '/coleccion/colombia/cartagena-1-real-1813/');
});

test('Pop Art hub EN switcher does not fall back to the collection index', async ({ page }) => {
  await page.goto('/coleccion/pop-art/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /EN/ }).click();
  await expect(page).toHaveURL(/\/en\/collection\/pop-art\/?$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Pop Art');
  await expect(
    page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /ES/ }),
  ).toHaveAttribute('href', '/coleccion/pop-art/');
});

test('unpaired noticia falls back to the news index', async ({ page }) => {
  await page.goto('/noticias/paysandu-primer-encuentro-numismatico/', {
    waitUntil: 'domcontentloaded',
  });
  const en = page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /EN/ });
  await expect(en).toHaveAttribute('href', '/en/news/');
  await expect(en).toHaveAttribute('data-i18n-fallback', 'section');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Paysandú');
});

test('EN collection nav points at /en/collection/colombia/', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: 'Collection', exact: true })).toHaveAttribute(
    'href',
    '/en/collection/colombia/',
  );
});

test('search form stays /buscar/ on English pages', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.site-header__search-form')).toHaveAttribute('action', '/buscar/');
});

test('404 switcher goes to English home', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/', { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(404);
  const en = page.getByRole('group', { name: 'Idioma' }).getByRole('link', { name: /EN/ });
  await expect(en).toHaveAttribute('href', '/en/');
});

test('English 404 switcher goes to Spanish home', async ({ page }) => {
  await page.goto('/en/404/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const es = page.getByRole('group', { name: 'Language' }).getByRole('link', { name: /ES/ });
  await expect(es).toHaveAttribute('href', '/');
});

test('html lang=en is not overwritten on English pages', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-page-locale', 'en');
});
