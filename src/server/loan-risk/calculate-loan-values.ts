import { calculateMonthInstallment } from '../../shared/loan-risk/calculate-month-installment';

/**
 * Required minimal income.
 * If $MONTHLY_INCOME - $LOAN_AMOUNT < $MIN_INCOME, then the loan won't be approved.
 * */
export const MIN_INCOME_PER_MONTH = 500;

type LoanAsk = {
  loanValue: number;
  monthlyIncome: number;
  loanDuration: number;
};

export function calculateLoanValues({ loanValue, monthlyIncome, loanDuration }: LoanAsk) {
  const monthInstallment = calculateMonthInstallment({ loanValue, loanDuration });
  const remainingIncome = monthlyIncome - monthInstallment;

  const approved = remainingIncome >= MIN_INCOME_PER_MONTH;

  return {
    monthInstallment,
    remainingIncome,
    approved,
  };
}
