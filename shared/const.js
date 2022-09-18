export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const SITE_URL = IS_PRODUCTION ? 'https://fingerprinthub.com/' : 'http://localhost:3000/';
