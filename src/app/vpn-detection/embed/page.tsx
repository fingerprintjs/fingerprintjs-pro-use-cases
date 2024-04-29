import { USE_CASES } from '../../../client/components/common/content';
import { generateUseCaseMetadata } from '../../../client/components/common/seo';
import { VpnDetectionUseCaseWrapped } from '../vpnDetection';

export const metadata = generateUseCaseMetadata(USE_CASES.vpnDetection);

export default function VpnDetectionPage() {
  return <VpnDetectionUseCaseWrapped />;
}
