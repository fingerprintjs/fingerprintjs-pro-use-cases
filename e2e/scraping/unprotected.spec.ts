import { ElementHandle, expect, test } from '@playwright/test';
import { writeFileSync } from 'fs';
import { FLIGHT_TAG } from '../../src/client/components/web-scraping/flightTags';

const scrapeText = async (parent: ElementHandle, selector: string) => {
  const element = await parent.$(selector);
  return element ? await element.textContent() : null;
};

test.describe('Scraping flights', () => {
  test('is possible with Bot detection off', async ({ page }) => {
    await page.goto('/web-scraping?disableBotDetection=1');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    const flightCards = await page.$$(`[data-test="${FLIGHT_TAG.card}"]`);
    console.log('Found flight cards: ', flightCards.length);
    expect(flightCards.length > 0).toBe(true);

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

    expect(flightData.length > 0).toBe(true);
    writeFileSync('./e2e/output/flightData.json', JSON.stringify(flightData, null, 2));
    console.log("Scraped flight data saved to 'e2e/output/flightData.json'");
  });
});
