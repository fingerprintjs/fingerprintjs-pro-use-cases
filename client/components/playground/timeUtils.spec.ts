import { describe, expect, it } from 'vitest';
import { timeAgoLabel } from './timeUtils';

const millisecondsAgoDateISOString = (millisecondsAgo: number) => {
  return new Date(new Date().getTime() - millisecondsAgo).toISOString();
};

describe('timeAgoLabel', () => {
  it('Should say "Just now" for < 5 seconds', () => {
    const fourSecondsAgo = millisecondsAgoDateISOString(4000);
    expect(timeAgoLabel(fourSecondsAgo)).toBe('Just now');
  });

  it('Should say "Less than a minute ago" for < 1 minute', () => {
    const fiftySecondsAgo = millisecondsAgoDateISOString(50000);
    expect(timeAgoLabel(fiftySecondsAgo)).toBe('Less than a minute ago');
  });

  it('Should say "X minutes ago" for < 1 hour', () => {
    const twentyMinutesAgo = millisecondsAgoDateISOString(1200000);
    expect(timeAgoLabel(twentyMinutesAgo)).toBe('20 minutes ago');
  });

  it('Should say "X hours ago" for < 1 day', () => {
    const twentyHoursAgo = millisecondsAgoDateISOString(72000000);
    expect(timeAgoLabel(twentyHoursAgo)).toBe('20 hours ago');
  });

  it('Should say "X days ago" for < 1 month', () => {
    const twentyDaysAgo = millisecondsAgoDateISOString(1728000000);
    expect(timeAgoLabel(twentyDaysAgo)).toBe('20 days ago');
  });

  it('Should say "More than a month ago" for < 3 months', () => {
    const twoMonthsAgo = millisecondsAgoDateISOString(5184000000);
    expect(timeAgoLabel(twoMonthsAgo)).toBe('More than a month ago');
  });

  it('Should say "More than 3 months ago" for > 3 months', () => {
    const fourMonthsAgo = millisecondsAgoDateISOString(10368000000);
    expect(timeAgoLabel(fourMonthsAgo)).toBe('More than 3 months ago');
  });
});
