import { describe, expect, it } from 'vitest';
import { formatNameWithVersion } from './formatNameWithVersion';

describe('formatNameWithVersion', () => {
  it('joins name and version', () => {
    expect(formatNameWithVersion('Chrome', '155.0.0')).toBe('Chrome 155.0.0');
  });

  it('shows only the name when the API reports the version as "Not Available"', () => {
    expect(formatNameWithVersion('Chromium-Based Browser', 'Not Available')).toBe('Chromium-Based Browser');
  });

  it('shows only the name when the version is empty or missing', () => {
    expect(formatNameWithVersion('Linux', '')).toBe('Linux');
    expect(formatNameWithVersion('Linux', undefined)).toBe('Linux');
  });
});
