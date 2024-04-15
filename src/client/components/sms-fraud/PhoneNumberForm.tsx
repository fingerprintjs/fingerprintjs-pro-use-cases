import { FunctionComponent } from 'react';
import { TEST_IDS } from '../../testIDs';
import { SendMessageButton } from './SendSMSMessageButton';
import classNames from 'classnames';
import styles from './smsVerificationFraud.module.scss';
import formStyles from '../../../styles/forms.module.scss';
import { SendMessageMutation } from '../../../pages/sms-fraud';

type PhoneNumberFormProps = {
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  sendMessageMutation: SendMessageMutation;
  email: string;
  setEmail: (email: string) => void;
};

export const PhoneNumberForm: FunctionComponent<PhoneNumberFormProps> = ({
  phoneNumber,
  setPhoneNumber,
  email,
  setEmail,
  sendMessageMutation,
}) => {
  return (
    <form
      className={classNames(formStyles.useCaseForm, styles.form)}
      onSubmit={(e) => {
        e.preventDefault();
        sendMessageMutation.mutate({ phoneNumber, email });
      }}
    >
      <h3 className={styles.formHeadline}>Create an account</h3>
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
      <span className={formStyles.description}>Use a international format without spaces like +1234567890.</span>
      <input
        type='tel'
        name='phone'
        placeholder='Phone'
        required
        // Use international phone number format
        pattern='[+][0-9]{1,3}[0-9]{9}'
        value={phoneNumber}
        data-testid={TEST_IDS.smsFraud.phoneNumberInput}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <SendMessageButton
        sendMessageMutation={sendMessageMutation}
        phoneNumber={phoneNumber}
        email={email}
        type='submit'
      />
    </form>
  );
};
