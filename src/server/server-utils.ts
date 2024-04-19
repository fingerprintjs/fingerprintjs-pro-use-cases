import Crypto from 'crypto';
import { ENV } from '../env';

export function hashString(phoneNumber: string) {
  const hash = Crypto.createHash('sha256');
  hash.update(phoneNumber + ENV.HASH_SALT);
  return hash.digest('hex');
}
