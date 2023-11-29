import { FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';
import { apiRequest } from '../api';
import { useMutation } from 'react-query';

function requestLoan({ fpData, body }: LoanRequest) {
  return apiRequest('/api/loan-risk/request-loan', fpData, body);
}

export const REQUEST_LOAN_MUTATION = 'REQUEST_LOAN_MUTATION';

type LoanRequest = {
  fpData: FingerprintJSPro.GetResult;
  body: { loanValue: number; monthlyIncome: number; loanDuration: number; firstName: string; lastName: string };
};

export function useRequestLoan() {
  return useMutation<any, unknown, LoanRequest, unknown>(REQUEST_LOAN_MUTATION, ({ fpData, body }) =>
    requestLoan({ fpData, body }),
  );
}
