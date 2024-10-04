import { USE_CASES } from '../../../client/components/common/content';
import { generateUseCaseMetadata } from '../../../client/components/common/seo';
import { Personalization } from '../Personalization';

export const metadata = generateUseCaseMetadata(USE_CASES.personalization);

export default function PaywallPage() {
  return <Personalization />;
}
