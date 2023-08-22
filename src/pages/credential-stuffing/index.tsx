import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import { useVisitorData } from '../../client/use-visitor-data';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import Alert from '../../client/components/common/Alert/Alert';
import Button from '../../client/components/common/Button';
import styles from './credentialStuffing.module.scss';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';

export default function Index() {
  const visitorDataQuery = useVisitorData({
    // Don't fetch visitorData on mount
    enabled: false,
  });

  // Default mocked user data
  const [userName, setUserName] = useState('user');
  const [password, setPassword] = useState('password');

  const [authMessage, setAuthMessage] = useState();
  const [severity, setSeverity] = useState();
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const [httpResponseStatus, setHttpResponseStatus] = useState<number | null>();

  async function handleSubmit(e) {
    e.preventDefault();
    setIsWaitingForResponse(true);

    const fpQuery = await visitorDataQuery.refetch();
    const { requestId, visitorId } = fpQuery.data;

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
            type={'password'}
            defaultValue={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {httpResponseStatus ? (
            <Alert severity={severity} className={styles.alert}>
              {authMessage}
            </Alert>
          ) : null}
          <Button disabled={isWaitingForResponse} type="submit">
            {isWaitingForResponse ? 'Hold on, doing magic...' : 'Log In'}
          </Button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
