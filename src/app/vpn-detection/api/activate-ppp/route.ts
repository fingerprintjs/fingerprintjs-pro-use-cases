import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { getRegionalDiscount } from '../../data/getDiscountByCountry';
import { env } from '../../../../env';
import { VPN_DETECTION_COPY } from '../../copy';
import { getIpLocation, getLocationName } from '../../../../shared/utils/locationUtils';

export type ActivateRegionalPricingPayload = {
  requestId: string;
  sealedResult?: string;
};

export type ActivateRegionalPricingResponse =
  | { severity: 'success'; message: string; data: { discount: number } }
  | {
      severity: 'warning' | 'error';
      message: string;
    };

export async function POST(req: Request): Promise<NextResponse<ActivateRegionalPricingResponse>> {
  const { requestId, sealedResult } = (await req.json()) as ActivateRegionalPricingPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    sealedResult,
    serverApiKey: env.SEALED_RESULTS_SERVER_API_KEY,
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  const location = getIpLocation(fingerprintResult.data);
  const locationName = getLocationName(location, false);
  const vpnDetection = fingerprintResult.data.products?.vpn?.data;

  if (!location?.country) {
    return NextResponse.json(
      {
        severity: 'error',
        message: 'Location could not be determined, please try a different browser or internet connection.',
      },
      { status: 403 },
    );
  }

  if (vpnDetection?.result === true) {
    let reason = '';
    if (vpnDetection.methods?.publicVPN) {
      reason = `Your IP address appears to be in ${locationName} but it's a known VPN IP address.`;
    }
    if (vpnDetection.methods?.timezoneMismatch && vpnDetection.originTimezone) {
      reason = `Your IP address appears to be in ${locationName}, but your timezone is ${vpnDetection.originTimezone}.`;
    }
    if (vpnDetection.methods?.auxiliaryMobile) {
      reason = `Your IP address appears to be in ${locationName}, but your phone is not.`;
    }
    return NextResponse.json(
      {
        severity: 'error',
        message: `It seems you are using a VPN. Please turn it off and use a regular local internet connection before activating regional pricing. ${reason}`,
      },
      { status: 403 },
    );
  }

  const discount = getRegionalDiscount(location.country.code);

  return NextResponse.json({
    severity: 'success',
    message: VPN_DETECTION_COPY.success({ discount, country: location.country.name }),
    data: { discount },
  });
}
