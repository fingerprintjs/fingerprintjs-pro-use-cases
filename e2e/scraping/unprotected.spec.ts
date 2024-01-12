import { Locator, expect, test } from '@playwright/test';
import { writeFileSync } from 'fs';
import { TEST_IDS } from '../../src/client/testIDs';

const TEST_ID = TEST_IDS.webScraping;

const scrapeText = async (parent: Locator, testId: string) => {
  const element = await parent.getByTestId(testId).first();
  return element ? await element.textContent() : null;
};

test.describe('Scraping flights', () => {
  test('is possible with Bot detection off', async ({ page }) => {
    await page.goto('/web-scraping?disableBotDetection=1', { waitUntil: 'networkidle' });
    // Artificial wait necessary to prevent flakiness
    await page.waitForTimeout(3000);

    const flightCards = await page.getByTestId(TEST_ID.card).all();
    expect(flightCards.length > 0).toBe(true);

    const flightData = [];
    for (const flightCard of flightCards) {
      flightData.push({
        price: await scrapeText(flightCard, TEST_ID.price),
        airline: await scrapeText(flightCard, TEST_ID.airline),
        from: await scrapeText(flightCard, TEST_ID.originAirportCode),
        to: await scrapeText(flightCard, TEST_ID.destinationAirportCode),
        departureTime: await scrapeText(flightCard, TEST_ID.departureTime),
        arrivalTime: await scrapeText(flightCard, TEST_ID.arrivalTime),
      });
    }

    expect(flightData.length > 0).toBe(true);
    writeFileSync('./e2e/output/flightData.json', JSON.stringify(flightData, null, 2));
  });
});
