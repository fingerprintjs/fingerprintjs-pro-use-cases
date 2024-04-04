import { ButtonHTMLAttributes, FunctionComponent } from 'react';
import { useMutation } from 'react-query';
import { SendSMSResponse, SendSMSPayload } from '../../../pages/api/sms-fraud/send-verification-sms';
import { TEST_IDS } from '../../testIDs';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import styles from './smsVerificationFraud.module.scss';
import { Alert } from '../common/Alert/Alert';
import Button from '../common/Button/Button';

export type SendMessageMutation = ReturnType<typeof useSendMessage>;
export const useSendMessage = ({
  onSuccess,
  disableBotDetection = false,
}: {
  onSuccess?: (data: SendSMSResponse) => void;
  disableBotDetection?: boolean;
}) => {
  const { getData } = useVisitorData(
    { ignoreCache: true },
    {
      immediate: false,
    },
  );
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
        onSuccess?.(data);
      }
    },
  });
};

type SendMessageButtonProps = {
  sendMessageMutation: SendMessageMutation;
  phoneNumber: string;
  email: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
};

export const SendMessageButton: FunctionComponent<SendMessageButtonProps> = ({
  sendMessageMutation,
  phoneNumber,
  email,
  type,
}) => {
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
        type={type}
        onClick={type === 'submit' ? undefined : () => sendMessage({ email, phoneNumber })}
        data-testid={TEST_IDS.smsFraud.sendMessage}
      >
        {isLoadingSendSms
          ? `Sending code to ${phoneNumber}`
          : sendMessageResponse
            ? 'Resend code via SMS'
            : 'Send code via SMS'}
      </Button>
    </>
  );
};
