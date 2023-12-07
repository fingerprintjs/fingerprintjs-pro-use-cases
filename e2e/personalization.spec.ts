import { expect, test } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';

const CART_ID = TEST_IDS.common.cart;
const PERS_ID = TEST_IDS.personalization;

test.describe('Personalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/personalization', {
      waitUntil: 'networkidle',
    });
    await page.getByText('Okay, I understand').click();
    await resetScenarios(page);
  });

  test('should add and remove items from cart', async ({ page }) => {
    const products = page.getByTestId(PERS_ID.coffeeProduct);
    const cartItems = page.getByTestId(CART_ID.cartItem);
    const getSubTotal = async () => {
      const subTotal =
        (await page.getByTestId(CART_ID.cartSubTotal).getAttribute('data-test-value')) ?? 'Subtotal not found';
      return parseFloat(subTotal);
    };

    const product = products.nth(0);
    const productPrice = parseFloat(
      (await product.getByTestId(PERS_ID.coffeeProductPrice).getAttribute('data-price')) ?? 'Product price not found',
    );
    await product.getByTestId(PERS_ID.addToCart).click();
    const cartItem = cartItems.first();

    const cartItemName = (await cartItem.getByTestId(CART_ID.cartItemName).textContent()) ?? 'Cart item name not found';
    const productName =
      (await product.getByTestId(PERS_ID.coffeeProductName).textContent()) ?? 'Product name not found';
    expect(cartItemName).toBe(productName);

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

  test('should remember cart contents after reloading page', async ({ page }) => {
    const products = page.getByTestId(PERS_ID.coffeeProduct);
    const cartItems = page.getByTestId(CART_ID.cartItem);

    const product = products.nth(0);
    const cartItem = cartItems.first();

    await product.getByTestId(PERS_ID.addToCart).click();
    await cartItem.getByTestId(CART_ID.cartItemPlusOne).click();

    await page.reload();

    await expect.poll(() => cartItem.count()).toBe(1);
    await expect(cartItem.getByTestId(CART_ID.cartItemCount)).toHaveText('02');
  });

  test('should filter products and remember search history', async ({ page }) => {
    await page.getByTestId(PERS_ID.search).fill('Decaf coffee');

    const searchHistory = page.getByTestId(PERS_ID.searchHistoryItem);
    const products = page.getByTestId(PERS_ID.coffeeProduct);

    const checkFoundProducts = async () => {
      await expect
        .poll(async () => {
          const textContents = await Promise.all((await products.all()).map((p) => p.textContent()));
          return textContents.every((p) => p?.includes('Decaf coffee'));
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
