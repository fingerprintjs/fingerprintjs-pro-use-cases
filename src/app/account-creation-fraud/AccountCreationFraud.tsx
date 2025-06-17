'use client';

import { useState } from 'react';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import classNames from 'classnames';
import Image from 'next/image';
import styles from './accountCreationFraud.module.scss';
import formStyles from '../../client/styles/forms.module.scss';
import hiddenIcon from '../../client/img/iconHidden.svg';
import shownIcon from '../../client/img/iconShown.svg';
import Button from '../../client/components/Button/Button';
import { UseCaseWrapper } from '../../client/components/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../client/content';
import { FPJS_CLIENT_TIMEOUT } from '../../const';
import { Alert } from '../../client/components/Alert/Alert';
import { useMutation } from 'react-query';
import { CreateAccountPayload } from './api/create-account/route';

type CreateAccountStatus = 'not-attempted' | 'pending' | 'success' | 'trial-exists' | 'unexpected-error';

export function AccountCreationFraudUseCase({ embed }: { embed?: boolean }) {
  const { getData: getVisitorData } = useVisitorData(
    {
      ignoreCache: true,
      timeout: FPJS_CLIENT_TIMEOUT,
    },
    {
      immediate: false,
    },
  );

  const {
    mutate: createAccount,
    isLoading,
    data: createAccountResponse,
    reset,
  } = useMutation({
    mutationKey: ['create trial account'],
    mutationFn: async ({ username, password }: Omit<CreateAccountPayload, 'requestId'>) => {
      const { requestId } = await getVisitorData({ ignoreCache: true });
      return await fetch('/account-creation-fraud/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, requestId } satisfies CreateAccountPayload),
      });
    },
  });

  const handleGoBack = () => reset();

  const createAccountStatus = calculateCreateAccountStatus(isLoading, createAccountResponse);

  return (
    <UseCaseWrapper useCase={USE_CASES.accountCreationFraud} embed={embed}>
      {createAccountStatus === 'success' ? (
        <TrialCreated onGoBack={handleGoBack} />
      ) : (
        <CreateTrialForm createAccountStatus={createAccountStatus} onCreate={createAccount} />
      )}
    </UseCaseWrapper>
  );
}

interface CreateTrialFormProps {
  createAccountStatus: Omit<CreateAccountStatus, 'success'>;
  onCreate: (payload: Omit<CreateAccountPayload, 'requestId'>) => void;
}

function CreateTrialForm({ createAccountStatus, onCreate }: CreateTrialFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const accountCreatePending = createAccountStatus === 'pending';

  return (
    <>
      <div className={formStyles.wrapper}>
        <h3 className={styles.formTitle}>Start your trial with $30 in free credits!</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            const formData = new FormData(e.currentTarget);
            const username = formData.get('username');
            const password = formData.get('password');

            if (typeof username === 'string' && typeof password === 'string') {
              onCreate({ username, password });
            }
          }}
          className={classNames(formStyles.useCaseForm, styles.accountCreationFraudForm)}
        >
          <label htmlFor='username'>Username</label>
          <input type='text' id='username' name='username' placeholder='Username' required />

          <label htmlFor='password'>Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            id='password'
            name='password'
            placeholder='Password'
            required
          />
          <button className={styles.showHideIcon} type='button' onClick={() => setShowPassword(!showPassword)}>
            <Image src={showPassword ? shownIcon : hiddenIcon} alt={showPassword ? 'Hide password' : 'Show password'} />
          </button>
          {createAccountStatus === 'trial-exists' ? <TrialExistsAlert /> : null}
          {createAccountStatus === 'unexpected-error' ? <UnexpectedCreationErrorAlert /> : null}
          <Button disabled={accountCreatePending} type='submit'>
            {accountCreatePending ? 'Processing...' : 'Create trial account'}
          </Button>
        </form>
      </div>
    </>
  );
}

function TrialExistsAlert() {
  return (
    <Alert severity='error' className={styles.alert}>
      It looks like you have already created a free trial account using this browser. You are only allowed one trial
      account. If this is not the case, please contact support.
    </Alert>
  );
}

function UnexpectedCreationErrorAlert() {
  return (
    <Alert severity='error'>Failed to create a trial account due to an unexpected error. Please try again later.</Alert>
  );
}

interface TrialCreatedProps {
  onGoBack: () => void;
}

function TrialCreated({ onGoBack }: TrialCreatedProps) {
  return (
    <div className={formStyles.wrapper}>
      <h3 className={styles.formTitle}>Welcome to your free trial!</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onGoBack();
        }}
        className={classNames(formStyles.useCaseForm, styles.accountCreationFraudForm)}
      >
        <Alert severity='success' className={styles.alert}>
          Free trial created. Remaining credits: $30.
        </Alert>
        <Button type='submit'>Go back</Button>
      </form>
    </div>
  );
}

function calculateCreateAccountStatus(isLoading: boolean, createAccountResponse?: Response): CreateAccountStatus {
  if (isLoading) {
    return 'pending';
  }

  if (!createAccountResponse) {
    return 'not-attempted';
  }

  switch (createAccountResponse.status) {
    case 200:
      return 'success';
    case 409:
      return 'trial-exists';
    default:
      return 'unexpected-error';
  }
}
