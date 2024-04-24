import { NextApiRequest, NextApiResponse } from 'next';
import { Severity } from '../../../server/checkResult';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { isValidPostRequest } from '../../../server/server';
import { SmsVerificationDatabaseModel } from '../../../server/sms-pumping/database';
import { Op } from 'sequelize';
import { hashString } from '../../../server/server-utils';
import { SMS_FRAUD_COPY } from '../../../server/sms-pumping/smsPumpingConst';

export type SubmitCodePayload = {
  requestId: string;
  phoneNumber: string;
  code: number;
};

export type SubmitCodeResponse = {
  message: string;
  severity: Severity;
};

export default async function sendVerificationSMS(req: NextApiRequest, res: NextApiResponse<SubmitCodeResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { phoneNumber, code, requestId } = req.body as SubmitCodePayload;

  // Get the full identification result from Fingerprint Server API and validate its authenticity
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

  // Retrieve SMS verification requests made by this browser to this phone number
  const latestSmsVerificationRequest = await SmsVerificationDatabaseModel.findOne({
    where: {
      visitorId: identification?.visitorId,
      phoneNumberHash: hashString(phoneNumber),
      timestamp: {
        [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
    order: [['timestamp', 'DESC']],
  });

  // If there are no SMS verification requests, return an error
  if (!latestSmsVerificationRequest) {
    res.status(403).send({ severity: 'error', message: 'No SMS verification requests found.' });
    return;
  }

  // If the code is incorrect, return an error
  if (latestSmsVerificationRequest.code !== code) {
    res.status(403).send({ severity: 'error', message: SMS_FRAUD_COPY.incorrectCode });
    return;
  }

  // If the code is correct, return a success message
  res.status(200).send({ severity: 'success', message: SMS_FRAUD_COPY.accountCreated });
}
