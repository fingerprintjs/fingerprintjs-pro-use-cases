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
 * Checks if given visitor has already used a coupon code.
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
 * Saves coupon code into database. If it already exists, we update its timestamp.
 */
export async function saveCouponCode(visitorId, couponCode) {
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

  // Check if the coupon exists
  if (!coupon) {
    return getForbiddenReponse(res, 'Coupon code not exists', 'error');
  }

  const claimed = await getVisitorClaim(visitorId, couponCode);

  // Check if the visitor claimed this coupon before
  if (claimed) {
    return getForbiddenReponse(res, 'Visitor used this coupon before', 'error');
  }

  const recentClaim = await checkVisitorClaimedRecently(visitorId);

  // Check if the visitor claimed a coupon recently
  if (recentClaim) {
    return getForbiddenReponse(res, 'Visitor claimed another coupon recently', 'error');
  }

  await saveCouponCode(visitorId, couponCode);

  return getOkReponse(res, `Coupon claimed, you get 119 USD discount!`, 'success');
});
