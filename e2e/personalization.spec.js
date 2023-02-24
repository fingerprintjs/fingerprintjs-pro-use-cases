// @ts-check
import { expect, test } from '@playwright/test';
import { reset } from './admin';

test.describe('Personalization', () => {
  test.beforeEach(async ({ page, context }) => {
    await reset(context);

    await page.goto('/personalization', {
      waitUntil: 'networkidle',
    });
    await page.click('text="Okay, I understand"');
  });

  test('should add and remove items from cart', async ({ page }) => {
    const products = page.locator('.ProductCard');
    const cartItems = page.locator('.CartItem');

    const product = products.nth(0);
    const productPrice = parseFloat(await product.locator('.ProductCard_Price').getAttribute('data-price'));

    await product.locator('.ProductCard_AddToCart').click();

    const cartItem = cartItems.first();

    await expect(cartItem.locator('.CartItem_Name')).toHaveText(
      await product.locator('.ProductCard_Name').textContent()
    );

    await cartItem.locator('.CartItem_Add').click();

    await expect(cartItem.locator('.CartItem_Count')).toHaveText('2');
    await expect(cartItem.locator('.CartItem_Price')).toHaveText(`$${productPrice * 2}`);

    await cartItem.locator('.CartItem_Remove').click();
    await expect(cartItem.locator('.CartItem_Count')).toHaveText('1');
    await expect(cartItem.locator('.CartItem_Price')).toHaveText(`$${productPrice}`);

    await cartItem.locator('.CartItem_Remove').click();

    await expect.poll(() => cartItems.count()).toBe(0);
  });

  test('should remember cart contents after reloading page', async ({ page }) => {
    const products = page.locator('.ProductCard');
    const cartItems = page.locator('.CartItem');

    const product = products.nth(0);
    const cartItem = cartItems.first();

    await product.locator('.ProductCard_AddToCart').click();

    await cartItem.locator('.CartItem_Add').click();

    await page.reload();

    await expect.poll(() => cartItem.count()).toBe(1);
    await expect(cartItem.locator('.CartItem_Count')).toHaveText('2');
  });

  test('should remember dark mode selection', async ({ page }) => {
    const toggle = await page.locator('.DarkMode_toggle');

    await page.waitForTimeout(2000);

    await toggle.click();
    await expect.poll(() => toggle.getAttribute('data-checked')).toBe('true');

    await page.reload();

    await expect.poll(() => toggle.getAttribute('data-checked')).toBe('true');
  });

  test('should filter products and remember search history', async ({ page }) => {
    await page.fill('[name="search"]', 'Decaf coffee');

    const searchHistory = page.locator('.SearchHistory_Item');
    const products = page.locator('.ProductCard');

    const checkFoundProducts = async () => {
      await expect
        .poll(async () => {
          const textContents = await Promise.all((await products.all()).map((p) => p.textContent()));

          return textContents.every((p) => p.includes('Decaf coffee'));
        })
        .toBe(true);
    };

    await checkFoundProducts();
    await expect.poll(() => searchHistory.count()).toBe(1);

    await page.reload();
    await expect.poll(() => searchHistory.count()).toBe(1);
    await searchHistory.first().click();

    await checkFoundProducts();
  });
});
