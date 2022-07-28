import { apiRequest } from './api';
import { useMutation } from 'react-query';

function requestLoan({ loanValue, monthlyIncome, loanDuration, fpData }) {
  return apiRequest('/api/loan-risk/request-loan', fpData, {
    loanDuration,
    monthlyIncome,
    loanValue,
  });
}

export const REQUEST_LOAN_MUTATION = 'REQUEST_LOAN_MUTATION';

export function useRequestLoan() {
  return useMutation(REQUEST_LOAN_MUTATION, ({ loanValue, monthlyIncome, loanDuration, fpData }) =>
    requestLoan({ loanValue, monthlyIncome, loanDuration, fpData })
  );
}
