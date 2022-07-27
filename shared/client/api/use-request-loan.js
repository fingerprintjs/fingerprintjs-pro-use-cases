import { apiRequest } from './api';
import { useMutation } from 'react-query';

function requestLoan({ loanValue, monthIncome, loanDuration, fpData }) {
  return apiRequest('/api/loan-risk/request-loan', fpData, {
    loanDuration,
    monthIncome,
    loanValue,
  });
}

export const REQUEST_LOAN_MUTATION = 'REQUEST_LOAN_MUTATION';

export function useRequestLoan() {
  return useMutation(REQUEST_LOAN_MUTATION, ({ loanValue, monthIncome, loanDuration, fpData }) =>
    requestLoan({ loanValue, monthIncome, loanDuration, fpData })
  );
}
