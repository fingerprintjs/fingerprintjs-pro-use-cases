import CouponFraudIcon from './img/home-icons/coupon-fraud.svg';
import CredentialStuffingIcon from './img/home-icons/credential-stuffing.svg';
import LoanRiskIcon from './img/home-icons/loan-risk.svg';
import PaymentFraudIcon from './img/home-icons/payment-fraud.svg';
import PaywallIcon from './img/home-icons/paywall.svg';
import PersonalizationIcon from './img/home-icons/personalization.svg';
import ScrapingIcon from './img/home-icons/web-scraping.svg';
import FirewallIcon from './img/home-icons/bot-firewall.svg';
import VpnDetectionIcon from './img/home-icons/vpn-detection.svg';
import SmsIcon from './img/home-icons/sms-pumping.svg';
import PlaygroundIcon from './img/home-icons/playground.svg';
import AccountSharingIcon from './img/home-icons/account-sharing.svg';
import NewAccountFraudIcon from './img/home-icons/new-account-fraud.svg';
import { ReactNode } from 'react';
import { RestartHint, RestartHintProps } from './components/UseCaseWrapper/RestartHint';
import { TEST_PHONE_NUMBER } from '../app/sms-pumping/api/smsPumpingConst';
import { AccountSharingDemoLink } from '../app/account-sharing/components/AccountSharingDemoLink';
import Link from 'next/link';

export const PRODUCTION_URL = 'https://demo.fingerprint.com';

export type UseCase = {
  title: string;
  titleH1: string;
  titleMeta: string;
  url: string;
  description?: React.ReactNode;
  descriptionHomepage?: readonly React.ReactNode[];
  descriptionMeta: string;
  articleUrl?: string;
  githubUrl?: string;
  doNotMentionResetButton?: boolean;
  instructions: readonly (ReactNode | ((props: RestartHintProps) => ReactNode))[];
  instructionsNote?: ReactNode;
  iconSvg?: any | undefined;
  moreResources?: ResourceLink[];
  hiddenInNavigation?: boolean;
};

export type ResourceLink = {
  type: 'Use case tutorial' | 'Case study' | 'Industry' | 'Article' | 'Use case' | 'Video' | 'Webinar' | 'Demo app';
  title: string;
  url: string;
  description?: string;
};

export const USE_CASES = {
  couponFraud: {
    title: 'Coupon Fraud',
    titleH1: 'Coupon Fraud Prevention Test',
    titleMeta: 'Coupon Fraud Prevention Test | Fingerprint',
    url: '/coupon-fraud',
    iconSvg: CouponFraudIcon,
    descriptionHomepage: [
      <p key='1'>
        Safeguard campaign funds from abuse by implementing Fingerprint to identify bad faith users who repeatedly use
        coupon codes
      </p>,
      <p key='2'>
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
        type: 'Case study',
        url: 'https://fingerprint.com/case-studies/contest-fraud/',
        title: 'Contest fraud',
      },
      {
        type: 'Case study',
        url: 'https://fingerprint.com/case-studies/review-fraud/',
        title: 'Review fraud',
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
    titleH1: 'Credential Stuffing Prevention Test',
    titleMeta: 'Credential Stuffing Prevention Test | Fingerprint',
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
      <p key='1'>
        Protect your users against credential stuffing using Fingerprint's unique visitor ID provided for each user that
        visits your site.
      </p>,
      <p key='2'>
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
        type: 'Case study',
        url: 'https://fingerprint.com/blog/uni-card-reduce-fraud-millions/',
        title: 'Uni Cards',
      },
      {
        type: 'Use case',
        title: 'Account takeover',
        url: 'https://fingerprint.com/account-takeover/',
      },
    ],
  },
  accountSharing: {
    title: 'Account Sharing',
    titleH1: 'Account Sharing Prevention Test',
    titleMeta: 'Account Sharing Prevention Test | Fingerprint',
    url: '/account-sharing',
    articleUrl: 'https://fingerprint.com/blog/increase-revenue-identifying-preventing-account-sharing/',
    githubUrl: `https://github.com/fingerprintjs/fingerprintjs-pro-use-cases/tree/main/src/app/account-sharing`,
    iconSvg: AccountSharingIcon,
    descriptionMeta:
      'See in real-time how Fingerprint can prevent account sharing. Try out our live demo to see Fingerprint detect too many devices using a single account at the same time.',
    descriptionHomepage: [
      <p key='1'>Users sharing their accounts can lead to security vulnerabilities and lost revenue.</p>,
      <p key='2'>
        Use Fingerprint device intelligence to detect account sharing and prevent too many devices from using a single
        user account.
      </p>,
    ],
    description: (
      <>
        <p>
          Price-conscious users often share their paid accounts with family, friends, or even strangers. This practice
          results not only in lost potential revenue but also presents a security risk.
        </p>
        <p>
          Use Fingerprint device intelligence to reliably link a specific browser or device to each account login.
          Detect and stop too many devices using a single account to prevent account sharing.
        </p>
      </>
    ),
    instructions: [
      <>Create an account in the form below and log in to our FraudFlix demo streaming service.</>,
      <>
        Open this page <AccountSharingDemoLink /> in a different browser or device. For example, if you are using
        Chrome, open the demo on Firefox, Safari, or on your phone.
      </>,
      <>Try logging in with the same username and password.</>,
      <>You will be blocked from logging in and forced to log out in the original browser first.</>,
    ],
    instructionsNote: `This is an example implementation. In a real-world scenario, you could allow users to use up to N devices
        simultaneously, restrict devices by a common location, or simply flag accounts suspected of account sharing for
        a personalized upgrade campaign.`,
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Account Sharing Prevention Guide',
        url: 'https://fingerprint.com/blog/increase-revenue-identifying-preventing-account-sharing/',
      },
      {
        type: 'Case study',
        title: 'How Chegg Solved Account Sharing',
        url: 'https://fingerprint.com/case-studies/chegg-stops-account-sharing/',
      },
      {
        type: 'Article',
        title: 'Account sharing lessons from Netflix and Amazon',
        url: 'https://fingerprint.com/blog/ultimate-account-sharing-prevention-guide-netflix-amazon/',
      },
      {
        type: 'Article',
        title: 'Driver account sharing fraud',
        url: 'https://fingerprint.com/blog/preventing-account-security-fraud-in-food-delivery-services/#driver-account-sharing-fraud-puts-customers-at-risk',
      },
    ],
  },
  paymentFraud: {
    title: 'Payment Fraud',
    titleH1: 'Payment Fraud Protection Test',
    titleMeta: 'Payment Fraud Protection Test | Fingerprint',
    url: '/payment-fraud',
    articleUrl: 'https://fingerprint.com/blog/reducing-payment-fraud-with-reliable-visitor-identification/',
    iconSvg: PaymentFraudIcon,
    descriptionHomepage: [
      <p key='1'>
        Identify anonymous visitors behind every transaction. Use Fingerprint's Identification to recognize repeated
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
        type: 'Case study',
        url: 'https://fingerprint.com/blog/headout-chargeback-case-study/',
        title: 'Headout Chargeback Fraud',
      },
      {
        type: 'Case study',
        url: 'https://fingerprint.com/blog/korsit-prevent-payment-fraud/',
        title: 'Korsit Payment Fraud',
      },
      {
        type: 'Case study',
        url: 'https://fingerprint.com/case-studies/credit-card-fraud/',
        title: 'Grocery Delivery Service',
      },
      {
        url: 'https://fingerprint.com/blog/omnichannel-fraud/',
        type: 'Article',
        title: 'Omnichannel Fraud',
      },
    ],
  },
  loanRisk: {
    title: 'Loan Risk',
    titleH1: 'Loan Application Fraud Protection Test',
    titleMeta: 'Loan Application Fraud Protection Test | Fingerprint',
    url: '/loan-risk',
    articleUrl: 'https://fingerprint.com/blog/detect-repeat-applications-loan-risk/',
    iconSvg: LoanRiskIcon,
    descriptionHomepage: [
      <p key='1'>
        Validate loan applications against prior submissions by users, whether they are anonymous or authenticated.
      </p>,
      <p key='2'>
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
  paywall: {
    title: 'Paywall',
    titleH1: 'Paywall Bypass Prevention Test',
    titleMeta: 'Paywall Bypass Prevention Test | Fingerprint',
    url: '/paywall',
    articleUrl: 'https://fingerprint.com/blog/how-paywalls-work-paywall-protection-tutorial/',
    iconSvg: PaywallIcon,
    descriptionHomepage: [
      <p key='1'>
        Accurately identify returning users to provide limited access to your content and ensure users aren't able to
        exceed their predetermined limits.
      </p>,
      <p key='2'>
        Your content limit for each user will work even if the user clears cookies or browses in incognito mode.
      </p>,
    ],
    description:
      'Use the demo below to see how Fingerprint protects your content from users trying to circumvent your paywall.',
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
    titleH1: 'Anonymous Visitor Personalization Test',
    titleMeta: 'Anonymous Visitor Personalization Test | Fingerprint',
    url: '/personalization',
    articleUrl: 'https://fingerprint.com/blog/providing-personalization-to-anonymous-users/',
    iconSvg: PersonalizationIcon,
    descriptionHomepage: [
      <p key='1'>
        Improve user experience and boost sales by personalizing your website with Fingerprint device intelligence.
      </p>,
      <p key='2'>
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
    titleH1: 'Web Scraping Prevention Test',
    titleMeta: 'Web Scraping Prevention Test | Fingerprint',
    url: '/web-scraping',
    articleUrl: 'https://fingerprint.com/blog/preventing-content-scraping/',
    iconSvg: ScrapingIcon,
    descriptionHomepage: [
      <p key='1'>
        Web scraping extracts data using automated scripts. Data that is valuable to competitors can be stolen, directly
        impacting your business.
      </p>,
      <p key='2'>
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
          Use the demo below to see how Fingerprint's bot detection identifies and blocks malicious bots, and prevents
          unauthorized data extraction. Here, the flights API endpoint on this page is protected by the Fingerprint{' '}
          <a href='https://dev.fingerprint.com/docs/bot-detection-quick-start-guide' target={'_blank'}>
            {' '}
            Bot Detection Smart Signal
          </a>
          .
        </p>
      </>
    ),
    descriptionMeta: `See in real-time how Fingerprint can stop and prevent content scraping bots. Try out our live demo to see how Fingerprint's bot detection identifies and blocks malicious bots, and prevents unauthorized data extraction.`,
    doNotMentionResetButton: true,
    instructions: [
      <>Use a normal browser and search for flights.</>,
      <>
        Now, try scrape the results using an automation tool like Selenium, Puppeteer, Playwright, Cypress, or similar.
        Note that the bot IP will be collected and displayed in the <Link href={'/bot-firewall'}>Bot Firewall</Link>{' '}
        demo.
      </>,
      <>
        You will only see an error message if the request is coming from a bot. Try it using a tool like Playwright
        locally, or an online bot playground like{' '}
        <a href='https://chrome.browserless.io/debugger/' target='_blank'>
          Browserless
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
    instructionsNote: (
      <>
        You can see the detected bot visits and block bot IP addresses in the{' '}
        <Link href={'/bot-firewall'}>Bot Firewall</Link> demo.
      </>
    ),
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
    title: 'Bot Firewall',
    titleH1: 'Bot Firewall Test',
    titleMeta: 'Bot Firewall Test: Detect and Block Repeat Bots',
    url: '/bot-firewall',
    articleUrl: 'https://fingerprint.com/blog/bot-detection-powered-application-firewall/',
    iconSvg: FirewallIcon,
    descriptionHomepage: [
      <p key='1'>
        Integrate Fingerprint Bot Detection with your Web Application Firewall and dynamically block IP addresses linked
        to past bot visits.
      </p>,
      <p key='2'>
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
          <Link href={'/web-scraping'} target='_blank'>
            Web scraping demo
          </Link>{' '}
          for an example of protecting client-site content from bots. This demo goes a step further. It uses Bot
          Detection results to block previously recognized bots on their next visit completely — before they even reach
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
        <Link href={'/web-scraping'} target='_blank'>
          web scraping demo
        </Link>
        . See the{' '}
        <Link
          href={`https://fingerprint.com/blog/bot-detection-powered-application-firewall/#explore-the-bot-firewall-demo`}
          target='_blank'
        >
          demo tutorial
        </Link>{' '}
        for an example.
      </>,
      <>
        Your headless browser will be recognized as a bot, and your IP address will be saved to the bot visit database
        displayed below.
      </>,
      <>
        Click <b>Block this IP</b> to prevent the bot from loading the page at all going forward. For demo purposes, you
        are only allowed to block your own IP.
      </>,
      <>
        Try visiting the{' '}
        <Link href={'/web-scraping'} target='_blank'>
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
  smsPumping: {
    title: 'SMS Pumping Fraud Protection',
    titleH1: 'SMS Pumping Fraud Protection Test',
    titleMeta: 'SMS Pumping Fraud Protection Test | Fingerprint',
    url: '/sms-pumping',
    articleUrl: 'https://fingerprint.com/blog/what-is-sms-fraud-prevention-tutorial/',
    iconSvg: SmsIcon,
    descriptionHomepage: [
      <p key='1'>Fraudulent authentication SMS messages can cost your business a fortune.</p>,
      <p key='2'>Use Fingerprint device intelligence to prevent SMS pumping by bots and malicious actors.</p>,
    ],
    description: (
      <>
        <p>
          Malicious actors can use your application's SMS verification step to send thousands of fraudulent verification
          messages to premium-rate phone numbers they control. SMS pumping can lead to substantial financial losses for
          your business.
        </p>
        <p>
          Stop bots and suspicious browsers from requesting verification codes. Link every verification text message to
          a browser fingerprint and limit the number of verification requests from a single browser.
        </p>
      </>
    ),
    descriptionMeta:
      'See in real-time how Fingerprint can protect your application from SMS pumping. Try out our live demo to see Fingerprint prevent bad actors from sending themselves thousands of fraudulent text messages from your application.',
    instructions: [
      <>
        Fill out the form below. You can use your real phone number to have a complete experience. We will only use it
        for this demo and temporarily store it in hashed form.
      </>,
      <>
        Click <b>Send code via SMS</b>. An SMS message with a one-time password will be sent to your phone. If you use
        the default test phone number (<code>{TEST_PHONE_NUMBER}</code>), we will simulate the SMS message on the
        screen.
      </>,
      <>
        Try requesting another message by clicking <b>Resend code via SMS</b>.
      </>,
      <>
        You will only be able to get your second message after 30 seconds, your third message after a minute, and then
        no more. You are limited to 3 messages per browser per day.
      </>,
      <>Try creating an account using a different email and phone number.</>,
      <>Try opening this page in incognito mode or turning on a VPN. The daily request limit will still be enforced.</>,
      <>
        Try creating another account using Tor or a browser automation tool like Playwright. You will be blocked right
        away.
      </>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'SMS Pumping Fraud',
        url: 'https://fingerprint.com/blog/what-is-sms-fraud-prevention-tutorial/',
      },
      {
        type: 'Case study',
        title: 'Jumia SMS fraud',
        url: 'https://fingerprint.com/blog/jumia-ecommerce-sms-fraud-customer-story/',
      },
    ],
  },
  vpnDetection: {
    title: 'VPN Detection',
    titleH1: 'VPN Detection Test',
    titleMeta: 'VPN Detection Test | Fingerprint',
    url: '/vpn-detection',
    articleUrl: 'https://fingerprint.com/blog/vpn-detection-location-spoofing-fraud-prevention/',
    githubUrl: 'https://github.com/fingerprintjs/fingerprintjs-pro-use-cases/tree/main/src/app/vpn-detection',
    iconSvg: VpnDetectionIcon,
    descriptionHomepage: [
      <p key='1'>
        Use Fingerprint VPN detection to detect visitors trying to spoof their location. Deploy location-based pricing
        or content restrictions with confidence.
      </p>,
      <p key='2'>
        Use Sealed client results to protect your Fingerprint integration from tampering and reverse-engineering.
      </p>,
    ],
    description: (
      <>
        <p>
          Many web applications need to apply content restrictions or regional discounts based on the visitor's
          geographical location. But tech-savvy users can simply turn on a VPN to appear to be somewhere else.
        </p>
        <p>
          Fingerprint{' '}
          <Link
            href='https://dev.fingerprint.com/docs/smart-signals-overview#vpn-detection-for-browsers'
            target='_blank'
          >
            VPN Detection
          </Link>{' '}
          allows you to detect if a visitor is using a virtual private network and spoofing their location. You can
          prevent these visitors and other suspicious browsers from applying purchase-power-parity discounts or
          accessing geographically restricted content.
        </p>
      </>
    ),
    descriptionMeta:
      'Use Fingerprint VPN detection to detect visitors trying to spoof their location. Deploy location-based pricing or content restrictions with confidence.',
    doNotMentionResetButton: true,
    instructions: [
      <>
        Click <b>Activate regional pricing</b> in the checkout form below. Assuming your VPN is off, you will get a
        location-based discount.
      </>,
      <>Turn on your VPN and pick an exit node different from your true location.</>,
      <>Try activating the discount again. You will not get the discount while using a VPN.</>,
    ],
    instructionsNote: (
      <>
        This use case demo uses{' '}
        <Link href='https://dev.fingerprint.com/docs/sealed-client-results'>Sealed client results</Link> to process the
        identification data. This provides lower latency and stronger tampering protection compared to only using the
        Server API.
      </>
    ),
    moreResources: [
      {
        url: 'https://fingerprint.com/blog/vpn-detection-how-it-works/',
        type: 'Article',
        title: 'How VPN Detection Works',
      },
    ],
  },
  newAccountFraud: {
    title: 'New Account Fraud',
    titleH1: 'New Account Fraud Prevention Test',
    titleMeta: 'New Account Fraud Prevention Test | Fingerprint',
    url: '/new-account-fraud',
    articleUrl: 'https://fingerprint.com/blog/new-account-fraud/',
    githubUrl: 'https://github.com/fingerprintjs/fingerprintjs-pro-use-cases/tree/main/src/app/new-account-fraud',
    descriptionMeta:
      'See in real-time how Fingerprint can fight trial abuse. Try out our live demo to see Fingerprint prevent visitors from creating multiple accounts from the same browser or device',
    iconSvg: NewAccountFraudIcon,
    descriptionHomepage: [
      <p key='1'>
        Accurately identify visitors who create multiple fake accounts. Fight trial abuse by limiting the number of
        accounts visitors can create from a single browser or device. Prevent bots and suspicious browsers from creating
        accounts.
      </p>,
    ],
    description:
      'Use the demo below to see how Fingerprint can identify fraudsters who create multiple accounts and abuse free trials.',
    instructions: [
      <>
        Fill in the form below and click <b>Create trial account</b>.
      </>,
      <>
        Go back and try starting another free trial. You will not be able to create multiple accounts from the same
        browser or device.
      </>,
      <>You can go into incognito mode or turn on a VPN and try again.</>,
    ],
    moreResources: [
      {
        type: 'Use case tutorial',
        title: 'Preventing new account fraud',
        url: 'https://fingerprint.com/blog/new-account-fraud/',
      },
      {
        type: 'Case study',
        title: 'How DreamHost prevents new account fraud and multi-accounting',
        url: 'https://fingerprint.com/case-studies/dreamhost-prevents-multi-accounting/',
      },
    ],
  },
} as const satisfies Record<string, UseCase>;

export const PLAYGROUND_METADATA: Pick<
  UseCase,
  'title' | 'url' | 'descriptionHomepage' | 'iconSvg' | 'titleMeta' | 'descriptionMeta'
> = {
  title: 'Playground',
  url: '/playground',
  iconSvg: PlaygroundIcon,
  descriptionHomepage: [
    <p key='1'>Analyze your own browser with Fingerprint's identification and Smart Signals.</p>,
    <p key='2'>
      Test and examine Fingerprint's signals including IP geolocation, browser bot detection, incognito mode detection,
      VPN detection, browser tampering detection, IP blocklist matching, and more.
    </p>,
  ],
  titleMeta: 'Fingerprint Pro Playground | Test Your Browser Signals',
  descriptionMeta: 'Analyze your browser with Fingerprint Pro and see all the available signals.',
};

export const USE_CASES_ARRAY = Object.values(USE_CASES);

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

export const URLS = {
  mainSite: 'https://fingerprint.com',
  useCasesRepoUrl: 'https://github.com/fingerprintjs/fingerprintjs-pro-use-cases',
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
  contactSales: 'https://fingerprint.com/contact-sales/',
  worKMail: 'work@fingerprint.com',
  pressMail: 'press@fingerprint.com',
  discordServerURL: 'https://discord.gg/ad6R2ttHVX',
  docsUrl: 'https://dev.fingerprint.com',
  promotionalVideo: 'https://www.youtube.com/embed/UEYBysyPTBs',
  demoVideo: 'https://www.youtube.com/embed/hVktdWfyBuU',
  g2ReviewUrl: 'https://www.g2.com/products/fingerprintjs-fingerprint/reviews',
} as const;
