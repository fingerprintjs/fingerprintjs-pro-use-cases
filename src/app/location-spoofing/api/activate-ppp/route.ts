import { Severity, getAndValidateFingerprintResult } from '../../../../server/checks';

export type ActivateRegionalPricingPayload = {
  requestId: string;
  sealedResult?: string;
};

export type ActivateRegionalPricingResponse = {
  severity: Severity;
  message: string;
  data: {
    discount: number;
  };
};

export async function POST(request: Request) {
  const { requestId } = (await request.json()) as ActivateRegionalPricingPayload;

  const fingerprintResult = await getAndValidateFingerprintResult(requestId, request);

  return Response.json({ fingerprintResult });
}
