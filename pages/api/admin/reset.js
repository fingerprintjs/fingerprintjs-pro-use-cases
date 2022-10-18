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
} from '../../../server/server';
import { LoginAttempt } from '../credential-stuffing/authenticate';
import { PaymentAttempt } from '../payment-fraud/place-order';
import { UserCartItem, UserPreferences, UserSearchHistory } from '../../../server/personalization/database';
import { LoanRequest } from '../../../server/loan-risk/database';
import { ArticleView } from '../../../server/paywall/database';
import { CouponClaim } from '../coupon-fraud/claim';

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

async function deleteVisitorIdData(visitorData) {
  const options = {
    where: { visitorId: visitorData.visitorId },
  };

  const loginAttemptsRowsRemoved = await tryToDestroy(() => LoginAttempt.destroy(options));

  const paymentAttemptsRowsRemoved = await tryToDestroy(() => PaymentAttempt.destroy(options));

  const couponsRemoved = await tryToDestroy(() => CouponClaim.destroy(options));

  const deletedPersonalizationResult = await Promise.all(
    [UserCartItem, UserPreferences, UserCartItem, UserSearchHistory].map((model) =>
      tryToDestroy(() => model.destroy(options))
    )
  );

  const deletedPersonalizationCount = deletedPersonalizationResult.reduce((acc, cur) => acc + cur, 0);

  const deletedLoanRequests = await tryToDestroy(() => LoanRequest.destroy(options));
  const deletedPaywallData = await tryToDestroy(() => ArticleView.destroy(options));

  return new CheckResult(
    `Deleted ${loginAttemptsRowsRemoved} rows for Credential Stuffing problem. Deleted ${paymentAttemptsRowsRemoved} rows for Payment Fraud problem. Deleted ${deletedPersonalizationCount} entries related to personalization.  Deleted ${deletedLoanRequests} loan request entries. Deleted ${deletedPaywallData} rows for the Paywall problem. Deleted ${couponsRemoved} rows for the Coupon fraud problem.`,
    messageSeverity.Success,
    checkResultType.Passed
  );
}

const tryToDestroy = async (callback) => {
  try {
    return callback();
  } catch (err) {
    return 0;
  }
};
