import { NextApiRequest, NextApiResponse } from 'next';
import { Severity } from '../../../server/checkResult';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { isValidPostRequest } from '../../../server/server';
import { saveBotVisit } from '../../../server/botd-firewall/botVisitDatabase';

export type SendSMSPayload = {
  requestId: string;
  phoneNumber: string;
  disableBotDetection: boolean;
};

export type SendSMSResponse = {
  message: string;
  severity: Severity;
};

export default async function sendVerificationSMS(req: NextApiRequest, res: NextApiResponse<SendSMSResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { phoneNumber, requestId, disableBotDetection } = req.body as SendSMSPayload;

  // Get the full Identification and Bot Detection result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult(requestId, req);
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  console.log('fingerprintResult', fingerprintResult);

  const identification = fingerprintResult.data.products?.identification?.data;
  const botData = fingerprintResult.data.products?.botd?.data;

  // If a bot is detected, return an error
  if (!disableBotDetection && botData?.bot?.result === 'bad') {
    res.status(403).send({
      severity: 'error',
      message: '🤖 Malicious bot detected, SMS message was not sent.',
    });
    // Optionally, here you could also save the bot's IP address to a blocklist in your database
    // and block all requests from this IP address in the future at a web server/firewall level.
    saveBotVisit(botData, identification?.visitorId ?? 'N/A');
    return;
  }

  // All checks passed, allow access
  res.status(200).send({
    severity: 'success',
    message: `A verification SMS message was sent to ${phoneNumber}.`,
  });
}
