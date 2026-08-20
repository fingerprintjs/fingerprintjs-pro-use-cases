import { describe, expect, it } from 'vitest';
import { Event } from '@fingerprint/node-sdk';
import botDetectionResult from './BotDetectionResult';
import { ipBlocklistResult } from './IpBlocklistResult';
import { booleanDetectionResult } from './SmartSignalResult';
import { vpnDetectionResult } from './VpnDetectionResult';

describe('Smart signal results', () => {
  it('reports an unavailable boolean signal', () => {
    expect(booleanDetectionResult(undefined, 'Detected')).toBe('Not available');
  });

  it('reports a negative boolean signal as not detected', () => {
    expect(booleanDetectionResult(false, 'Detected')).toBe('Not detected');
  });

  it('reports absent complex signals as unavailable', () => {
    const eventWithoutSmartSignals = {} as Event;

    expect(botDetectionResult({ event: eventWithoutSmartSignals })).toBe('Not available');
    expect(vpnDetectionResult({ event: eventWithoutSmartSignals })).toBe('Not available');
    expect(ipBlocklistResult({ event: eventWithoutSmartSignals })).toBe('Not available');
  });
});
