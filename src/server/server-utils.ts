import Crypto from 'crypto';
import { env } from '../env';

export function hashString(phoneNumber: string) {
  const hash = Crypto.createHash('sha256');
  hash.update(phoneNumber + env.HASH_SALT);
  return hash.digest('hex');
}
