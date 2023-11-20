import { messageSeverity } from '../../../server/server';
import { Op } from 'sequelize';
import { couponEndpoint } from '../../../server/coupon-fraud/coupon-endpoint';
import { CouponClaim, CouponCode } from '../../../server/coupon-fraud/database';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import { sendOkResponse } from '../../../server/response';

async function checkVisitorClaimedRecently(visitorId) {
  const oneHourBefore = new Date();
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);

  return await CouponClaim.findOne({
    where: {
      visitorId,
      timestamp: {
        [Op.between]: [oneHourBefore, new Date()],
      },
    },
  });
}

async function getVisitorClaim(visitorId, couponCode) {
  return await CouponClaim.findOne({
    where: { visitorId, couponCode },
  });
}

/**
 * Checks if a coupon exists with the given coupon code.
 */
export async function checkCoupon(code) {
  return await CouponCode.findOne({
    where: {
      code: {
        [Op.eq]: code,
      },
    },
  });
}

/**
 * Claim coupon on behalf of the visitor.
 */
export async function claimCoupon(visitorId, couponCode) {
  const claim = await CouponClaim.create({
    couponCode,
    visitorId,
    timestamp: new Date(),
  });
  await claim.save();

  return claim;
}

async function checkIfCouponExists(visitorData, req, couponCode) {
  const coupon = await checkCoupon(couponCode);

  // Check if the coupon exists.
  if (!coupon) {
    return new CheckResult(
      'Provided coupon code does not exist.',
      messageSeverity.Error,
      checkResultType.CouponDoesNotExist,
    );
  }
}

async function checkIfCouponWasClaimed({ visitorId }, req, couponCode) {
  const wasCouponClaimedByVisitor = await getVisitorClaim(visitorId, couponCode);

  // Check if the visitor claimed this coupon before.
  if (wasCouponClaimedByVisitor) {
    return new CheckResult(
      'The visitor used this coupon before.',
      messageSeverity.Error,
      checkResultType.CouponAlreadyClaimed,
    );
  }
}

async function checkIfClaimedAnotherCouponRecently({ visitorId }) {
  const visitorClaimedAnotherCouponRecently = await checkVisitorClaimedRecently(visitorId);

  if (visitorClaimedAnotherCouponRecently) {
    return new CheckResult(
      'The visitor claimed another coupon recently.',
      messageSeverity.Error,
      checkResultType.AnotherCouponClaimedRecently,
    );
  }
}

export default couponEndpoint(
  async (req, res, { visitorId, couponCode }) => {
    await claimCoupon(visitorId, couponCode);

    const result = new CheckResult('Coupon claimed', messageSeverity.Success, checkResultType.Passed);

    return sendOkResponse(res, result);
  },
  [checkIfCouponExists, checkIfCouponWasClaimed, checkIfClaimedAnotherCouponRecently],
);
