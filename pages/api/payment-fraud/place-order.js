import { Sequelize } from 'sequelize';
import {
  areVisitorIdAndRequestIdValid,
  messageSeverity,
  CheckResult,
  checkResultType,
  getOkReponse,
  getForbiddenReponse,
  reportSuspiciousActivity,
  getVisitorData,
  checkFreshIdentificationRequest,
  checkConfidenceScore,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../../../shared/server';

// Provision the database.
// In the Stackblitz environment, this db is stored locally in your browser.
// On the deployed demo, db is cleaned after each deployment.
const sequelize = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: '.data/database.sqlite',
  logging: false,
});

// Defines db model for login attempt.
const PaymentAttempt = sequelize.define('payment-attempt', {
  visitorId: {
    type: Sequelize.STRING,
  },
  isChargebacked: {
    type: Sequelize.BOOLEAN,
  },
  checkResult: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

PaymentAttempt.sync({ force: false });

export default async function handler(req, res) {
  // This API route accepts only POST requests.
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
  res.setHeader('Content-Type', 'application/json');

  return await tryToProcessPayment(req, res, [
    checkFreshIdentificationRequest,
    checkConfidenceScore,
    checkIpAddressIntegrity,
    checkOriginsIntegrity,
    checkVisitorIdForChargebacks,
    processPayment,
  ]);
}

async function tryToProcessPayment(req, res, ruleChecks) {
  // Get requestId and visitorId from the client.
  const visitorId = req.body.visitorId;
  const requestId = req.body.requestId;
  const applyChargeback = req.body.applyChargeback;

  if (!areVisitorIdAndRequestIdValid(visitorId, requestId)) {
    reportSuspiciousActivity(req);
    return getForbiddenReponse(
      res,
      'Forged visitorId or requestId detected. Try harder next time.',
      messageSeverity.Error
    );
  }

  // Information from the client side might have been tampered.
  // It's best practice to validate provided information with the Server API.
  // It is recommended to use the requestId and visitorId pair.
  const visitorData = await getVisitorData(visitorId, requestId);

  for (const ruleCheck of ruleChecks) {
    const result = await ruleCheck(visitorData, req);

    if (result) {
      await logPaymentAttempt(visitorId, applyChargeback, result.type);

      switch (result.type) {
        case checkResultType.Passed:
        case checkResultType.Challenged:
          return getOkReponse(res, result.message, result.messageSeverity);
        default:
          reportSuspiciousActivity(req);
          return getForbiddenReponse(res, result.message, result.messageSeverity);
      }
    }
  }
}

async function checkVisitorIdForChargebacks(visitorData) {
  // Gets all unsuccessful attempts during the last 24 hours.
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
  if (areCardDetailsCorrect()) {
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

// Dummy payment action.
function areCardDetailsCorrect() {
  return true;
}

// Persists placed order to the database.
async function logPaymentAttempt(visitorId, isChargebacked, paymentAttemptCheckResult) {
  await PaymentAttempt.create({
    visitorId,
    isChargebacked,
    checkResult: paymentAttemptCheckResult,
    timestamp: new Date().getTime(),
  });
  await sequelize.sync();
}
