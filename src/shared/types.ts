import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';

export type EventResponseBotData = NonNullable<NonNullable<EventResponse['products']>['botd']>['data'];
export type EventResponseIdentification = NonNullable<NonNullable<EventResponse['products']>['identification']>['data'];
