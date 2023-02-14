import { ensureValidRequestIdAndVisitorId, getVisitorDataWithRequestId } from '../server';
import { checkResultType } from '../checkResult';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../checks';
import { sendForbiddenResponse } from '../response';

export async function validateCouponRequest(req, res, additionalChecks = []) {
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
    ...additionalChecks,
  ];

  const visitorData = await getVisitorDataWithRequestId(visitorId, requestId);

  result.visitorId = visitorData.visitorId;
  result.couponCode = couponCode;

  for (const check of checks) {
    const checkResult = await check(visitorData, req, couponCode);

    if (checkResult) {
      switch (checkResult.type) {
        case checkResultType.Passed:
          continue;
        case checkResultType.Challenged:
          return sendForbiddenResponse(res, checkResult);

        default:
          return result;
      }
    }
  }

  return result;
}
