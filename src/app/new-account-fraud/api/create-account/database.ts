import { sequelize } from '../../../../server/sequelize';
import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';

/**
 * Defines the attributes persisted by the demo for an account. Importantly, the visitor ID
 * is persisted in the account record to link it with the username.
 */
interface AccountAttributes
  extends Model<InferAttributes<AccountAttributes>, InferCreationAttributes<AccountAttributes>> {
  visitorId: string;
  passwordHash: string;
  username: string;
  timestamp: Date;
}

export const AccountDbModel = sequelize.define<AccountAttributes>('account', {
  visitorId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

AccountDbModel.sync({ force: false });

export type Account = Attributes<AccountAttributes>;
