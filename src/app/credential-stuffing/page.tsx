import { USE_CASES } from '../../client/components/common/content';
import { generateUseCaseMetadata } from '../../client/components/common/seo';
import { CredentialStuffing } from './CredentialStuffing';

export const metadata = generateUseCaseMetadata(USE_CASES.credentialStuffing);

export default function CredentialStuffingPage() {
  return <CredentialStuffing />;
}
