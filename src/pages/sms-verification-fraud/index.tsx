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
import { SendSMSPayload, SendSMSResponse } from '../api/sms-fraud/verify-number';
import { Alert } from '../../client/components/common/Alert/Alert';

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

  const {
    mutate: sendVerificationSms,
    data: sendSmsResponse,
    isLoading,
  } = useMutation<SendSMSResponse, Error>({
    mutationKey: ['sendSms'],
    mutationFn: async () => {
      const { requestId } = await getData();
      const response = await fetch(`/api/sms-fraud/verify-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
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
  });

  return (
    <UseCaseWrapper useCase={USE_CASES.smsFraud}>
      <div className={formStyles.wrapper}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendVerificationSms();
          }}
          className={classNames(formStyles.useCaseForm)}
        >
          <label>Email</label>
          <input
            type='text'
            name='email'
            placeholder='Email'
            defaultValue={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Phone number</label>
          <span className={formStyles.description}>Use a international format without spaces like +441112223333</span>
          <input
            type='tel'
            name='phone'
            placeholder='Phone'
            required
            // Use international phone number format
            pattern='[+][0-9]{1,3}[0-9]{9}'
            defaultValue={phoneNumber}
            data-testid={TEST_IDS.smsFraud.phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />

          {sendSmsResponse ? <Alert severity={sendSmsResponse.severity}>{sendSmsResponse.message}</Alert> : null}
          <Button disabled={isLoading} type='submit' data-testid={TEST_IDS.smsFraud.submit}>
            {isLoading ? `Sending verification SMS...` : 'Create account'}
          </Button>
        </form>
      </div>
    </UseCaseWrapper>
  );
}
