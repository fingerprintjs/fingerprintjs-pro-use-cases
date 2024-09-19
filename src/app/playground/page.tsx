import { PLAYGROUND_METADATA } from '../../client/components/common/content';
import { generateUseCaseMetadata } from '../../client/components/common/seo';
import { Playground } from './Playground';

export const metadata = generateUseCaseMetadata(PLAYGROUND_METADATA);

export default function VpnDetectionPage() {
  return <Playground />;
}
