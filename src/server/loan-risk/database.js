import { sequelize } from '../server';
import * as Sequelize from 'sequelize';

export const LoanRequest = sequelize.define('loan_request', {
  visitorId: {
    type: Sequelize.STRING,
  },
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
  monthlyIncome: {
    type: Sequelize.DOUBLE,
  },
  loanDuration: {
    type: Sequelize.INTEGER,
  },
  loanValue: {
    type: Sequelize.DOUBLE,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

LoanRequest.sync({ force: false });
