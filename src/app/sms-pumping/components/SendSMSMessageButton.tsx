import { ButtonHTMLAttributes, FunctionComponent } from 'react';
import { TEST_IDS } from '../../../client/testIDs';
import styles from './smsPumping.module.scss';
import { Alert } from '../../../client/components/Alert/Alert';
import Button from '../../../client/components/Button/Button';
import { SendMessageMutation } from '../SmsPumping';

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
    isPending: isPendingSendSms,
  } = sendMessageMutation;

  return (
    <>
      {sendMessageError && (
        <Alert severity='error' className={styles.alert}>
          {sendMessageError.message}
        </Alert>
      )}
      {sendMessageResponse && (
        <Alert severity={sendMessageResponse.severity} className={styles.alert}>
          {sendMessageResponse.message}
        </Alert>
      )}
      <Button
        disabled={isPendingSendSms || sendMessageResponse?.data?.remainingAttempts === 0}
        type={type}
        onClick={type === 'submit' ? undefined : () => sendMessage({ email, phoneNumber })}
        data-testid={TEST_IDS.smsFraud.sendMessage}
      >
        {isPendingSendSms
          ? `Sending code to ${phoneNumber}`
          : sendMessageResponse
            ? 'Resend code via SMS'
            : 'Send code via SMS'}
      </Button>
    </>
  );
};
