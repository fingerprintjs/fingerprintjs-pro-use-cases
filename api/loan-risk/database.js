import { sequelize } from '../../shared/server';
import * as Sequelize from 'sequelize';

export const LoanRequest = sequelize.define('loan_request', {
  visitorId: {
    type: Sequelize.STRING,
  },
  monthIncome: {
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

export async function initLoanRisk() {
  await LoanRequest.sync({ force: false });
}
