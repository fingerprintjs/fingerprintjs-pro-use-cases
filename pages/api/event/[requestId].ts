import { FingerprintJsServerApiClient, Region } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { NextApiRequest, NextApiResponse } from 'next';
import { SERVER_API_KEY } from '../../../server/const';

export const config = {
  runtime: 'nodejs',
};

export type IdentificationEvent = Awaited<Promise<ReturnType<typeof FingerprintJsServerApiClient.prototype.getEvent>>>;

export default async function getFingerprintEvent(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query as { requestId: string };
  try {
    const client = new FingerprintJsServerApiClient({
      region: Region.Global,
      apiKey: SERVER_API_KEY,
    });

    const eventResponse = await client.getEvent(requestId);
    res.status(200).json(eventResponse);
  } catch (error) {
    console.log(error);
    if (error.status === 404) {
      res.status(404).json({
        message: 'requestId not found',
      });
    }
    res.status(500).json({
      message: `Something went wrong ${error}`,
      error,
    });
  }
}
