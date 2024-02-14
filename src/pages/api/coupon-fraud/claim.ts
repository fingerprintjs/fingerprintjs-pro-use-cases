import { Severity, isValidPostRequest } from '../../../server/server';
import { Op } from 'sequelize';
import { COUPON_CODES, CouponClaimDbModel, CouponCodeString } from '../../../server/coupon-fraud/database';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { NextApiRequest, NextApiResponse } from 'next';

export const COUPON_FRAUD_COPY = {
  doesNotExist: 'Provided coupon code does not exist.',
  usedBefore: 'The visitor used this coupon before.',
  usedAnotherCouponRecently: 'The visitor claimed another coupon recently.',
  success: 'Coupon claimed',
} as const;

export type CouponClaimPayload = {
  couponCode: string;
  requestId: string;
};

export type CouponClaimResponse = {
  message: string;
  severity: Severity;
};

const isCouponCode = (couponCode: string): couponCode is CouponCodeString => {
  return COUPON_CODES.includes(couponCode as CouponCodeString);
};

export default async function claimCouponHandler(req: NextApiRequest, res: NextApiResponse<CouponClaimResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { couponCode, requestId } = req.body as CouponClaimPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult(requestId, req);
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products?.identification?.data?.visitorId;
  if (!visitorId) {
    res.status(403).send({ severity: 'error', message: 'Visitor ID not found.' });
    return;
  }

  // Check if Coupon exists
  if (!isCouponCode(couponCode)) {
    res.status(403).send({ severity: 'error', message: COUPON_FRAUD_COPY.doesNotExist });
    return;
  }

  // Check if visitor used this coupon before
  const usedBefore = await CouponClaimDbModel.findOne({
    where: { visitorId, couponCode },
  });
  if (usedBefore) {
    res.status(403).send({ severity: 'error', message: COUPON_FRAUD_COPY.usedBefore });
    return;
  }

  // Check if visitor claimed another coupon recently
  const oneHourBefore = new Date();
  oneHourBefore.setHours(oneHourBefore.getHours() - 1);
  const usedAnotherCouponRecently = await CouponClaimDbModel.findOne({
    where: {
      visitorId,
      timestamp: {
        [Op.between]: [oneHourBefore, new Date()],
      },
    },
  });
  if (usedAnotherCouponRecently) {
    res.status(403).send({ severity: 'error', message: COUPON_FRAUD_COPY.usedAnotherCouponRecently });
    return;
  }

  // If all checks passed, claim coupon
  await CouponClaimDbModel.create({
    couponCode,
    visitorId,
    timestamp: new Date(),
  });
  res.status(200).send({ severity: 'success', message: COUPON_FRAUD_COPY.success });
}
