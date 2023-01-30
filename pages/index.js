import Link from 'next/link';
import Paper from '@mui/material/Paper';
import { AirplaneTicket, Block, CreditScore, Money, People, Settings } from '@mui/icons-material';
import { PageTile } from '../client/components/page-tile';
import Grid from '@mui/material/Grid';
import { Logo } from '../client/components/logo';

const pages = [
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
];

export default function Index() {
  return (
    <Paper
      square
      variant="outlined"
      sx={{
        overflow: 'auto',
        overflowX: 'hidden',
        paddingBottom: (theme) => theme.spacing(6),
      }}
    >
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <Logo width={500} />
            <p className="UsecaseWrapper_helper">
              This project demonstrates various use cases for Fingerprint Pro. Each scenario covers frontend and backend
              sample implementation with a persistent data layer. The open-source repository is available at{' '}
              <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases">GitHub</a>.
            </p>
            <p className="UsecaseWrapper_helper">
              On the <Link href="/admin">admin</Link> page, you can remove all info obtained from this browser. This
              will reenable some scenarios for you if you were locked out from the specific action.
            </p>
          </div>
        </div>
        <Grid
          container
          direction={{
            xs: 'column',
            md: 'row',
          }}
          spacing={3}
          rowSpacing={{
            xs: 4,
            lg: 9,
          }}
          sx={{
            marginTop: (theme) => theme.spacing(3),
            paddingX: (theme) => theme.spacing(6),
            marginBottom: (theme) => theme.spacing(3),
          }}
        >
          {pages.map((page) => (
            <Grid
              key={page.url}
              item
              md={4}
              xs={12}
              sx={{
                maxHeight: {
                  xs: 'auto',
                  lg: 350,
                },
              }}
            >
              <PageTile page={page} />
            </Grid>
          ))}
        </Grid>
      </div>
    </Paper>
  );
}
