import Link from 'next/link';
import Paper from '@mui/material/Paper';
import { CreditScore, People, Settings } from '@mui/icons-material';
import { PageTile } from '../components/page-tile';
import Grid from '@mui/material/Grid';
import { Logo } from '../components/logo';

const pages = [
  {
    title: 'Credential Stuffing',
    url: '/credential-stuffing',
    icon: <People />,
    description: `Confirm that every visitor on your website is real and not an advanced bot using multiple techniques to create fake accounts.
    
You can mitigate account takeover attempts, prevent password sharing and significantly reduce the number of fake accounts.`,
  },
  {
    title: 'Payment Fraud',
    url: '/payment-fraud',
    icon: <CreditScore />,
    description: `Identify anonymous visitors behind every transaction. Instantly recognize repeated card testing activity and link it to specific users.

Significantly reduce chargebacks and fraudulent payments just one month after integrating Fingerprint on your website.`,
  },
  {
    title: 'Personalization',
    url: '/personalization',
    icon: <Settings />,
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. .
     
     Integer porta mi a neque porttitor, sit amet cursus justo molestie. Vestibulum ligula ante, rhoncus ut turpis laoreet, consequat tempus odio.`,
  },
];

export default function Index() {
  return (
    <Paper variant="outlined">
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <Logo width={500} />
            <p className="UsecaseWrapper_helper">
              This project demonstrates various use cases for FingerprintJS Pro. Each scenario covers frontend and
              backend sample implementation with a persistent data layer. The open-source repository is available at{' '}
              <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases">GitHub</a>.
            </p>
            <p className="UsecaseWrapper_helper">
              On the{' '}
              <Link href="/admin">
                <a>admin</a>
              </Link>{' '}
              page, you can remove all info obtained from this browser. This will reenable some scenarios for you if you
              were locked out from the specific action.
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
