import { USE_CASES } from '../../client/components/common/content';
import { generateUseCaseMetadata } from '../../client/components/common/seo';
import BotFirewall from './BotFirewall';

export const metadata = generateUseCaseMetadata(USE_CASES.botFirewall);

export default function BotFirewallPage() {
  return <BotFirewall />;
}
