import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../../server/server';

interface SmsVerificationAttributes
  extends Model<InferAttributes<SmsVerificationAttributes>, InferCreationAttributes<SmsVerificationAttributes>> {
  visitorId: string;
  phoneNumberHash: string;
  email: string;
  timestamp: Date;
  code: number;
}

export const SmsVerificationDatabaseModel = sequelize.define<SmsVerificationAttributes>('sms-verification', {
  visitorId: {
    type: DataTypes.STRING,
  },
  phoneNumberHash: {
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

SmsVerificationDatabaseModel.sync({ force: false });

export type SmsVerification = Attributes<SmsVerificationAttributes>;

interface RealSmsPerVisitorAttributes
  extends Model<InferAttributes<RealSmsPerVisitorAttributes>, InferCreationAttributes<RealSmsPerVisitorAttributes>> {
  visitorId: string;
  realMessagesCount: number;
}

export const RealSmsPerVisitorModel = sequelize.define<RealSmsPerVisitorAttributes>('real-sms-per-visitor', {
  visitorId: {
    type: DataTypes.STRING,
  },
  realMessagesCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

RealSmsPerVisitorModel.sync({ force: false });

export type RealSmsPerVisitor = Attributes<RealSmsPerVisitorAttributes>;
