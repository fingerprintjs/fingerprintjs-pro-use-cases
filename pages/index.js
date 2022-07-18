import Link from 'next/link';
import Image from 'next/image';
import makeStyles from '@mui/styles/makeStyles';
import clsx from 'clsx';
import Paper from '@mui/material/Paper';

const useStyles = makeStyles((theme) => ({
  margin: {
    'margin-top': theme.spacing(1),
    'margin-bottom': theme.spacing(1),
  },
}));

export default function Index() {
  return (
    <Paper variant="outlined">
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <Image src="/logo.svg" alt="me" width="500" height="100%" />
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
            <hr className="UsecaseWrapper_divider" />
            <ul>
              <li className={clsx(useStyles().margin)}>
                <Link href="/credential-stuffing">
                  <a>Account Takeover, Credential Stuffing, Credential Cracking</a>
                </Link>
              </li>
              <li className={clsx(useStyles().margin)}>
                <Link href="/payment-fraud">
                  <a>Payment Fraud, Chargeback Fraud, Card Cracking, Stolen Card</a>
                </Link>
              </li>
              <li className={clsx(useStyles().margin)}>
                <Link href="/personalization">
                  <a>[WIP] Remember user preferences, personalization, user activity history</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Paper>
  );
}
