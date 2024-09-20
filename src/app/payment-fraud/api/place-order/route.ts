import { NextResponse } from 'next/server';
import { getAndValidateFingerprintResult, Severity } from '../../../../server/checks';
import { PaymentAttemptDbModel } from './database';
import { PAYMENT_FRAUD_COPY } from './copy';
import { Op } from 'sequelize';
import { checkResultType } from '../../../../server/checkResult';
import { sequelize } from '../../../../server/server';

type Card = {
  number: string;
  expiration: string;
  cvv: string;
};

// Mocked credit card details.
const mockedCard: Card = {
  number: '4242 4242 4242 4242',
  expiration: '04/28',
  cvv: '123',
};

function areCardDetailsCorrect(card: Card) {
  return card.number === mockedCard.number && card.expiration === mockedCard.expiration && card.cvv === mockedCard.cvv;
}

async function logPaymentAttempt(
  visitorId: string,
  isChargebacked: boolean,
  usedStolenCard: boolean,
  paymentAttemptCheckResult: string,
) {
  await PaymentAttemptDbModel.create({
    visitorId,
    isChargebacked,
    usedStolenCard,
    checkResult: paymentAttemptCheckResult,
    timestamp: new Date().getTime(),
  });
  await sequelize.sync();
}

export type PaymentPayload = {
  requestId: string;
  applyChargeback: boolean;
  usingStolenCard: boolean;
  cardNumber: string;
  cardCvv: string;
  cardExpiration: string;
};

export type PaymentResponse = {
  message: string;
  severity: Severity;
};

export async function POST(req: Request): Promise<NextResponse<PaymentResponse>> {
  const { requestId, applyChargeback, usingStolenCard, cardNumber, cardCvv, cardExpiration } =
    (await req.json()) as PaymentPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    return NextResponse.json({ severity: 'error', message: fingerprintResult.error }, { status: 403 });
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products?.identification?.data?.visitorId;
  if (!visitorId) {
    return NextResponse.json({ severity: 'error', message: 'Visitor ID not found.' }, { status: 403 });
  }

  // If this visitor ID ever paid with a stolen credit card, do not process the payment
  const usedStolenCreditCard = await PaymentAttemptDbModel.findOne({
    where: {
      visitorId,
      usedStolenCard: true,
    },
  });
  if (usedStolenCreditCard) {
    return NextResponse.json({ severity: 'error', message: PAYMENT_FRAUD_COPY.stolenCard }, { status: 403 });
  }

  // If the visitor ID filed more than 1 chargeback in the last year, do not process the payment.
  // (Adjust the number for you use case)
  const chargebacksFiledPastYear = await PaymentAttemptDbModel.findAndCountAll({
    where: {
      visitorId,
      isChargebacked: true,
      timestamp: {
        [Op.gt]: new Date().getTime() - 365 * 24 * 60 * 1000,
      },
    },
  });
  if (chargebacksFiledPastYear.count > 1) {
    return NextResponse.json({ severity: 'error', message: PAYMENT_FRAUD_COPY.previousChargeback }, { status: 403 });
  }

  // If the visitor ID performed 3 or more unsuccessful payments in the past year, do not process the payment
  const invalidPaymentsPastYear = await PaymentAttemptDbModel.findAndCountAll({
    where: {
      visitorId,
      timestamp: {
        [Op.gt]: new Date().getTime() - 365 * 24 * 60 * 1000,
      },
      checkResult: {
        [Op.not]: checkResultType.Passed,
      },
    },
  });
  if (invalidPaymentsPastYear.count > 2) {
    return NextResponse.json(
      { severity: 'error', message: PAYMENT_FRAUD_COPY.tooManyUnsuccessfulPayments },
      { status: 403 },
    );
  }

  // TODO: Fix and refactor this

  if (!areCardDetailsCorrect({ number: cardNumber, expiration: cardExpiration, cvv: cardCvv })) {
    logPaymentAttempt(visitorId, applyChargeback, usingStolenCard, 'Incorrect card details');
    return NextResponse.json({ severity: 'error', message: PAYMENT_FRAUD_COPY.incorrectCardDetails }, { status: 403 });
  } else {
    logPaymentAttempt(visitorId, applyChargeback, usingStolenCard, 'Successful payment');
    return NextResponse.json({ severity: 'success', message: PAYMENT_FRAUD_COPY.successfulPayment }, { status: 200 });
  }
}
