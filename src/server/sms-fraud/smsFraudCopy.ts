import { pluralize } from '../../shared/utils';

export const SMS_FRAUD_COPY = {
  messageSent: (phone: string, left: number) =>
    `We sent a verification SMS message to ${phone}. You have ${pluralize(left, 'message')} left.`,
  needToWait: (requestsToday: number) => `You have already sent ${pluralize(requestsToday, 'verification code')}.`,
  accountCreated: 'The code is correct, welcome to your new account.',
  incorrectCode: 'The code is incorrect, please try again.',
} as const;
