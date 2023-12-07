import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import Alert from '../../client/components/common/Alert/Alert';
import Button from '../../client/components/common/Button/Button';
import styles from './credentialStuffing.module.scss';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';
import hiddenIcon from './iconHidden.svg';
import shownIcon from './iconShown.svg';
import Image from 'next/image';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';

export default function Index() {
  const { getData } = useVisitorData(
    { ignoreCache: true },
    {
      immediate: false,
    },
  );

  // Default mocked user data
  const [userName, setUserName] = useState('user');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  const [authMessage, setAuthMessage] = useState();
  const [severity, setSeverity] = useState();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [httpResponseStatus, setHttpResponseStatus] = useState<number | null>();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsWaitingForResponse(true);

    const fpData = await getData();
    const { requestId, visitorId } = fpData;

    const loginData = {
      userName,
      password,
      visitorId,
      requestId,
    };

    // Server-side handler for this route is located in api/credential-stuffing/authenticate.js file.
    const response = await fetch('/api/credential-stuffing/authenticate', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const responseJson = await response.json();
    const responseStatus = response.status;
    setAuthMessage(responseJson.message);
    setSeverity(responseJson.severity);
    setHttpResponseStatus(responseStatus);
    setIsWaitingForResponse(false);
  }

  return (
    <UseCaseWrapper useCase={USE_CASES.credentialStuffing}>
      <div className={formStyles.wrapper}>
        <form onSubmit={handleSubmit} className={classNames(formStyles.useCaseForm, styles.credentialStuffingForm)}>
          <label>Username</label>
          <input
            type="text"
            name="username"
            placeholder="Username"
            defaultValue={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            name="password"
            placeholder="Password"
            className={styles.password}
            type={showPassword ? 'text' : 'password'}
            defaultValue={password}
            data-testid={TEST_IDS.credentialStuffing.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.showHideIcon} type="button" onClick={() => setShowPassword(!showPassword)}>
            <Image src={showPassword ? shownIcon : hiddenIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
          </button>

          {httpResponseStatus ? (
            <Alert severity={severity ?? 'warning'} className={styles.alert}>
              {authMessage}
            </Alert>
          ) : null}
          <Button disabled={isWaitingForResponse} type="submit" data-testid={TEST_IDS.credentialStuffing.login}>
            {isWaitingForResponse ? 'Hold on, doing magic...' : 'Log In'}
          </Button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
