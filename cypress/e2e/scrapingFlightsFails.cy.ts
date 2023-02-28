describe('You cannot scrape flight data using cypress if Bot detection is enabled', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/web-scraping');
    cy.get('button:contains("Search flights")').click();
    cy.contains('Malicious bot detected');
  });
});

export {};
