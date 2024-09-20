import { USE_CASES } from '../../client/components/common/content';
import { generateUseCaseMetadata } from '../../client/components/common/seo';
import { LoanRisk } from './LoanRisk';

export const metadata = generateUseCaseMetadata(USE_CASES.loanRisk);

export default function LoanRiskPage() {
  return <LoanRisk />;
}
