import Link from 'next/link';
import SmartSignalsIcon from '../../img/smartSignalsIcon.svg';
import CouponFraudIcon from '../../img/couponFraudIcon.svg';
import CredentialStuffingIcon from '../../img/credentialStuffingIcon.svg';
import LoanRiskIcon from '../../img/loanRiskIcon.svg';
import PaymentFraudIcon from '../../img/paymentFraudIcon.svg';
import PaywallIcon from '../../img/paywallIcon.svg';
import PersonalizationIcon from '../../img/personalizationIcon.svg';
import ScrapingIcon from '../../img/scrapingIcon.svg';
import { ReactNode } from 'react';
import { RestartHint, RestartHintProps } from './UseCaseWrapper/RestartHint';

export const PRODUCTION_URL = 'https://demo.fingerprint.com';

export type UseCase = {
  title: string;
  titleMeta: string;
  url: string;
  description?: React.ReactNode;
  descriptionHomepage?: readonly React.ReactNode[];
  descriptionMeta: string;
  articleUrl?: string;
  doNotMentionResetButton?: boolean;
  instructions: readonly (ReactNode | ((props: RestartHintProps) => ReactNode))[];
  iconSvg?: any | undefined;
  moreResources?: readonly {
    type: 'Use case tutorial' | 'Case study' | 'Industry' | 'Article' | 'Use case';
    title: string;
    url: string;
  }[];
  hiddenInNavigation?: boolean;
};

export const USE_CASES = {
  couponFraud: {
    title: 'Coupon Fraud',
    titleMeta: 'Fingerprint Use Cases | Coupon Promo Fraud and Abuse Live Demo',
    url: '/coupon-fraud',
    iconSvg: CouponFraudIcon,
    descriptionHomepage: [
      <p key="1">
        Safeguard campaign funds from abuse by implementing Fingerprint to identify bad faith users who repeatedly use
        coupon codes
      </p>,
      <p key="2">
        Accurately identify coupon fraud by signed-in customers or guests to ensure your marketing campaign yields its
        full potential.
      </p>,
    ],
    description:
      'Use the demo below to see how Fingerprint can help identify fraudsters who repeatedly use the same coupon under different scenarios to gain unauthorized benefits.',
    descriptionMeta:
      'See in real-time how Fingerprint can stop and prevent coupon promotional abuse. Try out our coupon fraud demo and learn how we safeguard your promotions.',
    articleUrl: 'https://fingerprint.com/blog/prevent-coupon-promo-abuse-increase-sales/',
    instructions: [
      <>
        Use the sample coupon code <code>Promo3000</code> and click Apply.
      </>,
      <>Try using the same coupon code again.</>,
      <>
        Now try to use another sample code <code>BlackFriday</code> for the same item.
      </>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Coupon Promo Abuse',
        url: 'https://fingerprint.com/blog/prevent-coupon-promo-abuse-increase-sales/',
      },
      {
        type: 'Case study',
        title: 'Promo Abuse',
        url: 'https://fingerprint.com/case-studies/promo-abuse/',
      },
      {
        type: 'Industry',
        title: 'E-commerce',
        url: 'https://fingerprint.com/ecommerce/',
      },
    ],
  },
  credentialStuffing: {
    title: 'Credential Stuffing',
    titleMeta: 'Fingerprint Use Cases | Credential Stuffing Live Demo',
    url: '/credential-stuffing',
    articleUrl: 'https://fingerprint.com/blog/stop-credential-stuffing/',
    instructions: [
      <>
        Put in the username <code>user</code> and password <code>password</code>.
      </>,
      <>
        Click <b>Log in</b>. You won't be able to log in despite having the correct credentials.
      </>,
      <>Try calling the login endpoint directly or using JavaScript to spoof the request ID and visitor ID.</>,
      <>Try to login with different passwords. You will be blocked after 5 attempts.</>,
      <>Try using incognito mode to log into this page.</>,
    ],
    iconSvg: CredentialStuffingIcon,
    descriptionHomepage: [
      <p key="1">
        Protect your users against credential stuffing using Fingerprint’s unique visitor ID provided for each user that
        visits your site.
      </p>,
      <p key="2">
        Fingerprint's accurate identification prevents fraudsters from unauthorized account access, minimizing
        disruption for legitimate users.
      </p>,
    ],
    description: (
      <>
        <p>
          Use the this demo below to see how Fingerprint protects your login page from account takeover even if your
          credentials are stolen.
        </p>
        <p>
          In this demo, the login attempts from an unknown device are challenged even if the attacker knows the correct
          credentials and repeated attempts to log in from the same browser are blocked.
        </p>
      </>
    ),
    descriptionMeta:
      'See in real-time how Fingerprint can stop credential stuffing preventing unauthorized account access before it happens. Try out our live demo to learn how.',
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Credential Stuffing',
        url: 'https://fingerprint.com/blog/stop-credential-stuffing/',
      },
      {
        type: 'Use case',
        title: 'Account takeover',
        url: 'https://fingerprint.com/account-takeover/',
      },
    ],
  },
  loanRisk: {
    title: 'Loan Risk',
    titleMeta: 'Fingerprint Use Cases | Loan Fraud Live Demo',
    url: '/loan-risk',
    articleUrl: 'https://fingerprint.com/blog/detect-repeat-applications-loan-risk/',
    iconSvg: LoanRiskIcon,
    descriptionHomepage: [
      <p key="1">
        Validate loan applications against prior submissions by users, whether they are anonymous or authenticated.
      </p>,
      <p key="2">
        Use Fingerprint to check for consistency between applications and ignore submissions from previously rejected
        applicants.
      </p>,
    ],
    description:
      'Use this demo to see how Fingerprint allows you to collect high-quality, low-risk loan applications from your anonymous visitors. Prevent fraudsters and rejected applicants from submitting multiple inconsistent applications.',
    descriptionMeta:
      'See in real-time how Fingerprint can stop and prevent fraudsters and rejected applicants from submitting multiple inconsistent applications. Try out our live demo to learn how.',
    instructions: [
      <>Pick some values in the form and submit your loan application.</>,
      <>
        Change some of the provided information and apply for a loan again. You will be warned about the application
        inconsistencies and your loan won't be calculated.
      </>,
      <>Try bypassing the protection by switching to incognito mode or deleting your cookies.</>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Loan Risk',
        url: 'https://fingerprint.com/blog/detect-repeat-applications-loan-risk/',
      },
      {
        url: 'https://fingerprint.com/blog/what-is-loan-fraud/',
        type: 'Article',
        title: 'What is Loan Fraud?',
      },
    ],
  },
  paymentFraud: {
    title: 'Payment Fraud',
    titleMeta: 'Fingerprint Use Cases | Payment Fraud Live Demo',
    url: '/payment-fraud',
    articleUrl: 'https://fingerprint.com/blog/reducing-payment-fraud-with-reliable-visitor-identification/',
    iconSvg: PaymentFraudIcon,
    descriptionHomepage: [
      <p key="1">
        Identify anonymous visitors behind every transaction. Use Fingerprint’s Identification to recognize repeated
        card testing activity and link it to specific users. Protect your users and your business against various forms
        of payment fraud.
      </p>,
    ],
    description:
      'Use the demo to see how Fingerprint can protect your transactions from card cracking attempts, stolen credit cards, and reduce chargebacks.',
    descriptionMeta:
      'See in real-time how Fingerprint can stop and prevent online payment fraud. Try out our live demo to see how Fingerprint can protect your transactions from card cracking attempts, stolen credit cards, and reduce chargebacks.',
    doNotMentionResetButton: true,
    instructions: [
      <>Change the pre-filled card details to simulate testing stolen credit cards.</>,
      <>Try placing an order multiple times. You will be stopped after 3 attempts.</>,
      ({ setPulseResetButton }) => (
        <>
          Click the <RestartHint setPulseResetButton={setPulseResetButton} /> button to reset the demo.
        </>
      ),
      <>Use the correct pre-filled card details but select "Ask for chargeback" and place your order.</>,
      <>Try placing an order again. You won't be able to do it with your chargeback history.</>,
      ({ setPulseResetButton }) => (
        <>
          Click the <RestartHint setPulseResetButton={setPulseResetButton} /> button to reset the demo.
        </>
      ),
      <>
        Select "Flag this as stolen credit card after purchase" to simulate using a stolen card and place your order.
      </>,
      <>Try placing an order again. You won't be able to with your history of stealing credit cards.</>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Payment Fraud',
        url: 'https://fingerprint.com/blog/reducing-payment-fraud-with-reliable-visitor-identification/',
      },
      {
        url: 'https://fingerprint.com/blog/omnichannel-fraud/',
        type: 'Article',
        title: 'Omnichannel Fraud',
      },
    ],
  },
  paywall: {
    title: 'Paywall',
    titleMeta: 'Fingerprint Use Cases | Content Paywall Live Demo',
    url: '/paywall',
    articleUrl: 'https://fingerprint.com/blog/how-paywalls-work-paywall-protection-tutorial/',
    iconSvg: PaywallIcon,
    descriptionHomepage: [
      <p key="1">
        Accurately identify returning users to provide limited access to your content and ensure users aren’t able to
        exceed their predetermined limits.
      </p>,
      <p key="2">
        Your content limit for each user will work even if the user clears cookies or browses in incognito mode.
      </p>,
    ],
    description:
      'Use the demo below to see how Fingerprint protects your content from users trying to circumvent your paywall. ',
    descriptionMeta:
      'See in real-time how Fingerprint can stop and prevent content paywall evasion. Try out our live demo to see how Fingerprint protects your content from users trying to circumvent your paywall.',
    instructions: [
      <>Browse the articles below and open a few of them.</>,
      <>You will hit a paywall when opening your third article.</>,
      <>Try switching to incognito mode or clearing cookies to go around the paywall and read more articles.</>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Paywall',
        url: 'https://fingerprint.com/blog/how-paywalls-work-paywall-protection-tutorial/',
      },
    ],
  },
  personalization: {
    title: 'Personalization',
    titleMeta: 'Fingerprint Use Cases | eCommerce Personalization Live Demo',
    url: '/personalization',
    articleUrl: 'https://fingerprint.com/blog/providing-personalization-to-anonymous-users/',
    iconSvg: PersonalizationIcon,
    descriptionHomepage: [
      <p key="1">
        Improve user experience and boost sales by personalizing your website with Fingerprint device intelligence.
      </p>,
      <p key="2">
        Provide your visitors with their search history, interface customization, or a persistent shopping cart without
        having to rely on cookies or logins.
      </p>,
    ],
    description: (
      <>
        <p>
          Use the demo below to see how user personalization is achieved with Fingerprint. Your visitors can get a
          tailored experience without having to create an account.
        </p>
        <p>
          Please note that using Fingerprint for personalization might require visitor consent according to your local
          regulations, similar to cookies. This demo only uses incognito mode to demonstrate cookie-less
          personalization. We don't advise you to implement personalization features in incognito mode.
        </p>
      </>
    ),
    descriptionMeta:
      'See in real-time how Fingerprint can help you provide your visitors a tailored experience without having to create an account. Try out our live demo to see how user personalization works with Fingerprint.',
    instructions: [
      <>Search for new products.</>,
      <>Add some items to your cart.</>,
      <>
        Now, open this page in incognito mode to simulate coming back to it with expired cookies. Your shopping cart and
        search history will be preserved.
      </>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Personalization',
        url: 'https://fingerprint.com/blog/providing-personalization-to-anonymous-users/',
      },
    ],
  },
  webScraping: {
    title: 'Web Scraping Prevention',
    titleMeta: 'Fingerprint Use Cases | Content Scraping Prevention Live Demo',
    url: '/web-scraping',
    articleUrl: 'https://fingerprint.com/blog/preventing-content-scraping/',
    iconSvg: ScrapingIcon,
    descriptionHomepage: [
      <p key="1">
        Web scraping extracts data using automated scripts. Data that is valuable to competitors can be stolen, directly
        impacting your business.
      </p>,
      <p key="2">
        Fingerprint Smart Signal bot detection offers advanced protection without compromising user experience or
        relying on IP-based solutions.
      </p>,
    ],
    description: (
      <>
        <p>
          If your website has data that is expensive to collect or compute (e.g., flight prices), a fraudster could
          steal it. Unfortunately, protecting the data with CAPTCHA hurts user experience and server-side bot detection
          based on IP address reputation is not reliable.
        </p>
        <p>
          Use the demo below to see how Fingerprint’s bot detection identifies and blocks malicious bots, and prevents
          unauthorized data extraction. Here, the flights API endpoint on this page is protected by the Fingerprint{' '}
          <a href="https://dev.fingerprint.com/docs/bot-detection-quick-start-guide" target={'_blank'}>
            {' '}
            Bot Detection Smart Signal
          </a>
          .
        </p>
      </>
    ),
    descriptionMeta:
      'See in real-time how Fingerprint can stop and prevent content scraping bots. Try out our live demo to see how Fingerprint’s bot detection identifies and blocks malicious bots, and prevents unauthorized data extraction.',
    doNotMentionResetButton: true,
    instructions: [
      <>Use a normal browser and search for flights.</>,
      <>
        Now, try scrape the results using an automation tool like Selenium, Puppeteer, Playwright, Cypress, or similar.
      </>,
      <>
        You will only see an error message if the request is coming from a bot. Try it using our{' '}
        <a href="https://botd-demo.fpjs.sh/" target="_blank">
          online bot playground
        </a>
        .
      </>,
      <>Try tampering with the request ID parameter, request headers, or IP address. The result will be the same.</>,
      <>
        To see how the page would behave without Bot Detection, reload it with{' '}
        <Link href={'/web-scraping?disableBotDetection=1'}>
          <code>?disableBotDetection=1</code>
        </Link>{' '}
        in the URL.
      </>,
    ],
    moreResources: [
      {
        url: 'https://fingerprint.com/blog/preventing-content-scraping/',
        type: 'Use case tutorial',
        title: 'Web Scraping Prevention',
      },
      {
        url: 'https://fingerprint.com/blog/betting-bots/',
        type: 'Article',
        title: 'Betting Bots',
      },
    ],
  },
  botFirewall: {
    title: 'Bot-Detection-powered Firewall',
    titleMeta: 'Fingerprint Use Cases | Bot-Detection-powered Firewall',
    url: '/bot-firewall',
    articleUrl: 'https://fingerprint.com/blog/bot-detection-powered-firewall/',
    iconSvg: ScrapingIcon,
    descriptionHomepage: [
      <p key="1">
        Integrate Fingerprint Bot Detection with your Web Application Firewall and dynamically block IP addresses linked
        to past bot visits.
      </p>,
      <p key="2">
        Block previously recognized bots on their next visit completely — before they even reach your web page.
      </p>,
    ],
    description: (
      <>
        <p>
          Integrate Fingerprint Bot Detection with your Web Application Firewall and dynamically block IP addresses
          linked to past bot visits.
        </p>
        <p>
          Fingerprint Bot Detection allows you to identify sophisticated bots and headless browsers by collecting and
          analyzing browser signals. See our{' '}
          <Link href={'/web-scraping'} target="_blank">
            Web scraping demo
          </Link>{' '}
          for an example of protecting client-site content from bots. This demo goes a step further and uses Bot
          detection results to block previously recognized bots on their next visit completely — before they even reach
          your web page.
        </p>
      </>
    ),
    descriptionMeta:
      'Integrate Fingerprint Bot Detection with your Web Application Firewall and dynamically block IP addresses linked to past bot visits.',
    doNotMentionResetButton: true,
    instructions: [
      <>
        Use a locally running instance of Playwright, Cypress, or another headless browser tool to visit the{' '}
        <Link href={'/web-scraping'} target="_blank">
          web scraping demo
        </Link>
        .
      </>,
      <>
        Your headless browser will be recognized as a bot, and your IP address will be saved to the bot visit database
        displayed below.
      </>,
      <>
        Click <b>Block this bot IP</b> to prevent the bot from loading the page at all going forward. For demo purposes,
        you are only allowed to block your own IP.
      </>,
      <>
        Try visiting the{' '}
        <Link href={'/web-scraping'} target="_blank">
          web scraping demo
        </Link>{' '}
        again (either as a bot or using your regular browser).
      </>,
      <>Your IP address is blocked from the page completely.</>,
    ],
    moreResources: [
      {
        url: 'https://fingerprint.com/blog/preventing-content-scraping/',
        type: 'Use case tutorial',
        title: 'Web Scraping Prevention',
      },
      {
        url: 'https://fingerprint.com/blog/betting-bots/',
        type: 'Article',
        title: 'Betting Bots',
      },
    ],
  },
} as const satisfies Record<string, UseCase>;

export const PLAYGROUND_METADATA: Pick<
  UseCase,
  'title' | 'url' | 'descriptionHomepage' | 'iconSvg' | 'titleMeta' | 'descriptionMeta'
> = {
  title: 'Smart Signals',
  url: '/playground',
  iconSvg: SmartSignalsIcon,
  descriptionHomepage: [
    <p key="1">Analyze your own browser with Fingerprint’s identification and Smart Signals.</p>,
    <p key="2">
      Test and examine Fingerprint’s signals including IP geolocation, browser bot detection, incognito mode detection,
      VPN detection, browser tampering detection, IP blocklist matching, and more.
    </p>,
  ],
  titleMeta: 'Fingerprint Use Cases | Smart Signals Playground',
  descriptionMeta: 'Analyze your browser with Fingerprint Pro and see all the available signals.',
};

export const USE_CASES_ARRAY = Object.values(USE_CASES)
  // TODO: Remove this when ready the final of bot firewall demo is ready
  .filter((useCase) => useCase.url !== USE_CASES.botFirewall.url);

export const USE_CASES_NAVIGATION = USE_CASES_ARRAY.map((useCase) => ({
  title: useCase.title,
  url: useCase.url,
}));
export const PLATFORM_NAVIGATION = [PLAYGROUND_METADATA];

type HomePageCard = Pick<UseCase, 'title' | 'url' | 'iconSvg' | 'descriptionHomepage'>;

export const HOMEPAGE_CARDS: HomePageCard[] = [PLAYGROUND_METADATA, ...USE_CASES_ARRAY].map((useCase) => ({
  title: useCase.title,
  url: useCase.url,
  iconSvg: useCase.iconSvg,
  descriptionHomepage: useCase.descriptionHomepage,
}));

export const URL = {
  mainSite: 'https://fingerprint.com',
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
  contactSales: 'https://fingerprint.com/contact-sales',
  worKMail: 'work@fingerprint.com',
  pressMail: 'press@fingerprint.com',
  discordServerURL: 'https://discord.gg/ad6R2ttHVX',
  docsUrl: 'https://dev.fingerprint.com',
  promotionalVideo: 'https://www.youtube.com/embed/UEYBysyPTBs',
  demoVideo: 'https://www.youtube.com/embed/hVktdWfyBuU',
  g2ReviewUrl: 'https://www.g2.com/products/fingerprintjs-fingerprint/reviews',
} as const;
