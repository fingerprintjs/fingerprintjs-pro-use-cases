import { Suspense } from 'react';
import { USE_CASES } from '../../../../client/content';
import { generateUseCaseMetadata } from '../../../../client/seo';
import { AccountSharingHome } from './AccountSharingHome';

export const metadata = generateUseCaseMetadata(USE_CASES.accountSharing);

export default async function AccountSharingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  return (
    <Suspense>
      <AccountSharingHome username={username} />
    </Suspense>
  );
}
