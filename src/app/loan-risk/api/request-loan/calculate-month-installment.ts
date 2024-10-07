export const LOAN_FEE_PERCENT = 0.15;

type Loan = {
  loanValue: number;
  loanDuration: number;
};

export function calculateMonthInstallment({ loanValue, loanDuration }: Loan) {
  const totalValue = loanValue + loanValue * LOAN_FEE_PERCENT;

  return totalValue / loanDuration;
}
