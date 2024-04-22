import { USE_CASES } from '../../client/components/common/content';
import { generateUseCaseMetadata } from '../../client/components/common/seo';
import { LocationSpoofingUseCaseWrapped } from './LocationSpoofing';

export const metadata = generateUseCaseMetadata(USE_CASES.locationSpoofing);

export default function LocationSpoofingPage() {
  return <LocationSpoofingUseCaseWrapped />;
}
