import { FingerprintJsServerApiClient, isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { NextApiRequest, NextApiResponse } from 'next';
import { BACKEND_REGION, CUSTOM_SERVER_API_URL, SERVER_API_KEY } from '../../../server/const';

export default async function getFingerprintEvent(req: NextApiRequest, res: NextApiResponse) {
  const { requestId } = req.query as { requestId: string };
  const client = new FingerprintJsServerApiClient({
    region: BACKEND_REGION,
    apiKey: SERVER_API_KEY,
  });

  try {
    if (CUSTOM_SERVER_API_URL) {
      // Just for testing purposes on staging environment, use the FingerprintJsServerApiClient under normal circumstances as shown below
      var myHeaders = new Headers();
      myHeaders.append('Auth-API-Key', SERVER_API_KEY);

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
      };

      const eventResponse = await (await fetch(`${CUSTOM_SERVER_API_URL}/events/${requestId}`, requestOptions)).json();
      res.status(200).json(eventResponse);
    } else {
      const eventResponse = await client.getEvent(requestId);
      res.status(200).json(eventResponse);
    }
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
