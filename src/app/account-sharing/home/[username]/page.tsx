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
import Link from 'next/link';

type Card = {
  title: string;
  backgroundImage: string;
  url?: string;
};

const CardRow: FunctionComponent<{ cards: Card[] }> = ({ cards }) => {
  return (
    <div className={styles.cardsRow}>
      {cards.map((card, index) => (
        <Link
          href={card.url ?? ''}
          key={index}
          className={styles.card}
          target='_blank'
          style={{ backgroundImage: `url(${card.backgroundImage})` }}
        >
          {card.title}
        </Link>
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
            {isLoadingLogout || logoutData?.severity === 'success' ? 'Logging out...' : 'Logout'}
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
            <h3>Shorts</h3>
          </div>
          <CardRow
            cards={[
              {
                title: `A Tale of a False Positive Flamingo`,
                backgroundImage: '/account-sharing/img/airport.jpg',
                url: 'https://www.youtube.com/watch?v=8TJxUGlpTDE',
              },
              {
                title: 'A Fraud Sommelier',
                backgroundImage: '/account-sharing/img/sommelier.jpg',
                url: 'https://www.youtube.com/watch?v=mll2Bm5Qi2A',
              },
              {
                title: 'Catfished',
                backgroundImage: '/account-sharing/img/catfished.jpg',
                url: 'https://www.youtube.com/watch?v=oJolDByP9II',
              },
              {
                title: 'Introduction to Fingerprint',
                url: 'https://www.youtube.com/watch?v=cV2KbL9ALPw',
                backgroundImage: '/account-sharing/img/keshia-intro.jpg',
              },
              {
                title: 'Device Reputation Network for Android',
                url: 'https://www.youtube.com/watch?v=rU_yd8MrZNY',
                backgroundImage: '/account-sharing/img/drn.jpg',
              },
              {
                title: 'Protect Android apps from cloning',
                url: 'https://www.youtube.com/watch?v=9ORRUQK4Kgk',
                backgroundImage: '/account-sharing/img/android-cloning.jpg',
              },
            ]}
          />
          <div className={styles.homeContent}>
            <h3>Webinars</h3>
          </div>
          <CardRow
            cards={[
              {
                title: 'Fingerprint  101',
                url: 'https://www.youtube.com/watch?v=YTRmWUeQWyY&list=PLjhozvP52rLMYFiBLs6wm6E1b2TSbk0yt',
                backgroundImage: '/account-sharing/img/back-to-school.jpg',
              },
              {
                title: 'Smart signals introduction',
                url: 'https://www.youtube.com/watch?v=sf8KM8UgtYY',
                backgroundImage: '/account-sharing/img/smart-signals.jpg',
              },
              {
                title: 'Device Intelligence for Fintech',
                url: 'https://www.youtube.com/watch?v=9UrNabnA9uY',
                backgroundImage: '/account-sharing/img/fintech.jpg',
              },
              {
                title: 'Why accuracy is everything',
                url: 'https://www.youtube.com/watch?v=rTBXQpsioUo&t',
                backgroundImage: '/account-sharing/img/accuracy.jpg',
              },
              {
                title: 'Apple and Google privacy changes',
                url: 'https://www.youtube.com/watch?v=3ebVmdnVw_E',
                backgroundImage: '/account-sharing/img/privacy.jpg',
              },
              {
                title: 'State of Payment Fraud',
                url: 'https://www.youtube.com/watch?v=cV2KbL9ALPw',
                backgroundImage: '/account-sharing/img/payment-fraud.jpg',
              },
            ]}
          />{' '}
          <div className={styles.homeContent}>
            <h3>Podcasts</h3>
          </div>
          <CardRow
            cards={[
              {
                title: 'Dan Pinto on State of Identity podcast',
                url: 'https://liminal.co/podcast/fingerprintjs-fraud-at-the-source/',
                backgroundImage: '/account-sharing/img/dan-pinto.jpg',
              },
              { title: 'Card 2', backgroundImage: '/account-sharing/img/airport.jpg' },
              { title: 'Card 3', backgroundImage: '/account-sharing/img/airport.jpg' },
              { title: 'Card 4', backgroundImage: '/account-sharing/img/airport.jpg' },
            ]}
          />
        </>
      )}
    </UseCaseWrapper>
  );
}
