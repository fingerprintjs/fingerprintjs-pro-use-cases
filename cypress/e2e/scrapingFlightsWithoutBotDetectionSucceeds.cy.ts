import { FLIGHT_TAG } from '../../client/components/web-scraping/flightTags';

describe('Cypress can scrape flight data if Bot detection is disabled', () => {
  it('scrapes flight data and saves them to a JSON file', () => {
    // backdoor=1 disables Bot detection
    cy.visit('http://localhost:3000/web-scraping?backdoor=1');
    cy.get('button:contains("Search flights")').click();
    const flights = [];
    cy.get(`[data-test=${FLIGHT_TAG.card}]`).each((card) => {
      const flightData = {
        departureTime: card.find(`[data-test=${FLIGHT_TAG.origin}] [data-test=${FLIGHT_TAG.time}]`).text(),
        arrivalTime: card.find(`[data-test=${FLIGHT_TAG.destination}] [data-test=${FLIGHT_TAG.time}]`).text(),
        from: card.find(`[data-test=${FLIGHT_TAG.origin}] [data-test=${FLIGHT_TAG.airportCode}]`).text(),
        to: card.find(`[data-test=${FLIGHT_TAG.destination}] [data-test=${FLIGHT_TAG.airportCode}]`).text(),
        price: card.find(`[data-test=${FLIGHT_TAG.price}]`).text(),
        airline: card.find(`[data-test=${FLIGHT_TAG.airline}]`).text(),
      };
      cy.log(JSON.stringify(flightData));
      flights.push(flightData);
    });
    cy.writeFile('cypress/output/flights.json', flights);
  });
});
