import { USE_CASES } from '../../../client/components/common/content';
import { generateUseCaseMetadata } from '../../../client/components/common/seo';
import Paywall from '../Paywall';

export const metadata = generateUseCaseMetadata(USE_CASES.paywall);

export default function PaywallPage() {
  return <Paywall embed={true} />;
}
