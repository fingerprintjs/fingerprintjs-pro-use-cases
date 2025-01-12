'use client';

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../../../client/components/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../../../client/content';
import { FPJS_CLIENT_TIMEOUT } from '../../../../const';
import { useMutation, useQuery } from 'react-query';
import { IsLoggedInPayload, IsLoggedInResponse } from '../../api/is-logged-in/route';
import Button from '../../../../client/components/Button/Button';
import styles from '../../accountSharing.module.scss';
import { LogoutResponse } from '../../api/logout/route';
import { Alert } from '../../../../client/components/Alert/Alert';
import { useRouter } from 'next/navigation';
import { FunctionComponent } from 'react';

const CardRow: FunctionComponent<{ cards: string[] }> = ({ cards }) => {
  return (
    <div className={styles.cardsRow}>
      {cards.map((card, index) => (
        <div key={index} className={styles.card}>
          {card}
        </div>
      ))}
    </div>
  );
};

export default function AccountSharingHome({ params }: { params: { username: string } }) {
  const username = params.username;
  const { data: visitorData, isLoading: isLoadingVisitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });
  const router = useRouter();

  const {
    data: loggedInData,
    isLoading: isLoadingLoggedIn,
    error: loggedInError,
  } = useQuery<IsLoggedInResponse, Error, IsLoggedInResponse>({
    queryKey: ['isLoggedIn', params.username, visitorData?.requestId],
    queryFn: async () => {
      const response = await fetch(`/account-sharing/api/is-logged-in`, {
        method: 'POST',
        body: JSON.stringify({
          username: params.username,
          requestId: visitorData?.requestId ?? '',
        } satisfies IsLoggedInPayload),
      });
      return await response.json();
    },
    enabled: Boolean(visitorData?.requestId),
    /**
     * To keep the demo simple, we are using polling to check if the user has been logged out from this device.
     * In a real-world application, you might opt to use a server-sent events (SSE) or web sockets to get real-time updates.
     */
    refetchInterval: 2000,
    onSuccess: (data) => {
      if (data.severity === 'error') {
        youHaveBeenLoggedOut(
          data.otherDevice ? `${data.otherDevice.deviceName} (${data.otherDevice.deviceLocation})` : undefined,
        );
      }
    },
  });

  const {
    mutate: logout,
    isLoading: isLoadingLogout,
    data: logoutData,
    error: logoutError,
  } = useMutation<LogoutResponse, Error>({
    mutationFn: async () => {
      const response = await fetch(`/account-sharing/api/logout`, {
        method: 'POST',
        body: JSON.stringify({ username, requestId: visitorData?.requestId ?? '' }),
      });
      return await response.json();
    },
    onSuccess: (data) => {
      if (data.severity === 'success') {
        youHaveBeenLoggedOut();
      }
    },
  });

  const youHaveBeenLoggedOut = (otherDevice?: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('mode', 'login');
    searchParams.set('justLoggedOut', 'true');
    if (otherDevice) {
      searchParams.set('otherDevice', otherDevice);
    }
    router.push(`/account-sharing?${searchParams.toString()}`, { scroll: false });
  };

  return (
    <UseCaseWrapper useCase={USE_CASES.accountSharing} noInnerPadding={true}>
      <div className={styles.header}>
        <h1>FraudFlix</h1>
        <div className={styles.headerRight}>
          <Button size='medium' onClick={() => logout()}>
            {isLoadingLogout ? 'Logging out...' : 'Logout'}
          </Button>
        </div>
      </div>

      <div className={styles.homeContent}>
        {logoutError && (
          <Alert severity='error' className={styles.alert}>
            {logoutError.message}
          </Alert>
        )}
        {logoutData?.message && logoutData.severity !== 'success' && (
          <Alert severity={logoutData.severity} className={styles.alert}>
            {logoutData.message}
          </Alert>
        )}
        {isLoadingVisitorData || (isLoadingLoggedIn && <div>Loading...</div>)}
        {loggedInError && (
          <Alert severity='error' className={styles.alert}>
            {loggedInError.message}
          </Alert>
        )}
        {loggedInData?.message && (
          <Alert severity={loggedInData.severity} className={styles.alert}>
            {loggedInData.message}
          </Alert>
        )}
      </div>
      {loggedInData?.severity === 'success' && (
        <>
          <div className={styles.homeContent}>
            <h3>See what's next in Fraud</h3>
          </div>
          <CardRow cards={['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5', 'Card 6', 'Card 7', 'Card 8']} />
          <div className={styles.homeContent}>
            <h3>Webinars</h3>
          </div>
          <CardRow cards={['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5', 'Card 6', 'Card 7', 'Card 8']} />
          <div className={styles.homeContent}>
            <h3>Podcasts</h3>
          </div>
          <CardRow cards={['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5', 'Card 6', 'Card 7', 'Card 8']} />
        </>
      )}
    </UseCaseWrapper>
  );
}
