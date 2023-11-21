import { Model, InferAttributes, InferCreationAttributes, DataTypes, Attributes } from 'sequelize';
import { sequelize } from '../server';

interface LoanRequestAttributes
  extends Model<InferAttributes<LoanRequestAttributes>, InferCreationAttributes<LoanRequestAttributes>> {
  visitorId: string;
  firstName: string;
  lastName: string;
  monthlyIncome: number;
  loanDuration: number;
  loanValue: number;
  timestamp: Date;
}

export const LoanRequestDbModel = sequelize.define<LoanRequestAttributes>('loan_request', {
  visitorId: {
    type: DataTypes.STRING,
  },
  firstName: {
    type: DataTypes.STRING,
  },
  lastName: {
    type: DataTypes.STRING,
  },
  monthlyIncome: {
    type: DataTypes.DOUBLE,
  },
  loanDuration: {
    type: DataTypes.INTEGER,
  },
  loanValue: {
    type: DataTypes.DOUBLE,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

LoanRequestDbModel.sync({ force: false });

export type LoanRequest = Attributes<LoanRequestAttributes>;
