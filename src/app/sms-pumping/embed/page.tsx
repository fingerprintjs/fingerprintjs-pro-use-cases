import { USE_CASES } from '../../../client/components/common/content';
import { generateUseCaseMetadata } from '../../../client/components/common/seo';
import { SmsPumpingUseCase } from '../SmsPumping';

export const metadata = generateUseCaseMetadata(USE_CASES.smsPumping);

export default function SmsPumping() {
  return <SmsPumpingUseCase />;
}
