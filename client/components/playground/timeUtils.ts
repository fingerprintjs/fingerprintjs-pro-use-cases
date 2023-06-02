export const FIVE_SECONDS = 5000;
export const ONE_MINUTE = 60000;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;
export const ONE_MONTH = ONE_DAY * 30;
export const THREE_MONTHS = ONE_MONTH * 3;

export const timeAgoLabel = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMS = now.getTime() - date.getTime();
  if (diffMS < FIVE_SECONDS) {
    return 'Just now';
  }
  if (diffMS < ONE_MINUTE) {
    return `Less than a minute ago`;
  }
  if (diffMS < ONE_HOUR) {
    return `${Math.floor(diffMS / 60000)} minutes ago`;
  }
  if (diffMS < ONE_DAY) {
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
