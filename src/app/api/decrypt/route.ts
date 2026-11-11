import { Event } from '@fingerprint/node-sdk';
import { decryptSealedResult } from '../../../server/decryptSealedResult';

export type DecryptPayload = {
  sealedResult: string;
};

export type DecryptResponse = Event;

export type DecryptErrorResponse = { error: string };

export async function POST(request: Request) {
  try {
    const sealedData = ((await request.json()) as DecryptPayload).sealedResult;
    const data = await decryptSealedResult(sealedData);
    return Response.json(data);
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Decryption failed' } satisfies DecryptErrorResponse, { status: 500 });
  }
}
