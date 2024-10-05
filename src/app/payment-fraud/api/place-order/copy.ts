export const PAYMENT_FRAUD_COPY = {
  stolenCard: 'According to our records, you paid with a stolen card. We did not process the payment.',
  tooManyUnsuccessfulPayments:
    'You placed more than 3 unsuccessful payment attempts during the last 365 days. This payment attempt was not performed.',
  previousChargeback: 'You performed more than 1 chargeback during the last 1 year, we did not perform the payment.',
  successfulPayment: 'Thank you for your payment. Everything is OK.',
  incorrectCardDetails: 'Incorrect card details, try again.',
} as const;
