import { EventsGetResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';

export type EventResponseBotData = NonNullable<NonNullable<EventsGetResponse['products']>['botd']>['data'];
export type EventResponseIdentification = NonNullable<
  NonNullable<EventsGetResponse['products']>['identification']
>['data'];
export type EventResponseIpInfoV4Geolocation = NonNullable<
  NonNullable<NonNullable<NonNullable<EventsGetResponse['products']>['ipInfo']>['data']>['v4']
>['geolocation'];

export type ValidationResult = { okay: false; error: string } | { okay: true };
export type ValidationDataResult<T = undefined> = { okay: false; error: string } | { okay: true; data: T };
