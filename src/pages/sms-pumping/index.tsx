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
import { SubmitCodeForm } from '../../client/components/sms-pumping/SubmitCodeForm';
import { PhoneNumberForm } from '../../client/components/sms-pumping/PhoneNumberForm';
import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { useMutation } from 'react-query';
import { SendSMSResponse, SendSMSPayload } from '../api/sms-pumping/send-verification-sms';
import { TEST_PHONE_NUMBER } from '../../server/sms-pumping/smsPumpingConst';

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

type SendMessageMutationArgs = {
  onSuccess?: (data: SendSMSResponse) => void;
  disableBotDetection?: boolean;
};

export type SendMessageMutation = ReturnType<typeof useSendMessage>;
export const useSendMessage = ({ onSuccess, disableBotDetection = false }: SendMessageMutationArgs) => {
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
      const response = await fetch(`/api/sms-pumping/send-verification-sms`, {
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

const SmsFraudUseCase: NextPage<QueryAsProps> = ({ disableBotDetection }) => {
  // Default mocked user data
  const [phoneNumber, setPhoneNumber] = useState(TEST_PHONE_NUMBER);
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

  return (
    <UseCaseWrapper useCase={USE_CASES.smsPumping}>
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
            <SubmitCodeForm phoneNumber={phoneNumber} email={email} sendMessageMutation={sendMessageMutation} />
          </>
        )}
      </div>
    </UseCaseWrapper>
  );
};

export default SmsFraudUseCase;
