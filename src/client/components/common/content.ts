export const USE_CASES = [
  {
    title: 'Coupon Fraud',
    url: '/coupon-fraud',
  },
  {
    title: 'Credential Stuffing',
    url: '/credential-stuffing',
  },
  {
    title: 'Loan Risk',
    url: '/loan-risk',
  },
  {
    title: 'Payment Fraud',
    url: '/payment-fraud',
  },
  {
    title: 'Paywall',
    url: '/paywall',
  },
  {
    title: 'Personalization',
    url: '/personalization',
  },
  {
    title: 'Web scraping prevention',
    url: '/web-scraping',
  },
] as const;

export const PLATFORM_MENU_ITEMS = [{ title: 'Playground', url: '/playground' }];

export const URL = {
  githubRepoUrl: 'https://github.com/fingerprintjs/fingerprintjs/',
  githubApiUrl: 'https://api.github.com/repos/fingerprintjs',
  githubCommunityRepoUrl: 'https://github.com/fingerprintjs/home',
  botDRepoUrl: 'https://github.com/fingerprintjs/BotD',
  botDIntegrationsRepoUrl: 'https://github.com/fingerprintjs/botd-integrations',
  dashboardLoginUrl: 'https://dashboard.fingerprint.com/login',
  careersUrl: 'https://boards.greenhouse.io/fingerprintjs/',
  careersConsoleLogUrl: 'https://grnh.se/bb9c55804us',
  linkedinUrl: 'https://www.linkedin.com/company/fingerprintjs/',
  twitterUrl: 'https://twitter.com/FingerprintJs/',
  signupUrl: 'https://dashboard.fingerprint.com/signup',
  statusUrl: 'https://status.fingerprint.com',
  supportMail: 'support@fingerprint.com',
  salesMail: 'sales@fingerprint.com',
  worKMail: 'work@fingerprint.com',
  pressMail: 'press@fingerprint.com',
  discordServerURL: 'https://discord.gg/ad6R2ttHVX',
  docsUrl: 'https://dev.fingerprint.com',
  promotionalVideo: 'https://www.youtube.com/embed/UEYBysyPTBs',
  demoVideo: 'https://www.youtube.com/embed/hVktdWfyBuU',
  g2ReviewUrl: 'https://www.g2.com/products/fingerprintjs-fingerprint/reviews',
} as const;
