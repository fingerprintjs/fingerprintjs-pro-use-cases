describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/web-scraping');
    // Get button containing text "Scrape Flights"
    cy.get('button:contains("Search flights")').click();
  });
});

export {};
