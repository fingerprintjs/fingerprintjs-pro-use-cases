import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult } from '../../../../server/checks';
import { getRegionalDiscount } from '../../data/getDiscountByCountry';
import { VPN_DETECTION_COPY } from '../../copy';
import { getIpLocation, getLocationName } from '../../../../utils/locationUtils';

export type ActivateRegionalPricingPayload = {
  eventId: string;
  sealedResult?: string;
};

export type ActivateRegionalPricingResponse =
  | { severity: 'success'; message: string; data: { discount: number } }
  | {
      severity: 'warning' | 'error';
      message: string;
    };

export async function POST(req: Request): Promise<NextResponse<ActivateRegionalPricingResponse>> {
  const { eventId } = (await req.json()) as ActivateRegionalPricingPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  // TODO Restore sealed results usage when V4 support is added to Node SDK
  const fingerprintResult = await getAndValidateFingerprintResult({
    eventId,
    req,
  });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  const location = getIpLocation(fingerprintResult.data);
  const locationName = getLocationName(location, false);
  const vpnMethods = fingerprintResult.data.vpn_methods;
  const isVpn = fingerprintResult.data.vpn === true;

  if (!location?.country_code) {
    return NextResponse.json(
      {
        severity: 'error',
        message: 'Location could not be determined, please try a different browser or internet connection.',
      },
      { status: 403 },
    );
  }

  const discount = getRegionalDiscount(location.country_code);

  /**
   * Handle cases like Apple [iCloud Private Relay](https://support.apple.com/en-us/102602)
   * that trigger an OS mismatch, but the user [has not changed their location](https://discussions.apple.com/thread/254619843),
   * (timezone mismatch is false)
   * So we still return a successful response while acknowledging the result.
   */
  if (vpnMethods?.os_mismatch === true && vpnMethods.timezone_mismatch === false) {
    const privateRelayNote =
      'It looks like you are using an IP anonymizing service (for example, Apple Private relay) without changing your location. You still get the discount!';
    return NextResponse.json(
      {
        severity: 'success',
        data: { discount },
        message: `${VPN_DETECTION_COPY.success({ discount, country: location.country_name ?? 'your country' })} ${privateRelayNote}`,
      },
      { status: 200 },
    );
  }

  if (isVpn) {
    let reason = '';
    if (vpnMethods?.public_vpn) {
      reason = `Your IP address appears to be in ${locationName} but it's a known VPN IP address.`;
    }
    if (vpnMethods?.timezone_mismatch && fingerprintResult.data.vpn_origin_timezone) {
      reason = `Your IP address appears to be in ${locationName}, but your timezone is ${fingerprintResult.data.vpn_origin_timezone}.`;
    }
    if (vpnMethods?.auxiliary_mobile) {
      reason = `Your IP address appears to be in ${locationName}, but your phone is not.`;
    }
    return NextResponse.json(
      {
        severity: 'error',
        message: `It looks like you are using a VPN. Please turn it off and use a regular local internet connection before activating regional pricing. ${reason}`,
      },
      { status: 403 },
    );
  }

  return NextResponse.json({
    severity: 'success',
    message: VPN_DETECTION_COPY.success({ discount, country: location.country_name ?? 'your country' }),
    data: { discount },
  });
}
