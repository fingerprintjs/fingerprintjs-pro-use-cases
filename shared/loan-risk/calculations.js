import { LOAN_FEE_PERCENT } from './constants';

/**
 * Required minimal income.
 * If $MONTH_INCOME - $LOAN_AMOUNT < $MIN_INCOME, then the loan won't be approved.
 * */
export const MIN_INCOME_PER_MONTH = 500;

export function calculateMonthInstallment({ loanValue, loanDuration }) {
  const totalValue = loanValue + loanValue * LOAN_FEE_PERCENT;

  return totalValue / loanDuration;
}

/**
 * Provides simplified calculations for loan, and decides whether it will be approved or not.
 * */
export function calculateLoanValues({ loanValue, monthlyIncome, loanDuration }) {
  const monthInstallment = calculateMonthInstallment({ loanValue, loanDuration });
  const remainingIncome = monthlyIncome - monthInstallment;

  const approved = remainingIncome >= MIN_INCOME_PER_MONTH;

  return {
    monthInstallment,
    remainingIncome,
    approved,
  };
}
