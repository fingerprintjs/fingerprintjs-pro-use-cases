import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
  CheckResult,
  checkResultType,
  ensureValidRequestIdAndVisitorId,
  getForbiddenReponse,
  getOkReponse,
  getVisitorData,
  messageSeverity,
} from '../../../shared/server';
import { LoginAttempt } from '../credential-stuffing/authenticate';
import { PaymentAttempt } from '../payment-fraud/place-order';

export default async function handler(req, res) {
  // This API route accepts only POST requests.
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
  res.setHeader('Content-Type', 'application/json');

  return await tryToReset(req, res, [
    checkFreshIdentificationRequest,
    checkConfidenceScore,
    checkIpAddressIntegrity,
    checkOriginsIntegrity,
    deleteVisitorIdData,
  ]);
}

async function tryToReset(req, res, ruleChecks) {
  // Get requestId and visitorId from the client.
  const visitorId = req.body.visitorId;
  const requestId = req.body.requestId;

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
  }

  const visitorData = await getVisitorData(visitorId, requestId);

  for (const ruleCheck of ruleChecks) {
    const result = await ruleCheck(visitorData, req);

    if (result) {
      switch (result.type) {
        case checkResultType.Passed:
          return getOkReponse(res, result.message, result.messageSeverity);
        default:
          return getForbiddenReponse(res, result.message, result.messageSeverity);
      }
    }
  }
}

async function deleteVisitorIdData(visitorData, request) {
  const loginAttemptsRowsRemoved = await LoginAttempt.destroy({
    where: { visitorId: visitorData.visitorId },
  });

  const paymentAttemptsRowsRemoved = await PaymentAttempt.destroy({
    where: { visitorId: visitorData.visitorId },
  });

  return new CheckResult(
    `Deleted ${loginAttemptsRowsRemoved} rows for Credential Stuffing problem, ${paymentAttemptsRowsRemoved} rows for Payment Fraud problem.`,
    messageSeverity.Success,
    checkResultType.Passed
  );
}
