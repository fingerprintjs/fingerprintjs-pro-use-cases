import { Severity } from './checks';

export type CheckResultObject<Data = any> = {
  message: string;
  severity: Severity;
  type: string;
  data?: Data;
};

export class CheckResult {
  message: string;
  severity: Severity;
  type: string;
  data?: any;

  constructor(message: string, severity: Severity, type: string, data?: Record<string, any>) {
    this.message = message;
    this.severity = severity;
    this.type = type;
    this.data = data;
  }

  toJsonResponse(): CheckResultObject {
    return {
      message: this.message,
      severity: this.severity,
      type: this.type,
      data: this.data,
    };
  }
}

export const checkResultType = Object.freeze({
  LowConfidenceScore: 'LowConfidenceScore',
  RequestIdMismatch: 'RequestIdMismatch',
  OldTimestamp: 'OldTimestamp',
  ForeignOrigin: 'ForeignOrigin',
  Challenged: 'Challenged',
  IpMismatch: 'IpMismatch',
  Passed: 'Passed',
  MaliciousBotDetected: 'MaliciousBotDetected',
  GoodBotDetected: 'GoodBotDetected',
  ServerError: 'ServerError',
  // Payment specific checks.
  TooManyChargebacks: 'TooManyChargebacks',
  TooManyUnsuccessfulPayments: 'TooManyUnsuccessfulPayments',
  PaidWithStolenCard: 'PaidWithStolenCard',
  IncorrectCardDetails: 'IncorrectCardDetails',

  // Loan risk specific checks.
  PossibleLoanFraud: 'PossibleLoanFraud',

  // Paywall specific checks.
  ArticleViewLimitExceeded: 'ArticleViewLimitExceeded',
});
