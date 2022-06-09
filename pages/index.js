import Link from 'next/link';
import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import Image from 'next/image'


export default function Index() {
  return (
    <>
      <div className="ExternalLayout_wrapper">
        <div className="ExternalLayout_main">
          <div className="UsecaseWrapper_wrapper">
            <Image src="/logo.svg" alt="me" width="500" height="100%" />
            <p className="UsecaseWrapper_helper">
              This project demonstrates various use cases for FingerprintJS Pro. Each scenario covers frontend and backend sample implementation with a persistent data layer. The open-source repository is available at <a href="https://github.com/fingerprintjs/fingerprintjs-pro-use-cases">GithHub</a>.
            </p>
            <hr className="UsecaseWrapper_divider" />
            <ul>
              <li>
                <Link href="/credential-stuffing">
                  <a>Credential Stuffing</a>
                </Link>
              </li>
              <li>
                <Link href="/payment-fraud">
                  <a>Payment Fraud</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
