import { ensureValidRequestIdAndVisitorId, getForbiddenResponse, getVisitorData } from '../server';
import { checkResultType } from '../checkResult';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../checks';

export async function validateCouponRequest(req, res) {
  const result = {
    visitorId: null,
    couponCode: null,
  };

  const { requestId, visitorId, couponCode } = JSON.parse(req.body);

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return result;
  }

  const checks = [
    checkFreshIdentificationRequest,
    checkConfidenceScore,
    checkIpAddressIntegrity,
    checkOriginsIntegrity,
  ];

  const visitorData = await getVisitorData(visitorId, requestId);

  result.visitorId = visitorData.visitorId;
  result.couponCode = couponCode;

  for (const check of checks) {
    const checkResult = await check(visitorData, req);

    if (checkResult) {
      switch (checkResult.type) {
        case checkResultType.Passed:
          continue;
        case checkResultType.Challenged:
          getForbiddenResponse(res, checkResult.message, 'error');
          break;

        default:
          return result;
      }
    }
  }

  return result;
}
