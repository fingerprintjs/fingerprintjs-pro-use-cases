import { ensureValidRequestIdAndVisitorId, getVisitorDataWithRequestId } from '../server';
import { checkResultType } from '../checkResult';
import {
  RuleCheck,
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../checks';
import { sendForbiddenResponse } from '../response';
import { NextApiRequest, NextApiResponse } from 'next';
import { CouponCodeString } from './database';

type ValidateCouponResult = {
  visitorId: string | null;
  couponCode: CouponCodeString | null;
};

export async function validateCouponRequest(
  req: NextApiRequest,
  res: NextApiResponse,
  additionalChecks: RuleCheck[] = [],
): Promise<ValidateCouponResult | void> {
  const result: { visitorId: string | null; couponCode: CouponCodeString | null } = {
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

        default:
          return sendForbiddenResponse(res, checkResult);
      }
    }
  }

  return result;
}
