import { DecryptionAlgorithm, unsealEventsResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';

export const decryptSealedResult = async (sealedResult: string) => {
  const decryptionKey = process.env.SEALED_RESULTS_DECRYPTION_KEY;
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
