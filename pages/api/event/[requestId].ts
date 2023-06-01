import { FingerprintJsServerApiClient, Region, isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { NextApiRequest, NextApiResponse } from 'next';
import { SERVER_API_KEY } from '../../../server/const';

export default async function getFingerprintEvent(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query as { requestId: string };
  const client = new FingerprintJsServerApiClient({
    region: Region.Global,
    apiKey: SERVER_API_KEY,
  });
  try {
    const eventResponse = await client.getEvent(requestId);
    res.status(200).json(eventResponse);
  } catch (error) {
    console.log(error);
    if (isEventError(error)) {
      res.statusMessage = `${error.error.code} - ${error.error.message}`;
      res.status(error.status).json({
        message: error.error.message,
        code: error.error.code,
      });
    } else {
      res.statusMessage = `Something went wrong ${error}`;
      res.status(500);
    }
  }
}
