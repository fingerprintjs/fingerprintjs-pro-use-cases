export const LOAN_FEE_PERCENT = 0.15;

export function calculateMonthInstallment({ loanValue, loanDuration }) {
  const totalValue = loanValue + loanValue * LOAN_FEE_PERCENT;

  return totalValue / loanDuration;
}
