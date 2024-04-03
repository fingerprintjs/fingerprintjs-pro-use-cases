import { NextApiRequest, NextApiResponse } from 'next';
import { Severity } from '../../../server/checkResult';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { isValidPostRequest } from '../../../server/server';
import { RealSmsPerVisitorModel, SmsVerificationModel } from '../../../server/sms-fraud/database';
import { ONE_SECOND_MS, readableMilliseconds } from '../../../shared/timeUtils';
import { Op } from 'sequelize';
import { pluralize } from '../../../shared/utils';
import Twilio from 'twilio';
import { hashString } from '../../../server/server-utils';

export type SendSMSPayload = {
  requestId: string;
  phoneNumber: string;
  email: string;
  disableBotDetection?: boolean;
};

export type SendSMSResponse = {
  message: string;
  severity: Severity;
  data?: {
    remainingAttempts?: number;
    fallbackCode?: number;
  };
};

const TEST_PHONE_NUMBER = '+1234567890';

// const ATTEMPT_TIMEOUTS_MAP: Record<number, { timeout: number }> = {
//   1: { timeout: 30 * ONE_SECOND_MS },
//   2: { timeout: 60 * ONE_SECOND_MS },
// };
const ATTEMPT_TIMEOUTS_MAP: Record<number, { timeout: number }> = {
  1: { timeout: 5 * ONE_SECOND_MS },
  2: { timeout: 5 * ONE_SECOND_MS },
};
const MAX_ATTEMPTS = Object.keys(ATTEMPT_TIMEOUTS_MAP).length + 1;
const REAL_SMS_LIMIT_PER_VISITOR = 6;

// To avoid saying "Wait 0 seconds to send another message"
const TIMEOUT_TOLERANCE_MS = ONE_SECOND_MS;
const millisecondsToSeconds = (milliseconds: number) => Math.floor(milliseconds / 1000);
const midnightToday = () => new Date(new Date().setHours(0, 0, 0, 0));

const generateRandomSixDigitCode = () => Math.floor(100000 + Math.random() * 900000);
const sendSms = async (phone: string, body: string, visitorId: string) => {
  if (phone === TEST_PHONE_NUMBER) {
    console.log('Test phone number detected, simulated message sent: ', body);
    return;
  }

  // Track real messages count per visitor that cannot be reset
  await RealSmsPerVisitorModel.findOrCreate({ where: { visitorId } });
  await RealSmsPerVisitorModel.increment('realMessagesCount', {
    where: {
      visitorId,
    },
  });

  const authToken = process.env.TWILIO_TOKEN;
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!authToken) {
    throw new Error('Twilio token not found.');
  }

  if (!accountSid) {
    throw new Error('Twilio account SID not found.');
  }

  if (!fromNumber) {
    throw new Error('Twilio FROM number not found.');
  }

  const client = Twilio(accountSid, authToken);

  const message = await client.messages.create({
    body,
    from: fromNumber,
    to: phone,
  });

  console.log('Message sent: ', message.sid);
};

export default async function sendVerificationSMS(req: NextApiRequest, res: NextApiResponse<SendSMSResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { phoneNumber: phone, email, requestId, disableBotDetection } = req.body as SendSMSPayload;

  // Get the full Identification and Bot Detection result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult(requestId, req, {
    blockBots: !disableBotDetection,
    blockTor: true,
  });
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  // If identification data is missing, return an error
  const visitorId = fingerprintResult.data.products?.identification?.data?.visitorId;
  if (!visitorId) {
    res.status(403).send({ severity: 'error', message: 'Identification data not found.' });
    return;
  }

  // Retrieve SMS verification requests made by the same browser today from the database, most recent first
  const smsVerificationRequests = await SmsVerificationModel.findAll({
    where: {
      visitorId,
      timestamp: {
        [Op.gte]: midnightToday(),
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
    if (millisecondsToSeconds(lastRequestTimeAgoMs) < millisecondsToSeconds(timeOut - TIMEOUT_TOLERANCE_MS)) {
      const waitFor = timeOut - lastRequestTimeAgoMs;
      res.status(403).send({
        severity: 'error',
        message: `You have already sent ${pluralize(requestsToday, 'verification code')}. Max allowed is ${MAX_ATTEMPTS}. Please wait ${readableMilliseconds(waitFor)} to send another one.`,
      });
      return;
    }
  }

  // Apply a hard limit on the number of real SMS messages that cannot be reset to prevent people from abusing the demo
  const realSmsCount = (await RealSmsPerVisitorModel.findOne({ where: { visitorId } }))?.realMessagesCount ?? 0;
  if (phone !== TEST_PHONE_NUMBER && realSmsCount >= REAL_SMS_LIMIT_PER_VISITOR) {
    res.status(403).send({
      severity: 'error',
      message: `You hit the hard demo limit of ${pluralize(REAL_SMS_LIMIT_PER_VISITOR, 'real SMS messages')} per visitor ID, thanks for testing! This cannot be reset. Please use the simulated phone number ${TEST_PHONE_NUMBER} to continue exploring the demo.`,
    });
    return;
  }

  const verificationCode = generateRandomSixDigitCode();

  // Send the SMS verification code
  try {
    /**
     * If this is the visitor's first request, or the cool-down period has passed,
     * send the SMS verification code and save the request to the database
     */
    await sendSms(
      phone,
      `Your verification code for demo.fingerprint.com/sms-fraud is ${verificationCode}.`,
      visitorId,
    );

    await SmsVerificationModel.create({
      visitorId: visitorId,
      phoneNumberHash: hashString(phone),
      email,
      timestamp: new Date(),
      code: verificationCode,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ severity: 'error', message: `An error occurred while sending the verification SMS message: ${error}` });
    return;
  }

  res.status(200).send({
    severity: 'success',
    message: `We sent a verification SMS message to ${phone}. You have ${pluralize(MAX_ATTEMPTS - requestsToday - 1, 'message')} left.`,
    data: {
      fallbackCode: verificationCode,
    },
  });
}
