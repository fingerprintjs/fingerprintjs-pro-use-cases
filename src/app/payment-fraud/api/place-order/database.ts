import { Model, InferAttributes, InferCreationAttributes, DataTypes, Attributes } from 'sequelize';
import { sequelize } from '../../../../server/server';

interface PaymentAttemptAttributes
  extends Model<InferAttributes<PaymentAttemptAttributes>, InferCreationAttributes<PaymentAttemptAttributes>> {
  visitorId: string;
  filedChargeback: boolean;
  usingStolenCard: boolean;
  wasSuccessful: boolean;
  timestamp: number;
}

export const PaymentAttemptDbModel = sequelize.define<PaymentAttemptAttributes>('payment-attempt', {
  visitorId: {
    type: DataTypes.STRING,
  },
  filedChargeback: {
    type: DataTypes.BOOLEAN,
  },
  usingStolenCard: {
    type: DataTypes.BOOLEAN,
  },
  wasSuccessful: {
    type: DataTypes.BOOLEAN,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

export type PaymentAttempt = Attributes<PaymentAttemptAttributes>;
export type PaymentAttemptData = Omit<PaymentAttempt, 'timestamp'>;

PaymentAttemptDbModel.sync({ force: false });
