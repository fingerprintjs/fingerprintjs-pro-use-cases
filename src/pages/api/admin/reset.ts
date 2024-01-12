import {
  Severity,
  ensureValidRequestIdAndVisitorId,
  getIdentificationEvent,
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
  RuleCheck,
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../../../server/checks';
import { sendForbiddenResponse, sendOkResponse } from '../../../server/response';
import { NextApiRequest, NextApiResponse } from 'next';
import { isVisitorsError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { deleteBlockedIp } from '../../../server/botd-firewall/blockedIpsDatabase';
import { syncFirewallRuleset } from '../../../server/botd-firewall/cloudflareApiHelper';

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
    deleteVisitorData,
  ]);
}

async function tryToReset(req: NextApiRequest, res: NextApiResponse, ruleChecks: RuleCheck[]) {
  // Get requestId and visitorId from the client.
  const { visitorId, requestId } = req.body as ResetRequest;

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
  }

  const eventResponse = await getIdentificationEvent(requestId);

  for (const ruleCheck of ruleChecks) {
    const result = await ruleCheck(eventResponse, req);

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

const deleteVisitorData: RuleCheck = async (eventResponse) => {
  if (isVisitorsError(eventResponse)) {
    return;
  }

  const options = {
    where: { visitorId: eventResponse.products?.identification?.data?.visitorId },
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

  const deletedBlockedIps = await tryToDestroy(async () => {
    const deletedIpCount = await deleteBlockedIp(eventResponse.products?.identification?.data?.ip ?? '');
    await syncFirewallRuleset();
    return deletedIpCount;
  });

  return new CheckResult(
    `Deleted ${loginAttemptsRowsRemoved} rows for Credential Stuffing problem. Deleted ${paymentAttemptsRowsRemoved} rows for Payment Fraud problem. Deleted ${deletedPersonalizationCount} entries related to personalization.  Deleted ${deletedLoanRequests} loan request entries. Deleted ${deletedPaywallData} rows for the Paywall problem. Deleted ${couponsRemoved} rows for the Coupon fraud problem. Deleted ${deletedBlockedIps} blocked IPs for the Bot Firewall demo.`,
    messageSeverity.Success,
    checkResultType.Passed,
  );
};

const tryToDestroy = async (callback: () => Promise<any>) => {
  try {
    return await callback();
  } catch (err) {
    console.error(err);
    return 0;
  }
};
