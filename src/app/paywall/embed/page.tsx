import { USE_CASES } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import Paywall from '../Paywall';

export const metadata = generateUseCaseMetadata(USE_CASES.paywall);

export default function PaywallPage() {
  return <Paywall embed={true} />;
}
