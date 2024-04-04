import { useState } from 'react';
import { UseCaseWrapper } from '../../client/components/common/UseCaseWrapper/UseCaseWrapper';
import React from 'react';
import { USE_CASES } from '../../client/components/common/content';
import Button from '../../client/components/common/Button/Button';
import formStyles from '../../styles/forms.module.scss';
import { TEST_IDS } from '../../client/testIDs';
import { CloseSnackbarButton } from '../../client/components/common/Alert/Alert';
import { enqueueSnackbar } from 'notistack';
import { useCopyToClipboard } from 'react-use';
import { BackArrow } from '../../client/components/common/BackArrow/BackArrow';
import { GetServerSideProps, NextPage } from 'next';
import { useSendMessage } from '../../client/components/sms-fraud/SendSMSMessageButton';
import { SubmitCodeForm, useSubmitCode } from '../../client/components/sms-fraud/SubmitCodeForm';
import { PhoneNumberForm } from '../../client/components/sms-fraud/PhoneNumberForm';

type FormStep = 'Send SMS' | 'Submit code';
type QueryAsProps = {
  disableBotDetection: boolean;
};

// Make URL query object available as props to the page on first render
// to read the `disableBotDetection` param for testing and demo purposes
export const getServerSideProps: GetServerSideProps<QueryAsProps> = async ({ query }) => {
  const { disableBotDetection } = query;
  return {
    props: {
      disableBotDetection: disableBotDetection === '1' || disableBotDetection === 'true',
    },
  };
};

const SmsFraudUseCase: NextPage<QueryAsProps> = ({ disableBotDetection }) => {
  // Default mocked user data
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [email, setEmail] = useState('user@company.com');
  const [formStep, setFormStep] = useState<FormStep>('Send SMS');

  const [, copyToClipboard] = useCopyToClipboard();
  const sendMessageMutation = useSendMessage({
    onSuccess: (data) => {
      setFormStep('Submit code');
      enqueueSnackbar(
        <>
          📱 Simulated SMS message: Your verification code is{' '}
          <b data-testid={TEST_IDS.smsFraud.codeInsideSnackbar}>{data.data?.verificationCode}</b>{' '}
        </>,
        {
          variant: 'info',
          autoHideDuration: 10000,
          action: (snackbarId) => (
            <>
              <Button
                variant='info'
                size='small'
                data-testid={TEST_IDS.smsFraud.copyCodeButton}
                onClick={() => {
                  copyToClipboard(String(data.data?.verificationCode) || '');
                }}
              >
                Copy code
              </Button>
              <CloseSnackbarButton snackbarId={snackbarId} />
            </>
          ),
        },
      );
    },
    disableBotDetection,
  });
  const submitCodeMutation = useSubmitCode();

  return (
    <UseCaseWrapper useCase={USE_CASES.smsFraud}>
      <div className={formStyles.wrapper}>
        {formStep === 'Send SMS' && (
          <PhoneNumberForm
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            sendMessageMutation={sendMessageMutation}
            email={email}
            setEmail={setEmail}
          />
        )}
        {formStep === 'Submit code' && (
          <>
            <BackArrow as='button' label='Back' onClick={() => setFormStep('Send SMS')} />
            <SubmitCodeForm
              phoneNumber={phoneNumber}
              email={email}
              submitCodeMutation={submitCodeMutation}
              sendMessageMutation={sendMessageMutation}
            />
          </>
        )}
      </div>
    </UseCaseWrapper>
  );
};

export default SmsFraudUseCase;
