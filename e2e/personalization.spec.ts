import { expect, test } from '@playwright/test';
import { reset } from './admin';
import { TEST_IDS } from '../src/client/e2eTestIDs';

const CART_ID = TEST_IDS.common.cart;
const PAGE_ID = TEST_IDS.personalization;

test.describe('Personalization', () => {
  test.beforeEach(async ({ page, context }) => {
    await reset(context);

    await page.goto('/personalization', {
      waitUntil: 'networkidle',
    });
    await page.click('text="Okay, I understand"');
  });

  test('should add and remove items from cart', async ({ page }) => {
    const products = page.getByTestId(PAGE_ID.coffeeProduct);
    const cartItems = page.getByTestId(CART_ID.cartItem);
    const getSubTotal = async () => {
      const subTotal = await page.getByTestId(CART_ID.cartSubTotal).getAttribute('data-test-value');
      return parseFloat(subTotal);
    };

    const product = products.nth(0);
    const productPrice = parseFloat(await product.getByTestId(PAGE_ID.coffeeProductPrice).getAttribute('data-price'));
    await product.getByTestId(PAGE_ID.addToCart).click();
    const cartItem = cartItems.first();

    await expect(cartItem.getByTestId(CART_ID.cartItemName)).toHaveText(
      await product.getByTestId(PAGE_ID.coffeeProductName).textContent(),
    );
    const subTotal = await getSubTotal();
    expect(subTotal).toBe(productPrice);

    await cartItem.getByTestId(CART_ID.cartItemPlusOne).click();
    await expect(cartItem.getByTestId(CART_ID.cartItemCount)).toHaveText('02');
    const subTotal2 = await getSubTotal();
    expect(subTotal2).toBe(productPrice * 2);

    await cartItem.getByTestId(CART_ID.cartItemMinusOne).click();
    await expect(cartItem.getByTestId(CART_ID.cartItemCount)).toHaveText('01');
    const subTotal3 = await getSubTotal();
    expect(subTotal3).toBe(productPrice);

    await cartItem.getByTestId(CART_ID.cartItemMinusOne).click();
    await expect.poll(() => cartItems.count()).toBe(0);
  });

  test.only('should remember cart contents after reloading page', async ({ page }) => {
    const products = page.getByTestId(PAGE_ID.coffeeProduct);
    const cartItems = page.getByTestId(CART_ID.cartItem);

    const product = products.nth(0);
    const cartItem = cartItems.first();

    await product.getByTestId(PAGE_ID.addToCart).click();
    await cartItem.getByTestId(CART_ID.cartItemPlusOne).click();

    await page.reload();

    await expect.poll(() => cartItem.count()).toBe(1);
    await expect(cartItem.getByTestId(CART_ID.cartItemCount)).toHaveText('02');
  });

  test('should filter products and remember search history', async ({ page }) => {
    await page.fill('[name="search"]', 'Decaf coffee');

    const searchHistory = page.locator('.SearchHistory_Item');
    const products = page.locator('.ProductCard');

    const checkFoundProducts = async () => {
      await page.waitForTimeout(3000);
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
