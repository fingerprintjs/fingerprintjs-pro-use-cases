export class CheckResult {
  /**
   * @param {string} message
   * @param {import('./server').Severity} severity
   * @param {string} type
   * @param {Object | undefined} data
   * */
  constructor(message, severity, type, data = undefined) {
    /** @type {string} */
    this.message = message;
    /** @type {import('./server').Severity} */
    this.severity = severity;
    /** @type {string} */
    this.type = type;
    /** @type {Object | undefined} */
    this.data = data;
  }

  toJsonResponse() {
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
  TooManyLoginAttempts: 'TooManyLoginAttempts',
  ForeignOrigin: 'ForeignOrigin',
  Challenged: 'Challenged',
  IpMismatch: 'IpMismatch',
  Passed: 'Passed',
  MaliciousBotDetected: 'MaliciousBotDetected',
  GoodBotDetected: 'GoodBotDetected',
  ServerError: 'ServerError',
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

  // Coupon fraud specific checks
  CouponDoesNotExist: 'CouponDoesNotExist',
  CouponAlreadyClaimed: 'CouponAlreadyClaimed',
  AnotherCouponClaimedRecently: 'AnotherCouponClaimedRecently',
});
