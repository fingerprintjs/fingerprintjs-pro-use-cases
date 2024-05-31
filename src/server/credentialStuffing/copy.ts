export const CREDENTIAL_STUFFING_COPY = {
  tooManyAttempts: 'You had 5 or more attempts during the last 24 hours. This login attempt was not performed.',
  differentVisitorIdUseMFA:
    "Provided credentials are correct but we've never seen you logging in using this device. Confirm your identity with a second factor.",
  invalidCredentials: 'Incorrect credentials, try again.',
  success: 'We logged you in successfully.',
} as const;
