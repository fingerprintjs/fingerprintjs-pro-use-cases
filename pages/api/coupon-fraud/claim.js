import { getForbiddenReponse, getOkReponse } from '../../../server/server';
import { Op } from 'sequelize';
import { couponEndpoint } from '../../../server/coupon-fraud/coupon-endpoint';
import { CouponClaim, CouponCode } from '../../../server/coupon-fraud/database';

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

export default couponEndpoint(async (req, res, { visitorId, couponCode }) => {
  const coupon = await checkCoupon(couponCode);

  // Check if the coupon exists.
  if (!coupon) {
    return getForbiddenReponse(res, 'Provided coupon code does not exist.', 'error');
  }

  const wasCouponClaimedByVisitor = await getVisitorClaim(visitorId, couponCode);

  // Check if the visitor claimed this coupon before.
  if (wasCouponClaimedByVisitor) {
    return getForbiddenReponse(res, 'The visitor used this coupon before.', 'error');
  }

  const visitorClaimedAnotherCouponRecently = await checkVisitorClaimedRecently(visitorId);

  if (visitorClaimedAnotherCouponRecently) {
    return getForbiddenReponse(res, 'The visitor claimed another coupon recently.\n', 'error');
  }

  await claimCoupon(visitorId, couponCode);

  return getOkReponse(res, `Coupon claimed you get a 119 USD discount!`, 'success');
});
