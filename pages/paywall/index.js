import { UseCaseWrapper } from '../../components/use-case-wrapper';
import { useVisitorData } from '../../shared/client/use-visitor-data';

export default function LoanRisk() {
  const visitorDataQuery = useVisitorData({
    // Don't invoke query on mount
    enabled: false,
  });

  return (
    <UseCaseWrapper title="Paywall" description="This page demonstrates paywall implementation using Fingerprint PRO.">
      Hello world
    </UseCaseWrapper>
  );
}
