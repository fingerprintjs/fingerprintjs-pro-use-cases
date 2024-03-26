// Milliseconds helpers
export const ONE_SECOND_MS = 1000;
export const FIVE_SECONDS_MS = 5 * ONE_SECOND_MS;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;
export const ONE_DAY_MS = 24 * ONE_HOUR_MS;
export const ONE_MONTH = 30 * ONE_DAY_MS;
export const THREE_MONTHS = 3 * ONE_MONTH;

// Waiting helpers
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const readableMilliseconds = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  let result = '';
  if (hours > 0) {
    result += `${hours}hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    result += `${minutes % 60}minute${minutes > 1 ? 's' : ''} `;
  }

  result += `${seconds % 60} second${seconds > 1 ? 's' : ''}`;

  return result;
};

export const timeAgoLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMS = now.getTime() - date.getTime();
  if (diffMS < FIVE_SECONDS_MS) {
    return 'Just now';
  }
  if (diffMS < ONE_MINUTE_MS) {
    return `Less than a minute ago`;
  }
  if (diffMS < ONE_HOUR_MS) {
    return `${Math.floor(diffMS / 60000)} minutes ago`;
  }
  if (diffMS < ONE_DAY_MS) {
    return `${Math.floor(diffMS / 3600000)} hours ago`;
  }
  if (diffMS < ONE_MONTH) {
    return `${Math.floor(diffMS / 86400000)} days ago`;
  }
  if (diffMS < THREE_MONTHS) {
    return `More than a month ago`;
  }
  return `More than 3 months ago`;
};
