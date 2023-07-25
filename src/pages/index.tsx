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
    <Box
      sx={{
        overflow: 'auto',
        overflowX: 'hidden',
        paddingBottom: (theme) => theme.spacing(6),
      }}
    >
      <div>
        <Box
          sx={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: (theme) => theme.spacing(2),
            marginTop: (theme) => theme.spacing(4),
          }}
        >
          <div>
            <Typography variant="h1" sx={{ fontSize: '3rem', fontWeight: 500 }}>
              Fingerprint Pro Use Cases
            </Typography>
          </div>
          <div>
            <p>
              This website demonstrates various use cases for{' '}
              <a href="https://fingerprint.com" target="_blank">
                {' '}
                Fingerprint Pro
              </a>{' '}
              — a device identity platform with 99.5% accuracy.
            </p>
            <Divider />
            <p>
              Each use case demo covers frontend and backend sample implementation with a persistent data layer. The
              open-source repository is available on{' '}
              <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases">GitHub</a>.
            </p>
            <p>
              Go to the <Link href="/admin">Admin page</Link> to reset all scenarios for your browser.
            </p>
          </div>
        </Box>
        <Box
          component="main"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              // makes card responsive on sub 300px screens
              '300': 'repeat(auto-fit, minmax(160px, 1fr))',
              sm: 'repeat(auto-fit, minmax(300px, 1fr))',
            },
            maxWidth: '1200px',
            margin: '0 auto',
            padding: (theme) => ({
              xs: theme.spacing(1),
              sm: theme.spacing(4),
            }),
            gap: (theme) => ({
              xs: theme.spacing(2),
              sm: theme.spacing(4),
            }),
          }}
        >
          {pageTiles.map((pageTile) => (
            <PageTile key={pageTile.url} {...pageTile} />
          ))}
        </Box>
      </div>
    </Box>
  );
}
