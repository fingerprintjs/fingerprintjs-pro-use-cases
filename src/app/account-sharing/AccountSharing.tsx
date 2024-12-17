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

export function AccountSharing() {
  // Default mocked user data
  const [username, setUsername] = useState('user');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <UseCaseWrapper useCase={USE_CASES.credentialStuffing}>
      <div className={formStyles.wrapper}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className={classNames(formStyles.useCaseForm, styles.credentialStuffingForm)}
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
            data-testid={TEST_IDS.credentialStuffing.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className={styles.showHideIcon} type='button' onClick={() => setShowPassword(!showPassword)}>
            <Image src={showPassword ? shownIcon : hiddenIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
          </button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
