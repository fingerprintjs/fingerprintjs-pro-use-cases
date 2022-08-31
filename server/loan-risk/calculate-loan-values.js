import { calculateMonthInstallment } from '../../shared/loan-risk/calculate-month-installment';

/**
 * Required minimal income.
 * If $MONTHLY_INCOME - $LOAN_AMOUNT < $MIN_INCOME, then the loan won't be approved.
 * */
export const MIN_INCOME_PER_MONTH = 500;

/**
 * Provides simplified calculations for a loan, and decides whether it will be approved or not.
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
