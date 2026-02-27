import { Event } from '@fingerprint/node-sdk';

export type EventResponseIdentification = NonNullable<Event['identification']>;
export type EventResponseIpInfoV4Geolocation = NonNullable<
  NonNullable<NonNullable<Event['ip_info']>['v4']>['geolocation']
>;
export type EventResponseBotData = Event;

export type ValidationResult = { okay: false; error: string } | { okay: true };
export type ValidationDataResult<T = undefined> = { okay: false; error: string } | { okay: true; data: T };
