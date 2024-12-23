import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../../server/sequelize';

interface AccountAttributes
  extends Model<InferAttributes<AccountAttributes>, InferCreationAttributes<AccountAttributes>> {
  passwordHash: string;
  username: string;
}

// Defines db model for login attempt.
export const UserDbModel = sequelize.define<AccountAttributes>('account_sharing_user', {
  passwordHash: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
});

UserDbModel.sync({ force: false });

export type User = Attributes<AccountAttributes>;
