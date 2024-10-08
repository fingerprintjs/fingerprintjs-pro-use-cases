import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';
import { useMutation } from 'react-query';
import { SubmitCodeResponse, SubmitCodePayload } from '../api/submit-code/route';
import { TEST_IDS } from '../../../client/testIDs';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { SendMessageButton } from './SendSMSMessageButton';
import { Alert } from '../../../client/components/Alert/Alert';
import Button from '../../../client/components/Button/Button';
import styles from './smsPumping.module.scss';
import formStyles from '../../../client/styles/forms.module.scss';
import { SendMessageMutation } from '../SmsPumping';

export const useSubmitCode = (params?: { onSuccess?: () => void }) => {
  const { getData } = useVisitorData(
    { ignoreCache: true },
    {
      immediate: false,
    },
  );
  return useMutation<SubmitCodeResponse, Error, { phoneNumber: string; code: string }>({
    mutationKey: ['submitCode'],
    mutationFn: async ({ code, phoneNumber }) => {
      const { requestId } = await getData();
      const response = await fetch(`/sms-pumping/api/submit-code`, {
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
      if (response.status >= 500) {
        throw new Error('Failed to submit code: ' + response.statusText);
      }
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.severity === 'success') {
        params?.onSuccess?.();
      }
    },
  });
};

type SubmitCodeFormProps = {
  phoneNumber: string;
  email: string;
  sendMessageMutation: SendMessageMutation;
};

export const SubmitCodeForm: FunctionComponent<SubmitCodeFormProps> = ({ phoneNumber, email, sendMessageMutation }) => {
  const [code, setCode] = useState('');

  const {
    mutate: submitCode,
    data: submitCodeResponse,
    error: submitCodeError,
    isLoading: isLoadingSubmitCode,
  } = useSubmitCode();

  return (
    <form
      className={classNames(formStyles.useCaseForm, styles.codeForm)}
      onSubmit={(e) => {
        e.preventDefault();
        submitCode({ code, phoneNumber });
      }}
    >
      <SendMessageButton
        sendMessageMutation={sendMessageMutation}
        phoneNumber={phoneNumber}
        email={email}
        type='button'
      />
      <label>Verification code</label>
      <span className={formStyles.description}>Enter the 6-digit code from the SMS message.</span>
      <input
        type='text'
        name='code'
        placeholder='Code'
        required
        value={code}
        pattern='[0-9]{6}'
        data-testid={TEST_IDS.smsFraud.codeInput}
        onChange={(e) => setCode(e.target.value)}
      />
      {submitCodeError && (
        <Alert severity='error' className={styles.alert}>
          {submitCodeError.message}
        </Alert>
      )}
      {submitCodeResponse && (
        <Alert severity={submitCodeResponse.severity} className={styles.alert}>
          {submitCodeResponse.message}
        </Alert>
      )}
      <Button disabled={isLoadingSubmitCode} type='submit' data-testid={TEST_IDS.smsFraud.sendCode} outlined={true}>
        {isLoadingSubmitCode ? 'Verifying...' : 'Verify'}
      </Button>
    </form>
  );
};
