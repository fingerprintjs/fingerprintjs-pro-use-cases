import { sequelize } from '../server';
import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

interface SmsVerificationAttributes
  extends Model<InferAttributes<SmsVerificationAttributes>, InferCreationAttributes<SmsVerificationAttributes>> {
  visitorId: string;
  phone: string;
  email: string;
  timestamp: Date;
  code: number;
}

export const SmsVerificationModel = sequelize.define<SmsVerificationAttributes>('sms-verification', {
  visitorId: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
  code: {
    type: DataTypes.INTEGER,
  },
});

SmsVerificationModel.sync({ force: false });

export type SmsVerification = Attributes<SmsVerificationAttributes>;
