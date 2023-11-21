import { sequelize } from '../server';
import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export const COUPON_CODES = ['Promo3000', 'BlackFriday'];

interface CouponClaimAttributes
  extends Model<InferAttributes<CouponClaimAttributes>, InferCreationAttributes<CouponClaimAttributes>> {
  visitorId: string;
  couponCode: string;
  timestamp: Date;
}

export const CouponClaim = sequelize.define<CouponClaimAttributes>('coupon-claim', {
  visitorId: {
    type: DataTypes.STRING,
  },
  couponCode: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

CouponClaim.sync({ force: false });

export type CouponClaim = Attributes<CouponClaimAttributes>;
