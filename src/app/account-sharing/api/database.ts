import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../../server/sequelize';

/**
 * Users
 */
interface AccountAttributes
  extends Model<InferAttributes<AccountAttributes>, InferCreationAttributes<AccountAttributes>> {
  passwordHash: string;
  username: string;
  createdWithVisitorId: string;
}

export const UserDbModel = sequelize.define<AccountAttributes>('account_sharing_user', {
  passwordHash: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  createdWithVisitorId: {
    type: DataTypes.STRING,
  },
});

UserDbModel.sync({ force: false });

export type User = Attributes<AccountAttributes>;

/**
 * Sessions (currently logged-in devices per user)
 */
interface SessionAttributes
  extends Model<InferAttributes<SessionAttributes>, InferCreationAttributes<SessionAttributes>> {
  visitorId: string;
  username: string;
  deviceName: string;
  deviceLocation: string;
}

export const SessionDbModel = sequelize.define<SessionAttributes>('account_sharing_session', {
  visitorId: {
    type: DataTypes.STRING,
  },
  deviceName: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  deviceLocation: {
    type: DataTypes.STRING,
  },
});

SessionDbModel.sync({ force: false });

export type Session = Attributes<SessionAttributes>;
