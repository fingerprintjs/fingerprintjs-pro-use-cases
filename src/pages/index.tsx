import Link from 'next/link';
import {
  AirplaneTicket,
  Block,
  CreditScore,
  Money,
  People,
  PrecisionManufacturing,
  Settings,
  Fingerprint,
} from '@mui/icons-material';
import { PageTile, PageTileProps } from '../client/components/PageTile';
import { Box, Divider, Typography } from '@mui/material';

import styles from './index.module.scss';
import Container from '../client/components/common/Container';

const pageTiles: PageTileProps[] = [
  {
    title: 'Smart signals playground',
    description: `Analyze your own browser with Fingerprint Pro. 
    
    Test and examine all the available signals including Geolocation, Bot Detection, Incognito Mode Detection, VPN Detection, Tor Network Detection, Browser Tempering Detection, IP Blocklist, and more.`,
    url: '/playground',
    icon: <Fingerprint />,
  },
  {
    title: 'Coupon Fraud',
    url: '/coupon-fraud',
    icon: <AirplaneTicket />,
    description: `While increased sales are good for your business, customers acting in bad faith can dry up available promotional campaign dollars by repeatedly using coupon codes.
    
    Preventing customers, either signed-in or guests, from abusing your coupons and promotions can help you prevent financial losses and increase sales.`,
  },
  {
    title: 'Credential Stuffing',
    url: '/credential-stuffing',
    icon: <People />,
    description: `Protect your users and your business against Credential Stuffing and other account takeover attacks with the proposed approaches.
    
At the same time, your legit users won’t experience any additional friction.`,
  },
  {
    title: 'Loan Risk',
    url: '/loan-risk',
    icon: <Money />,
    description: `Loan application protection is the practice of validating applications against prior submissions by users, either anonymous or authenticated.

Essentially, it is to check for consistency between applications and ignore submissions from previously rejected applicants.`,
  },
  {
    title: 'Payment Fraud',
    url: '/payment-fraud',
    icon: <CreditScore />,
    description: `Identify anonymous visitors behind every transaction. Instantly recognize repeated card testing activity and link it to specific users.

As a result, you will protect your users and your business against various payment frauds with the demonstrated approaches.`,
  },
  {
    title: 'Paywall',
    url: '/paywall',
    icon: <Block />,
    description: `Provide limited access to your content and ensure that your users are not able to exceed it.
      
      Users won't be able to bypass it even by clearing cookies or switching to incognito mode.`,
  },
  {
    title: 'Personalization',
    url: '/personalization',
    icon: <Settings />,
    description: `Provide your users with a tailored experience without cookies. 
    
    Demonstration of personalized content such as search history, customized user interface, or even a shopping cart.`,
  },
  {
    title: 'Web scraping prevention',
    description: 'Protect your content from web scraping by reliably detecting bots and browser automation tools.',
    url: '/web-scraping',
    icon: <PrecisionManufacturing />,
  },
];

export default function Index() {
  return (
    <>
      <Container size="large" className={styles.hero}>
        <h1 className={styles.title}>Fingerprint use cases</h1>
        <div className={styles.intro}>
          <p>
            Explore the wide range of major use cases supported by Fingerprint, including a comprehensive demo that
            showcases both frontend and backend sample implementations with a persistent data layer for each use case. 
          </p>

          <p>
            This provides insights and practical guidance on how to effectively implement Fingerprint for the specific
            use case that is most relevant to your business.
          </p>
        </div>
      </Container>
      <div className={styles.useCaseGrid}>
        {pageTiles.map((pageTile) => (
          <div className={styles.useCaseCard}>
            <h2>{pageTile.title}</h2>
            <div>{pageTile.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}
