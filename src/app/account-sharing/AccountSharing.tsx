'use client';

import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/content';
import styles from './accountSharing.module.scss';
import formStyles from '../../client/styles/forms.module.scss';
import classNames from 'classnames';
import hiddenIcon from '../../client/img/iconHidden.svg';
import shownIcon from '../../client/img/iconShown.svg';
import Image from 'next/image';
import { TEST_IDS } from '../../client/testIDs';
import Button from '../../client/components/Button/Button';
import { FPJS_CLIENT_TIMEOUT } from '../../const';
import { useMutation } from 'react-query';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { CreateAccountPayload, CreateAccountResponse } from './api/create-account/route';
import { Alert } from '../../client/components/Alert/Alert';

const TEST_ID = TEST_IDS.accountSharing;

export function AccountSharing() {
  // Default mocked user data
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'signup' | 'login'>('signup');

  const { getData: getVisitorData } = useVisitorData(
    { ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT },
    {
      immediate: false,
    },
  );

  const {
    mutate: createAccount,
    isLoading,
    data: createAccountResponse,
    error: createAccountError,
  } = useMutation<CreateAccountResponse, Error, Omit<CreateAccountPayload, 'requestId' | 'visitorId'>>({
    mutationKey: ['login attempt'],
    mutationFn: async ({ username, password }) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      const response = await fetch('/account-sharing/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, requestId } satisfies CreateAccountPayload),
      });
      return await response.json();
    },
  });

  return (
    <UseCaseWrapper useCase={USE_CASES.accountSharing}>
      <div className={formStyles.wrapper}>
        <h3 className={styles.formTitle}>{mode === 'signup' ? 'Sign up for FraudFlix' : 'Log in to FraudFlix'}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={classNames(formStyles.useCaseForm, styles.accountSharingForm)}
        >
          <label>Username</label>
          <input
            type='text'
            name='username'
            placeholder='Username'
            defaultValue={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            name='password'
            placeholder='Password'
            className={styles.password}
            type={showPassword ? 'text' : 'password'}
            defaultValue={password}
            data-testid={TEST_ID.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.showHideIcon} type='button' onClick={() => setShowPassword(!showPassword)}>
            <Image src={showPassword ? shownIcon : hiddenIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
          </button>
          <Button
            disabled={isLoading}
            type='submit'
            data-testid={TEST_ID.login}
            onClick={() => createAccount({ username, password })}
          >
            {isLoading ? 'One moment...' : mode === 'signup' ? 'Sign up' : 'Log in'}
          </Button>
          {createAccountError && <Alert severity='error'>{createAccountError.message}</Alert>}
          {createAccountResponse?.message && (
            <Alert severity={createAccountResponse.severity} className={styles.alert}>
              {createAccountResponse.message}
            </Alert>
          )}
          <p className={styles.switchMode}>
            {mode === 'signup' ? (
              <>
                Already have an account? <button onClick={() => setMode('login')}>Log in</button>
              </>
            ) : (
              <>
                Don't have an account yet? <button onClick={() => setMode('signup')}>Sign up first</button>
              </>
            )}
          </p>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
