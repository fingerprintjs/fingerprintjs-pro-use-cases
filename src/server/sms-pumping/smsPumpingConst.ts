import { TEST_BUILD } from '../../envShared';
import { ONE_SECOND_MS } from '../../shared/timeUtils';
import { pluralize } from '../../shared/utils';

export const TEST_PHONE_NUMBER = '+1234567890';

// Use smaller timeouts for test builds to speed up e2e tests

export const SMS_ATTEMPT_TIMEOUT_MAP: Record<number, { timeout: number }> = TEST_BUILD
  ? {
      1: { timeout: 5 * ONE_SECOND_MS },
      2: { timeout: 5 * ONE_SECOND_MS },
    }
  : {
      1: { timeout: 30 * ONE_SECOND_MS },
      2: { timeout: 60 * ONE_SECOND_MS },
    };

export const MAX_SMS_ATTEMPTS = Object.keys(SMS_ATTEMPT_TIMEOUT_MAP).length + 1;
export const REAL_SMS_LIMIT_PER_VISITOR = 12;

export const SMS_FRAUD_COPY = {
  messageSent: ({ phone, messagesLeft }: { phone: string; messagesLeft: number }) =>
    `We sent a verification SMS message to ${phone}. You have ${pluralize(messagesLeft, 'message')} left.`,
  needToWait: ({ requestsToday }: { requestsToday: number }) =>
    `You have already sent ${pluralize(requestsToday, 'verification code')}.`,
  blockedForToday: ({ requestsToday }: { requestsToday: number }) =>
    `You have already sent ${pluralize(requestsToday, 'verification code')} today. Please try again tomorrow or contact our support team.`,
  accountCreated: 'The code is correct, welcome to your new account.',
  incorrectCode: 'The code is incorrect, please try again.',
} as const;
