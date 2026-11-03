import { PLAYGROUND_METADATA } from '../../../client/content';
import { generateUseCaseMetadata } from '../../../client/seo';
import { Playground } from '../Playground';

export const metadata = generateUseCaseMetadata(PLAYGROUND_METADATA);

export default function PlaygroundPage() {
  return <Playground />;
}
