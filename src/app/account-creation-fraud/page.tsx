import { USE_CASES } from '../../client/content';
import { generateUseCaseMetadata } from '../../client/seo';
import { AccountCreationFraudUseCase } from './AccountCreationFraud';

export const metadata = generateUseCaseMetadata(USE_CASES.accountCreationFraud);

export default function AccountCreationFraudPage() {
  return <AccountCreationFraudUseCase />;
}
