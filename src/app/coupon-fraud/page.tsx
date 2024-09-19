import { USE_CASES } from '../../client/components/common/content';
import { generateUseCaseMetadata } from '../../client/components/common/seo';
import { CouponFraudUseCase } from './CouponFraud';

export const metadata = generateUseCaseMetadata(USE_CASES.couponFraud);

export default function CoupounFraudPage() {
  return <CouponFraudUseCase />;
}
