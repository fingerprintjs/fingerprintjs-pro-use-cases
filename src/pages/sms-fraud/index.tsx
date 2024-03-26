import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import Button from '../../client/components/common/Button/Button';
import formStyles from '../../styles/forms.module.scss';
import classNames from 'classnames';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { TEST_IDS } from '../../client/testIDs';
import { useMutation } from 'react-query';
import { SendSMSPayload, SendSMSResponse } from '../api/sms-fraud/send-verification-sms';
import { Alert } from '../../client/components/common/Alert/Alert';
import styles from './smsVerificationFraud.module.scss';
import { SubmitCodePayload, SubmitCodeResponse } from '../api/sms-fraud/submit-code';

export default function Index() {
  const { getData } = useVisitorData(
    { ignoreCache: true },
    {
      immediate: false,
    },
  );

  // Default mocked user data
  const [email, setEmail] = useState('user@company.com');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [smsSent, setSmsSent] = useState(false);

  const {
    mutate: sendVerificationSms,
    data: sendSmsResponse,
    error: sendSmsError,
    isLoading: isLoadingSendSms,
  } = useMutation<SendSMSResponse, Error>({
    mutationKey: ['sendSms'],
    mutationFn: async () => {
      const { requestId } = await getData();
      const response = await fetch(`/api/sms-fraud/send-verification-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          requestId,
          email,
        } satisfies SendSMSPayload),
      });
      if (response.status < 500) {
        return await response.json();
      } else {
        throw new Error('Failed to send verification SMS: ' + response.statusText);
      }
    },
    onSuccess: (data: SendSMSResponse) => {
      if (data.severity === 'success') {
        setSmsSent(true);
      }
    },
  });

  const {
    mutate: submitCode,
    data: submitCodeResponse,
    error: submitCodeError,
    isLoading: isLoadingSubmitCode,
  } = useMutation<SubmitCodeResponse, Error>({
    mutationKey: ['submitCode'],
    mutationFn: async () => {
      const { requestId } = await getData();
      const response = await fetch(`/api/sms-fraud/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: Number(code),
          phoneNumber,
          requestId,
        } satisfies SubmitCodePayload),
      });
      if (response.status < 500) {
        return await response.json();
      } else {
        throw new Error('Failed to submit verification code: ' + response.statusText);
      }
    },
  });

  return (
    <UseCaseWrapper useCase={USE_CASES.smsFraud}>
      <div className={formStyles.wrapper}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendVerificationSms();
          }}
          className={classNames(formStyles.useCaseForm, styles.form)}
        >
          <label>Email</label>
          <input
            type='text'
            name='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Phone number</label>
          <span className={formStyles.description}>Use a international format without spaces like +441112223333.</span>
          <input
            type='tel'
            name='phone'
            placeholder='Phone'
            required
            // Use international phone number format
            pattern='[+][0-9]{1,3}[0-9]{9}'
            value={phoneNumber}
            data-testid={TEST_IDS.smsFraud.phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          {sendSmsError ? (
            <Alert severity='error' className={styles.alert}>
              {sendSmsError.message}
            </Alert>
          ) : null}
          {sendSmsResponse ? (
            <Alert severity={sendSmsResponse.severity} className={styles.alert}>
              {sendSmsResponse.message}
            </Alert>
          ) : null}

          {sendSmsResponse?.data?.remainingAttempts === 0 ? null : (
            <Button disabled={isLoadingSendSms} type='submit' data-testid={TEST_IDS.smsFraud.submit}>
              {isLoadingSendSms
                ? `Sending code to ${phoneNumber}`
                : sendSmsResponse
                  ? 'Resend Verification SMS'
                  : 'Send code via SMS'}
            </Button>
          )}
        </form>
        {smsSent && (
          <form
            className={classNames(formStyles.useCaseForm, styles.codeForm)}
            onSubmit={(e) => {
              e.preventDefault();
              submitCode();
            }}
          >
            <label>Verification code</label>
            <span className={formStyles.description}>Enter the 6-digit code from the SMS message.</span>
            <input
              type='text'
              name='code'
              placeholder='Code'
              required
              value={code}
              pattern='[0-9]{6}'
              data-testid={TEST_IDS.smsFraud.code}
              onChange={(e) => setCode(e.target.value)}
            />
            {submitCodeError ? (
              <Alert severity='error' className={styles.alert}>
                {submitCodeError.message}
              </Alert>
            ) : null}
            {submitCodeResponse ? (
              <Alert severity={submitCodeResponse.severity} className={styles.alert}>
                {submitCodeResponse.message}
              </Alert>
            ) : null}
            <Button disabled={isLoadingSendSms} type='submit' data-testid={TEST_IDS.smsFraud.submit} outlined={true}>
              {isLoadingSubmitCode ? 'Verifying...' : 'Verify'}
            </Button>
          </form>
        )}
      </div>
    </UseCaseWrapper>
  );
}
