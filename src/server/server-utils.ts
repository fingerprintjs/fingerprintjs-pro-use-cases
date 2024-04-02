import Crypto from 'crypto';

export function hashString(phoneNumber: string) {
  const salt = process.env.HASH_SALT || '';
  const hash = Crypto.createHash('sha256');
  hash.update(phoneNumber + salt);
  return hash.digest('hex');
}
