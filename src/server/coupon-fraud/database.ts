import { sequelize } from '../server';
import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

export const COUPON_CODES = ['Promo3000', 'BlackFriday'] as const;

export type CouponCodeString = (typeof COUPON_CODES)[number];

interface CouponClaimAttributes
  extends Model<InferAttributes<CouponClaimAttributes>, InferCreationAttributes<CouponClaimAttributes>> {
  visitorId: string;
  couponCode: CouponCodeString;
  timestamp: Date;
}

export const CouponClaimDbModel = sequelize.define<CouponClaimAttributes>('coupon-claim', {
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

CouponClaimDbModel.sync({ force: false });

export type CouponClaim = Attributes<CouponClaimAttributes>;
