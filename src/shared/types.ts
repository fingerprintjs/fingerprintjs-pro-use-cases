import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';

export type EventResponseBotData = NonNullable<NonNullable<EventResponse['products']>['botd']>['data'];
export type EventResponseIdentification = NonNullable<NonNullable<EventResponse['products']>['identification']>['data'];

export type ValidationResult = { okay: false; error: string } | { okay: true };
export type ValidationDataResult<T = undefined> = { okay: false; error: string } | { okay: true; data: T };
