import { isValidPostRequest } from '../../../server/server';
import { UserCartItemDbModel, UserSearchHistoryDbModel } from '../../../server/personalization/database';
import { LoanRequestDbModel } from '../../../app/loan-risk/api/request-loan/database';
import { CouponClaimDbModel } from '../../../server/coupon-fraud/database';
import { Severity, getAndValidateFingerprintResult } from '../../../server/checks';
import { NextApiRequest, NextApiResponse } from 'next';
import { LoginAttemptDbModel } from '../../../server/credentialStuffing/database';
import { ArticleViewDbModel } from '../../../app/paywall/api/database';
import { SmsVerificationDatabaseModel } from '../../../app/sms-pumping/api/database';
import { syncFirewallRuleset } from '../../../app/bot-firewall/api/block-ip/cloudflareApiHelper';
import { deleteBlockedIp } from '../../../app/bot-firewall/api/get-blocked-ips/blockedIpsDatabase';
import { PaymentAttemptDbModel } from '../../../app/payment-fraud/api/place-order/database';

export type ResetResponse = {
  message: string;
  severity?: Severity;
  result?: ResetResult;
};

export type ResetRequest = {
  requestId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResetResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { requestId } = req.body as ResetRequest;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({
    requestId,
    req,
    options: { minConfidenceScore: 0.3 },
  });
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  const { visitorId, ip } = fingerprintResult.data.products?.identification?.data ?? {};
  if (!visitorId) {
    res.status(403).send({ severity: 'error', message: 'Visitor ID not found.' });
    return;
  }

  const deleteResult = await deleteVisitorData(visitorId, ip ?? '');

  res.status(200).json({
    message: 'Visitor data deleted successfully.',
    severity: 'success',
    result: deleteResult,
  });
}

const deleteVisitorData = async (visitorId: string, ip: string) => {
  const options = {
    where: { visitorId },
  };

  return {
    deletedLoginAttempts: await tryToDestroy(() => LoginAttemptDbModel.destroy(options)),
    deletedPaymentAttempts: await tryToDestroy(() => PaymentAttemptDbModel.destroy(options)),
    deletedCouponsClaims: await tryToDestroy(() => CouponClaimDbModel.destroy(options)),
    deletedPersonalizationRecords: await tryToDestroy(async () => {
      const deletedCartItemsCount = await UserCartItemDbModel.destroy(options);
      const deletedUserSearchHistoryCount = await UserSearchHistoryDbModel.destroy(options);
      return deletedCartItemsCount + deletedUserSearchHistoryCount;
    }),
    deletedLoanRequests: await tryToDestroy(() => LoanRequestDbModel.destroy(options)),
    deletedArticleViews: await tryToDestroy(() => ArticleViewDbModel.destroy(options)),
    deletedBlockedIps: await tryToDestroy(async () => {
      const deletedIpCount = await deleteBlockedIp(ip);
      await syncFirewallRuleset();
      return deletedIpCount;
    }),
    deletedSmsVerificationRequests: await tryToDestroy(() => SmsVerificationDatabaseModel.destroy(options)),
  };
};

type ResetResult = Awaited<ReturnType<typeof deleteVisitorData>>;

const tryToDestroy = async (callback: () => Promise<number>) => {
  try {
    return await callback();
  } catch (err) {
    console.error(err);
    return 0;
  }
};
