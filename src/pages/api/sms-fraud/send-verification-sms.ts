import { NextApiRequest, NextApiResponse } from 'next';
import { Severity } from '../../../server/checkResult';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { isValidPostRequest } from '../../../server/server';
import { SmsVerificationModel } from '../../../server/sms-fraud/database';
import { ONE_SECOND_MS, readableMilliseconds } from '../../../shared/timeUtils';
import { Op } from 'sequelize';
import { pluralize } from '../../../shared/utils';

export type SendSMSPayload = {
  requestId: string;
  phone: string;
  email: string;
  disableBotDetection?: boolean;
};

export type SendSMSResponse = {
  message: string;
  severity: Severity;
  data?: {
    remainingAttempts?: number;
  };
};

const ATTEMPT_TIMEOUTS_MAP: Record<number, { timeout: number }> = {
  1: { timeout: 10 * ONE_SECOND_MS },
  2: { timeout: 15 * ONE_SECOND_MS },
};

const MAX_ATTEMPTS = Object.keys(ATTEMPT_TIMEOUTS_MAP).length + 1;

const generateRandomSixDigitCode = () => Math.floor(100000 + Math.random() * 900000);

export default async function sendVerificationSMS(req: NextApiRequest, res: NextApiResponse<SendSMSResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { phone, email, requestId, disableBotDetection } = req.body as SendSMSPayload;

  // Get the full Identification and Bot Detection result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult(requestId, req);
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  // If identification data is missing, return an error
  const identification = fingerprintResult.data.products?.identification?.data;
  if (!identification) {
    res.status(403).send({ severity: 'error', message: 'Identification data not found.' });
    return;
  }

  // If a bot is detected, return an error
  const botData = fingerprintResult.data.products?.botd?.data;
  if (!disableBotDetection && botData?.bot?.result === 'bad') {
    res.status(403).send({
      severity: 'error',
      message: '🤖 Malicious bot detected, SMS message was not sent.',
    });
    return;
  }

  // If a Tor browser is detected, return an error
  const torData = fingerprintResult.data.products?.tor?.data;
  if (torData?.result === true) {
    res.status(403).send({
      severity: 'error',
      message: 'Tor browser detected, SMS message was not sent. Please use a different browser to create an account.',
    });
    return;
  }

  // Retrieve SMS verification requests made by the same browser today from the database, most recent first
  const smsVerificationRequests = await SmsVerificationModel.findAll({
    where: {
      visitorId: identification?.visitorId,
      timestamp: {
        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    order: [['timestamp', 'DESC']],
  });
  const requestsToday = smsVerificationRequests.length;

  // If there have been too many requests, shut the visitor down for the day
  if (requestsToday >= MAX_ATTEMPTS) {
    res.status(403).send({
      severity: 'error',
      message: `You have already sent ${pluralize(MAX_ATTEMPTS, 'verification code')} today. Please try again tomorrow or contact our support team.`,
      data: {
        remainingAttempts: 0,
      },
    });
    return;
  }

  // If the visitor already sent some requests recently, apply the appropriate cool-down period
  if (requestsToday > 0) {
    const lastRequestTimeAgoMs = new Date().getTime() - smsVerificationRequests[0].timestamp.getTime();
    const timeOut = ATTEMPT_TIMEOUTS_MAP[requestsToday].timeout;
    if (lastRequestTimeAgoMs < timeOut) {
      const waitFor = timeOut - lastRequestTimeAgoMs;
      res.status(403).send({
        severity: 'error',
        message: `You have already sent ${pluralize(requestsToday, 'verification code')}. Please wait ${readableMilliseconds(waitFor)} to send another one.`,
      });
      return;
    }
  }

  /**
   * If this is the visitor's first request, or the cool-down period has passed,
   * send the SMS verification code and save the request to the database
   */
  await SmsVerificationModel.create({
    visitorId: identification.visitorId,
    phone,
    email,
    timestamp: new Date(),
    code: generateRandomSixDigitCode(),
  });

  res.status(200).send({
    severity: 'success',
    message: `We sent a verification SMS message to ${phone}.`,
  });
}
