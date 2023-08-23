// Defines db model for coupons.
import { sequelize } from '../server';
import { Op, Sequelize } from 'sequelize';

export const CouponCode = sequelize.define('coupon', {
  code: {
    type: Sequelize.STRING,
  },
});

export const CouponClaim = sequelize.define('coupon-claim', {
  visitorId: {
    type: Sequelize.STRING,
  },
  couponCode: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

async function initCoupons() {
  await Promise.all([CouponCode, CouponClaim].map((model) => model.sync({ force: false }))).catch(console.error);

  await CouponCode.findOrCreate({ where: { code: { [Op.eq]: 'Promo3000' } }, defaults: { code: 'Promo3000' } });
  await CouponCode.findOrCreate({ where: { code: { [Op.eq]: 'BlackFriday' } }, defaults: { code: 'BlackFriday' } });
}

await initCoupons();
