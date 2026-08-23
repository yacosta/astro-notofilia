import { test, expect, type Locator } from '@playwright/test';

async function hideCookies(page: import('@playwright/test').Page) {
  await page.addStyleTag({ content: '#cookie-banner{display:none!important;}' });
}

async function topmostIs(control: Locator) {
  return control.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return top === el || el.contains(top);
  });
}

test('Ampliar zoom in still returns to the catalog page', async ({ page }) => {
  const response = await page.goto(
    '/coleccion/colombia/banco-de-la-republica-10000-pesos-specimen/',
    { waitUntil: 'domcontentloaded' },
  );
  expect(response?.ok()).toBeTruthy();
  await hideCookies(page);

  const open = page.getByRole('button', {
    name: /Ampliar imagen del billete: Diez Mil Pesos · 15 de octubre de 1994/,
  });
  const dialog = page.locator('[data-zoom-dialog="1994-embera"]');
  const closeBtn = dialog.locator('[data-zoom-close]');
  const zoomIn = dialog.locator('[data-zoom-in]');
  const pageUrl = /\/coleccion\/colombia\/banco-de-la-republica-10000-pesos-specimen\/$/;

  await open.click();
  await expect(dialog).toBeVisible();
  await expect(closeBtn).toBeVisible();
  expect(await topmostIs(closeBtn)).toBe(true);

  await zoomIn.click();
  await expect(dialog.locator('[data-zoom-percent]')).toHaveText('125%');
  expect(await topmostIs(closeBtn)).toBe(true);

  await closeBtn.click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(pageUrl);
  await expect(page.locator('h1').first()).toBeVisible();

  await open.click();
  await expect(dialog).toBeVisible();
  await dialog.locator('[data-zoom-image]').click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(pageUrl);

  await open.click();
  await expect(dialog).toBeVisible();
  await zoomIn.click();
  await expect(dialog.locator('[data-zoom-percent]')).toHaveText('125%');
  await dialog.locator('[data-zoom-image]').click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(pageUrl);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('Boggs Ampliar close stays on top after extra zoom', async ({ page }) => {
  const response = await page.goto('/j-s-g-boggs/', { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBeTruthy();
  await hideCookies(page);

  const dialog = page.locator('[data-zoom-dialog="jsg-boggs"]');
  await page.getByRole('button', { name: /Ampliar retrato de J\.S\.G\. Boggs/ }).click();
  await expect(dialog).toBeVisible();

  const closeBtn = dialog.locator('[data-zoom-close]');
  await expect(closeBtn).toBeVisible();
  expect(await topmostIs(closeBtn)).toBe(true);

  await dialog.locator('[data-zoom-in]').click();
  await expect(dialog.locator('[data-zoom-percent]')).toHaveText('125%');
  expect(await topmostIs(closeBtn)).toBe(true);

  await closeBtn.click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/j-s-g-boggs\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'J.S.G. Boggs' })).toBeVisible();
});
