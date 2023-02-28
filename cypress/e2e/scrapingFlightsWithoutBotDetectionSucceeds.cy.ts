describe('You cant scrape flight data using cypress if Bot detection is disabled', () => {
  it('passes', () => {
    cy.visit('http://localhost:3000/web-scraping?backdoor=1');
    cy.get('button:contains("Search flights")').click();
    cy.contains('Malicious bot detected');
  });
});

export {};
