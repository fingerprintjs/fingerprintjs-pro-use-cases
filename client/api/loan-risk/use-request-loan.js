import { apiRequest } from '../api';
import { useMutation } from 'react-query';

function requestLoan({ fpData, body }) {
  return apiRequest('/api/loan-risk/request-loan', fpData, body);
}

export const REQUEST_LOAN_MUTATION = 'REQUEST_LOAN_MUTATION';

export function useRequestLoan() {
  return useMutation(REQUEST_LOAN_MUTATION, ({ fpData, body }) => requestLoan({ fpData, body }));
}
