import { defineConfig } from 'cypress';

/**
 *  This project uses Playwright for end-to-end tests a Cypress for bot detection demonstrations
 * */
export default defineConfig({
  e2e: {
    video: false,
    supportFile: false,
    defaultCommandTimeout: 10000,
  },
});
