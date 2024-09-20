import { Model, InferAttributes, InferCreationAttributes, DataTypes, Attributes } from 'sequelize';
import { sequelize } from '../../../../server/server';

interface PaymentAttemptAttributes
  extends Model<InferAttributes<PaymentAttemptAttributes>, InferCreationAttributes<PaymentAttemptAttributes>> {
  visitorId: string;
  isChargebacked: boolean;
  usedStolenCard: boolean;
  checkResult: string;
  timestamp: number;
}

export const PaymentAttemptDbModel = sequelize.define<PaymentAttemptAttributes>('payment-attempt', {
  visitorId: {
    type: DataTypes.STRING,
  },
  isChargebacked: {
    type: DataTypes.BOOLEAN,
  },
  usedStolenCard: {
    type: DataTypes.BOOLEAN,
  },
  checkResult: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

export type PaymentAttempt = Attributes<PaymentAttemptAttributes>;

PaymentAttemptDbModel.sync({ force: false });
