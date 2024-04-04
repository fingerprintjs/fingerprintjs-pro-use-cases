import { pluralize } from '../../shared/utils';

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
