export function getWebsiteUrl() {
  return new URL(process.env.WEBSITE_URL || 'http://localhost:3000');
}
