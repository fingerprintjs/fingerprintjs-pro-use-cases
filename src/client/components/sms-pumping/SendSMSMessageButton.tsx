import { ButtonHTMLAttributes, FunctionComponent } from 'react';
import { TEST_IDS } from '../../testIDs';
import styles from './smsPumping.module.scss';
import { Alert } from '../common/Alert/Alert';
import Button from '../common/Button/Button';
import { SendMessageMutation } from '../../../pages/sms-pumping';

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
