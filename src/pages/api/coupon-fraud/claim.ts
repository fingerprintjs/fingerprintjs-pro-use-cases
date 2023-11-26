import { messageSeverity } from '../../../server/server';
import { Op } from 'sequelize';
import { couponEndpoint } from '../../../server/coupon-fraud/coupon-endpoint';
import { COUPON_CODES, CouponClaimDbModel, CouponCodeString } from '../../../server/coupon-fraud/database';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import { sendOkResponse } from '../../../server/response';
import { RuleCheck } from '../../../server/checks';

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
    return new CheckResult(
      'Provided coupon code does not exist.',
      messageSeverity.Error,
      checkResultType.CouponDoesNotExist,
    );
  }
};

const checkIfCouponWasClaimed: RuleCheck = async (visitorData, req, couponCode) => {
  const wasCouponClaimedByVisitor = await getVisitorClaim(visitorData.visitorId, couponCode);

  // Check if the visitor claimed this coupon before.
  if (wasCouponClaimedByVisitor) {
    return new CheckResult(
      'The visitor used this coupon before.',
      messageSeverity.Error,
      checkResultType.CouponAlreadyClaimed,
    );
  }
};

const checkIfClaimedAnotherCouponRecently: RuleCheck = async (visitorData) => {
  const visitorClaimedAnotherCouponRecently = await checkVisitorClaimedRecently(visitorData.visitorId);

  if (visitorClaimedAnotherCouponRecently) {
    return new CheckResult(
      'The visitor claimed another coupon recently.',
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

    const result = new CheckResult('Coupon claimed', messageSeverity.Success, checkResultType.Passed);

    return sendOkResponse(res, result);
  },
  [checkIfCouponExists, checkIfCouponWasClaimed, checkIfClaimedAnotherCouponRecently],
);
