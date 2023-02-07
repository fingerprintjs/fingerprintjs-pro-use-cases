import { Sequelize } from 'sequelize';
import {
  ensurePostRequest,
  ensureValidRequestIdAndVisitorId,
  getForbiddenResponse,
  getOkResponse,
  getVisitorDataWithRequestId,
  messageSeverity,
  reportSuspiciousActivity,
  sequelize,
} from '../../../server/server';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../../../server/checks';

// Defines db model for payment attempt.
export const PaymentAttempt = sequelize.define('payment-attempt', {
  visitorId: {
    type: Sequelize.STRING,
  },
  isChargebacked: {
    type: Sequelize.BOOLEAN,
  },
  usedStolenCard: {
    type: Sequelize.BOOLEAN,
  },
  checkResult: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

// Mocked credit card details.
const mockedCard = {
  number: '4242 4242 4242 4242',
  expiration: '04/28',
  cvv: '123',
};

PaymentAttempt.sync({ force: false });

export default async function handler(req, res) {
  // This API route accepts only POST requests.
  if (!ensurePostRequest(req, res)) {
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  return await tryToProcessPayment(req, res, [
    checkFreshIdentificationRequest,
    checkConfidenceScore,
    checkIpAddressIntegrity,
    checkOriginsIntegrity,
    checkVisitorIdForStolenCard,
    checkVisitorIdForChargebacks,
    checkForCardCracking,
    processPayment,
  ]);
}

async function tryToProcessPayment(req, res, ruleChecks) {
  // Get requestId and visitorId from the client.
  const visitorId = req.body.visitorId;
  const requestId = req.body.requestId;
  const applyChargeback = req.body.applyChargeback;
  const usedStolenCard = req.body.usingStolenCard;

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
  }

  // Information from the client side might have been tampered.
  // It's best practice to validate provided information with the Server API.
  // It is recommended to use the requestId and visitorId pair.
  const visitorData = await getVisitorDataWithRequestId(visitorId, requestId);

  for (const ruleCheck of ruleChecks) {
    const result = await ruleCheck(visitorData, req);

    if (result) {
      await logPaymentAttempt(visitorId, applyChargeback, usedStolenCard, result.type);

      switch (result.type) {
        case checkResultType.Passed:
        case checkResultType.Challenged:
          return getOkResponse(res, result.message, result.messageSeverity);
        default:
          reportSuspiciousActivity(req);
          return getForbiddenResponse(res, result.message, result.messageSeverity);
      }
    }
  }
}

async function checkVisitorIdForStolenCard(visitorData) {
  // Get all stolen card records for the visitorId
  const stolenCardUsedCount = await PaymentAttempt.findAndCountAll({
    where: {
      visitorId: visitorData.visitorId,
      usedStolenCard: true,
    },
  });

  // If the visitorId performed more than 1 payment with a stolen card during the last 1 year we do not process the payment.
  // The time window duration might vary.
  if (stolenCardUsedCount.count > 0) {
    return new CheckResult(
      'According to our records, you paid with a stolen card. We did not process the payment.',
      messageSeverity.Error,
      checkResultType.PaidWithStolenCard
    );
  }
}

async function checkForCardCracking(visitorData) {
  // Gets all unsuccessful attempts for the visitor during the last 365 days.
  const invalidCardAttemptCountQueryResult = await PaymentAttempt.findAndCountAll({
    where: {
      visitorId: visitorData.visitorId,
      timestamp: {
        [Sequelize.Op.gt]: new Date().getTime() - 365 * 24 * 60 * 1000,
      },
      checkResult: {
        [Sequelize.Op.not]: checkResultType.Passed,
      },
    },
  });

  // If the visitorId performed 3 unsuccessful payments during the last 365 days we do not process any further payments.
  // The count of attempts and time window might vary.
  if (invalidCardAttemptCountQueryResult.count > 2) {
    return new CheckResult(
      'You placed more than 3 unsuccessful payment attempts during the last 365 days. This payment attempt was not performed.',
      messageSeverity.Error,
      checkResultType.TooManyUnsuccessfulPayments
    );
  }
}

async function checkVisitorIdForChargebacks(visitorData) {
  // Gets all unsuccessful attempts during the last 365  days.
  const countOfChargebacksForVisitorId = await PaymentAttempt.findAndCountAll({
    where: {
      visitorId: visitorData.visitorId,
      isChargebacked: true,
      timestamp: {
        [Sequelize.Op.gt]: new Date().getTime() - 365 * 24 * 60 * 1000,
      },
    },
  });

  // If the visitorId performed more than 1 chargeback during the last 1 year we do not process the payment.
  // The count of chargebacks and time window might vary.
  if (countOfChargebacksForVisitorId.count > 1) {
    return new CheckResult(
      'You performed more than 1 chargeback during the last 1 year, we did not perform the payment.',
      messageSeverity.Error,
      checkResultType.TooManyChargebacks
    );
  }
}

async function processPayment(visitorData, request) {
  // Checks if the provided card details are correct.
  if (areCardDetailsCorrect(request)) {
    return new CheckResult(
      'Thank you for your payment. Everything is OK.',
      messageSeverity.Success,
      checkResultType.Passed
    );
  } else {
    return new CheckResult(
      'Incorrect card details, try again.',
      messageSeverity.Error,
      checkResultType.IncorrectCardDetails
    );
  }
}

// Dummy action simulating card verification.
function areCardDetailsCorrect(request) {
  return (
    request.body.cardNumber === mockedCard.number &&
    request.body.cardExpiration === mockedCard.expiration &&
    request.body.cardCvv === mockedCard.cvv
  );
}

// Persists placed order to the database.
async function logPaymentAttempt(visitorId, isChargebacked, usedStolenCard, paymentAttemptCheckResult) {
  await PaymentAttempt.create({
    visitorId,
    isChargebacked,
    usedStolenCard,
    checkResult: paymentAttemptCheckResult,
    timestamp: new Date().getTime(),
  });
  await sequelize.sync();
}
