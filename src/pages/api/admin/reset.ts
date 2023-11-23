import {
  Severity,
  ensureValidRequestIdAndVisitorId,
  getVisitorDataWithRequestId,
  messageSeverity,
} from '../../../server/server';
import { LoginAttemptDbModel } from '../credential-stuffing/authenticate';
import { PaymentAttemptDbModel } from '../payment-fraud/place-order';
import {
  UserCartItemDbModel,
  UserPreferencesDbModel,
  UserSearchHistoryDbModel,
} from '../../../server/personalization/database';
import { LoanRequestDbModel } from '../../../server/loan-risk/database';
import { ArticleViewDbModel } from '../../../server/paywall/database';
import { CouponClaimDbModel } from '../../../server/coupon-fraud/database';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../../../server/checks';
import { sendForbiddenResponse, sendOkResponse } from '../../../server/response';
import { NextApiRequest, NextApiResponse } from 'next';

export type ResetResponse = {
  message: string;
  severity?: Severity;
  type?: string;
};

export type ResetRequest = {
  visitorId: string;
  requestId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResetResponse>) {
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
  const { visitorId, requestId } = req.body as ResetRequest;

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
  }

  const visitorData = await getVisitorDataWithRequestId(visitorId, requestId);

  for (const ruleCheck of ruleChecks) {
    const result = await ruleCheck(visitorData, req);

    if (result) {
      switch (result.type) {
        case checkResultType.Passed:
          return sendOkResponse(res, result);
        default:
          return sendForbiddenResponse(res, result);
      }
    }
  }
}

async function deleteVisitorIdData(visitorData) {
  const options = {
    where: { visitorId: visitorData.visitorId },
  };

  const loginAttemptsRowsRemoved = await tryToDestroy(() => LoginAttemptDbModel.destroy(options));

  const paymentAttemptsRowsRemoved = await tryToDestroy(() => PaymentAttemptDbModel.destroy(options));

  const couponsRemoved = await tryToDestroy(() => CouponClaimDbModel.destroy(options));

  const deletedCartItemsCount = await tryToDestroy(() => UserCartItemDbModel.destroy(options));
  const deletedUserPreferencesCount = await tryToDestroy(() => UserPreferencesDbModel.destroy(options));
  const deletedUserSearchHistoryCount = await tryToDestroy(() => UserSearchHistoryDbModel.destroy(options));

  const deletedPersonalizationCount =
    deletedCartItemsCount + deletedUserPreferencesCount + deletedUserSearchHistoryCount;

  const deletedLoanRequests = await tryToDestroy(() => LoanRequestDbModel.destroy(options));
  const deletedPaywallData = await tryToDestroy(() => ArticleViewDbModel.destroy(options));

  return new CheckResult(
    `Deleted ${loginAttemptsRowsRemoved} rows for Credential Stuffing problem. Deleted ${paymentAttemptsRowsRemoved} rows for Payment Fraud problem. Deleted ${deletedPersonalizationCount} entries related to personalization.  Deleted ${deletedLoanRequests} loan request entries. Deleted ${deletedPaywallData} rows for the Paywall problem. Deleted ${couponsRemoved} rows for the Coupon fraud problem.`,
    messageSeverity.Success,
    checkResultType.Passed,
  );
}

const tryToDestroy = async (callback) => {
  try {
    return await callback();
  } catch (err) {
    console.log(err);
    return 0;
  }
};
