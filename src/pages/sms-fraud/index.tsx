import { FunctionComponent, useState } from 'react';
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

const useVisitorDataOnDemand = () =>
  useVisitorData(
    { ignoreCache: true },
    {
      immediate: false,
    },
  );

type SendMessageMutation = ReturnType<typeof useSendMessage>;
const useSendMessage = ({
  onSuccess,
  disableBotDetection = false,
}: {
  onSuccess?: () => void;
  disableBotDetection?: boolean;
}) => {
  const { getData } = useVisitorDataOnDemand();
  return useMutation<SendSMSResponse, Error, { phoneNumber: string; email: string }>({
    mutationKey: 'sendSms',
    mutationFn: async ({ phoneNumber, email }) => {
      const { requestId } = await getData();
      const response = await fetch(`/api/sms-fraud/send-verification-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          requestId,
          email,
          disableBotDetection,
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
        onSuccess?.();
      }
    },
  });
};

type SubmitCodeMutation = ReturnType<typeof useSubmitCode>;
const useSubmitCode = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { getData } = useVisitorDataOnDemand();
  return useMutation<SubmitCodeResponse, Error, { phoneNumber: string; code: string }>({
    mutationKey: ['submitCode'],
    mutationFn: async ({ code, phoneNumber }) => {
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
        throw new Error('Failed to submit code: ' + response.statusText);
      }
    },
    onSuccess: (data) => {
      if (data.severity === 'success') {
        onSuccess?.();
      }
    },
  });
};

type FormStep = 'Send SMS' | 'Submit code' | 'Account created';

type PhoneNumberFormProps = {
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  sendMessageMutation: SendMessageMutation;
  email: string;
  setEmail: (email: string) => void;
};

type SendMessageButtonProps = {
  sendMessageMutation: SendMessageMutation;
  phoneNumber: string;
  email: string;
};

const SendMessageButton: FunctionComponent<SendMessageButtonProps> = ({ sendMessageMutation, phoneNumber, email }) => {
  const {
    mutate: sendMessage,
    data: sendMessageResponse,
    error: sendMessageError,
    isLoading: isLoadingSendSms,
  } = sendMessageMutation;

  return (
    <>
      {sendMessageError ? (
        <Alert severity='error' className={styles.alert}>
          {sendMessageError.message}
        </Alert>
      ) : null}
      {sendMessageResponse ? (
        <Alert severity={sendMessageResponse.severity} className={styles.alert}>
          {sendMessageResponse.message}
        </Alert>
      ) : null}

      <Button
        disabled={isLoadingSendSms || sendMessageResponse?.data?.remainingAttempts === 0}
        type='submit'
        onClick={() => sendMessage({ email, phoneNumber })}
        data-testid={TEST_IDS.smsFraud.submit}
      >
        {isLoadingSendSms
          ? `Sending code to ${phoneNumber}`
          : sendMessageResponse
            ? 'Resend Verification SMS'
            : 'Send code via SMS'}
      </Button>
    </>
  );
};

const PhoneNumberForm: FunctionComponent<PhoneNumberFormProps> = ({
  phoneNumber,
  setPhoneNumber,
  email,
  setEmail,
  sendMessageMutation,
}) => {
  return (
    <form className={classNames(formStyles.useCaseForm, styles.form)}>
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

      <SendMessageButton sendMessageMutation={sendMessageMutation} phoneNumber={phoneNumber} email={email} />
    </form>
  );
};

type SubmitCodeFormProps = {
  phoneNumber: string;
  email: string;
  sendMessageMutation: SendMessageMutation;
  submitCodeMutation: SubmitCodeMutation;
};

const SubmitCodeForm: FunctionComponent<SubmitCodeFormProps> = ({
  phoneNumber,
  email,
  submitCodeMutation,
  sendMessageMutation,
}) => {
  const [code, setCode] = useState('');

  const {
    mutate: submitCode,
    data: submitCodeResponse,
    error: submitCodeError,
    isLoading: isLoadingSubmitCode,
  } = submitCodeMutation;

  return (
    <form
      className={classNames(formStyles.useCaseForm, styles.codeForm)}
      onSubmit={(e) => {
        e.preventDefault();
        submitCode({ code, phoneNumber });
      }}
    >
      <SendMessageButton sendMessageMutation={sendMessageMutation} phoneNumber={phoneNumber} email={email} />

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
      <Button disabled={isLoadingSubmitCode} type='submit' data-testid={TEST_IDS.smsFraud.submit} outlined={true}>
        {isLoadingSubmitCode ? 'Verifying...' : 'Verify'}
      </Button>
    </form>
  );
};

export default function Index() {
  // Default mocked user data
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('user@company.com');
  const [formStep, setFormStep] = useState<FormStep>('Send SMS');

  const sendMessageMutation = useSendMessage({
    onSuccess: () => setFormStep('Submit code'),
    disableBotDetection: true,
  });

  const submitCodeMutation = useSubmitCode({ onSuccess: () => setFormStep('Account created') });

  return (
    <UseCaseWrapper useCase={USE_CASES.smsFraud}>
      <div className={formStyles.wrapper}>
        {formStep === 'Send SMS' && (
          <PhoneNumberForm
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            sendMessageMutation={sendMessageMutation}
          />
        )}
        {formStep === 'Submit code' && (
          <SubmitCodeForm
            phoneNumber={phoneNumber}
            submitCodeMutation={submitCodeMutation}
            sendMessageMutation={sendMessageMutation}
          />
        )}
        {formStep === 'Account created' && <h1>Account created!</h1>}
      </div>
    </UseCaseWrapper>
  );
}
