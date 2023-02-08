import { getWebsiteUrl } from './url';

/**
 * @param {import('@playwright/test').BrowserContext} context
 * */
export async function reset(context) {
  const url = getWebsiteUrl();
  url.pathname = '/admin';

  const page = await context.newPage();

  await page.goto(url.toString());

  await page.click('button');

  await page.waitForLoadState('networkidle');

  await page.close();
}
