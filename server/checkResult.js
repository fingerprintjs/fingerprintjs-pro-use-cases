export class CheckResult {
  constructor(message, messageSeverity, type) {
    this.message = message;
    this.messageSeverity = messageSeverity;
    this.type = type;
  }
}

export const checkResultType = Object.freeze({
  LowConfidenceScore: 'LowConfidenceScore',
  RequestIdMissmatch: 'RequestIdMissmatch',
  OldTimestamp: 'OldTimestamp',
  TooManyLoginAttempts: 'TooManyLoginAttempts',
  ForeignOrigin: 'ForeignOrigin',
  Challenged: 'Challenged',
  IpMismatch: 'IpMismatch',
  Passed: 'Passed',
  // Login specific checks.
  IncorrectCredentials: 'IncorrectCredentials',
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
