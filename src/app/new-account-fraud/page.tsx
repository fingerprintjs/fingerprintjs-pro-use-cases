import { USE_CASES } from '../../client/content';
import { generateUseCaseMetadata } from '../../client/seo';
import { NewAccountFraud } from './NewAccountFraud';

export const metadata = generateUseCaseMetadata(USE_CASES.newAccountFraud);

export default function NewAccountFraudPage() {
  return <NewAccountFraud />;
}
