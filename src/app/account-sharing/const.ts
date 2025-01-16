export const DEFAULT_USER = {
  username: 'user',
  password: 'fingerprint',
};

export const ACCOUNT_SHARING_COPY = {
  loginSuccess: (username: string) => `You are logged in as '${username}'`,
  logoutSuccess: 'You have logged out.',
  userAlreadyExists: 'Username already exists. Log in instead?',
  incorrectPassword: 'Incorrect password.',
  userNotFound: 'User not found.',
  visitorIdNotFound: 'Visitor ID not found.',
};
