'use client';

import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { UseCaseWrapper } from '../../../../client/components/UseCaseWrapper/UseCaseWrapper';
import { USE_CASES } from '../../../../client/content';
import { FPJS_CLIENT_TIMEOUT } from '../../../../const';
import { useQuery } from 'react-query';
import { IsLoggedInPayload, IsLoggedInResponse } from '../../api/is-logged-in/route';
import Button from '../../../../client/components/Button/Button';
import styles from '../../accountSharing.module.scss';

export default function AccountSharingHome({ params }: { params: { username: string } }) {
  const username = params.username;
  const { data: visitorData } = useVisitorData({ timeout: FPJS_CLIENT_TIMEOUT });

  const { data, isLoading } = useQuery<IsLoggedInResponse, Error, IsLoggedInResponse>({
    queryKey: ['isLoggedIn', params.username],
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
  });

  return (
    <UseCaseWrapper useCase={USE_CASES.accountSharing} noInnerPadding={true}>
      <div className={styles.header}>
        <h1>Fraudflix</h1>
        <div className={styles.headerRight}>
          <div>{username}</div>
          <Button>Logout</Button>
        </div>
      </div>
      {isLoading && <div>Loading...</div>}
      {data?.message && <div>{data.message}</div>}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '2rem',
        }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '16/9',
              backgroundColor: '#2F2F2F',
              borderRadius: '4px',
              transition: 'transform 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          />
        ))}
      </div>
    </UseCaseWrapper>
  );
}
