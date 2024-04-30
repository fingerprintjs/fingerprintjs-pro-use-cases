import { DecryptionAlgorithm, unsealEventsResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { env } from '../env';

export const decryptSealedResult = async (sealedResult: string) => {
  const decryptionKey = env.SEALED_RESULTS_DECRYPTION_KEY;
  if (!decryptionKey) {
    throw new Error('Missing SEALED_RESULTS_DECRYPTION_KEY env variable');
  }

  return unsealEventsResponse(Buffer.from(sealedResult, 'base64'), [
    {
      key: Buffer.from(decryptionKey, 'base64'),
      algorithm: DecryptionAlgorithm.Aes256Gcm,
    },
  ]);
};
