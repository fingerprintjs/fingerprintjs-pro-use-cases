// @ts-check
import { test } from '@playwright/test';
import { writeFileSync } from 'fs';
import { FLIGHT_TAG } from '../../client/components/web-scraping/flightTags';
import { isDebugMode } from '../utils';

/**
 * @param {import('playwright-core').ElementHandle} parent
 * @param {string} selector
 */
const scrapeText = async (parent, selector) => {
  const element = await parent.$(selector);
  return element ? await element.textContent() : null;
};

test.describe('Scraping flights', () => {
  test('is possible with Bot detection off', async ({ page }) => {
    await page.goto('/web-scraping?disableBotDetection=1');
    await page.click('button:has-text("Search flights")');
    await page.waitForLoadState('networkidle');
    const flightCards = await page.$$(`[data-test="${FLIGHT_TAG.card}"]`);
    const flightData = [];
    for (const flightCard of flightCards) {
      flightData.push({
        price: await scrapeText(flightCard, `[data-test="${FLIGHT_TAG.price}"]`),
        airline: await scrapeText(flightCard, `[data-test="${FLIGHT_TAG.airline}"]`),
        from: await scrapeText(
          flightCard,
          `[data-test="${FLIGHT_TAG.origin}"] [data-test="${FLIGHT_TAG.airportCode}"]`
        ),
        to: await scrapeText(
          flightCard,
          `[data-test="${FLIGHT_TAG.destination}"] [data-test="${FLIGHT_TAG.airportCode}"]`
        ),
        departureTime: await scrapeText(
          flightCard,
          `[data-test="${FLIGHT_TAG.origin}"] [data-test="${FLIGHT_TAG.time}"]`
        ),
        arrivalTime: await scrapeText(
          flightCard,
          `[data-test="${FLIGHT_TAG.destination}"] [data-test="${FLIGHT_TAG.time}"]`
        ),
      });
    }

    writeFileSync('./e2e/output/flightData.json', JSON.stringify(flightData, null, 2));
    console.log("Scraped flight data saved to 'e2e/output/flightData.json'");

    // If in debug mode, do not close browser right away so user can examine the page
    if (isDebugMode()) {
      await page.pause();
    }
  });
});
