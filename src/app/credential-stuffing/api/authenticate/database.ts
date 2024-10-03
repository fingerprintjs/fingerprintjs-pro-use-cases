import { Attributes, DataTypes, InferAttributes, InferCreationAttributes, Model } from 'sequelize';
import { sequelize } from '../../../../server/sequelize';

export type LoginAttemptResult =
  | 'RequestIdValidationFailed'
  | 'TooManyLoginAttempts'
  | 'IncorrectCredentials'
  | 'UnknownBrowserEnforceMFA'
  | 'Success';

interface LoginAttemptAttributes
  extends Model<InferAttributes<LoginAttemptAttributes>, InferCreationAttributes<LoginAttemptAttributes>> {
  visitorId: string;
  username: string;
  loginAttemptResult: LoginAttemptResult;
  timestamp: Date;
}

// Defines db model for login attempt.
export const LoginAttemptDbModel = sequelize.define<LoginAttemptAttributes>('login-attempt', {
  visitorId: {
    type: DataTypes.STRING,
  },
  username: {
    type: DataTypes.STRING,
  },
  loginAttemptResult: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

LoginAttemptDbModel.sync({ force: false });

export type LoginAttempt = Attributes<LoginAttemptAttributes>;
