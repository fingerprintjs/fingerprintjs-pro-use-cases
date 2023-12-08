import { messageSeverity } from '../../../server/server';
import { Op } from 'sequelize';
import { couponEndpoint } from '../../../server/coupon-fraud/coupon-endpoint';
import { COUPON_CODES, CouponClaimDbModel, CouponCodeString } from '../../../server/coupon-fraud/database';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import { sendOkResponse } from '../../../server/response';
import { RuleCheck } from '../../../server/checks';

export const COUPON_FRAUD_COPY = {
  doesNotExist: 'Provided coupon code does not exist.',
  usedBefore: 'The visitor used this coupon before.',
  usedAnotherCouponRecently: 'The visitor claimed another coupon recently.',
  success: 'Coupon claimed',
} as const;

async function checkVisitorClaimedRecently(visitorId: string) {
  const oneHourBefore = new Date();
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);

  return await CouponClaimDbModel.findOne({
    where: {
      visitorId,
      timestamp: {
        [Op.between]: [oneHourBefore, new Date()],
      },
    },
  });
}

async function getVisitorClaim(visitorId: string, couponCode: string) {
  return await CouponClaimDbModel.findOne({
    where: { visitorId, couponCode },
  });
}

/**
 * Checks if a coupon exists with the given coupon code.
 */
export function checkCoupon(code: CouponCodeString) {
  return COUPON_CODES.includes(code);
}

/**
 * Claim coupon on behalf of the visitor.
 */
export async function claimCoupon(visitorId: string, couponCode: CouponCodeString) {
  const claim = await CouponClaimDbModel.create({
    couponCode,
    visitorId,
    timestamp: new Date(),
  });
  await claim.save();

  return claim;
}

const checkIfCouponExists: RuleCheck = async (_visitorData, _req, couponCode: CouponCodeString) => {
  const coupon = await checkCoupon(couponCode);

  // Check if the coupon exists.
  if (!coupon) {
    return new CheckResult(COUPON_FRAUD_COPY.doesNotExist, messageSeverity.Error, checkResultType.CouponDoesNotExist);
  }
};

const checkIfCouponWasClaimed: RuleCheck = async (eventResponse, _req, couponCode) => {
  const visitorId = eventResponse.products?.identification?.data?.visitorId;
  if (!visitorId) {
    return new CheckResult('Could not find visitor ID', messageSeverity.Error, checkResultType.RequestIdMismatch);
  }

  const wasCouponClaimedByVisitor = await getVisitorClaim(visitorId, couponCode);

  // Check if the visitor claimed this coupon before.
  if (wasCouponClaimedByVisitor) {
    return new CheckResult(COUPON_FRAUD_COPY.usedBefore, messageSeverity.Error, checkResultType.CouponAlreadyClaimed);
  }
};

const checkIfClaimedAnotherCouponRecently: RuleCheck = async (eventData) => {
  const visitorId = eventData.products?.identification?.data?.visitorId;
  if (!visitorId) {
    return new CheckResult('Could not find visitor ID', messageSeverity.Error, checkResultType.RequestIdMismatch);
  }

  const visitorClaimedAnotherCouponRecently = await checkVisitorClaimedRecently(visitorId);

  if (visitorClaimedAnotherCouponRecently) {
    return new CheckResult(
      COUPON_FRAUD_COPY.usedAnotherCouponRecently,
      messageSeverity.Error,
      checkResultType.AnotherCouponClaimedRecently,
    );
  }
};

export default couponEndpoint(
  async (req, res, validateCouponResult) => {
    if (validateCouponResult && validateCouponResult.visitorId && validateCouponResult.couponCode) {
      await claimCoupon(validateCouponResult.visitorId, validateCouponResult.couponCode);
    }

    const result = new CheckResult(COUPON_FRAUD_COPY.success, messageSeverity.Success, checkResultType.Passed);

    return sendOkResponse(res, result);
  },
  [checkIfCouponExists, checkIfCouponWasClaimed, checkIfClaimedAnotherCouponRecently],
);
