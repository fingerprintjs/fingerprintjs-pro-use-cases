import { USE_CASES } from '../../../client/components/common/content';
import { generateUseCaseMetadata } from '../../../client/components/common/seo';
import { PaymentFraud } from '../PaymentFraud';

export const metadata = generateUseCaseMetadata(USE_CASES.paymentFraud);

export default function PaymentFraudPage() {
  return <PaymentFraud />;
}
