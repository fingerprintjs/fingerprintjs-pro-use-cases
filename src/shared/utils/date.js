export function getTodayDateRange() {
  const timestampStart = new Date();
  const timestampEnd = new Date();

  timestampStart.setHours(0, 0, 0, 0);
  timestampEnd.setHours(23, 59, 59, 59);

  return { timestampStart, timestampEnd };
}
