import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { useState } from 'react';
import { useQuery } from 'react-query';

export function usePlaygroundSignals() {
  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData({ extendedResult: true, ignoreCache: true }, { immediate: true });

  const requestId = agentResponse?.requestId;

  /** Temporary fix to store previous event because ReactQuery sets data to undefined before the fresh data is available when I make a new query and it makes everything flash */
  const [cachedEvent, setCachedEvent] = useState<EventResponse | undefined>(undefined);

  const {
    data: identificationEvent,
    isLoading: isLoadingServerResponse,
    error: serverError,
  } = useQuery<EventResponse | undefined>(
    [requestId],
    () =>
      fetch(`/api/event/${agentResponse?.requestId}`, { method: 'POST' }).then((res) => {
        if (res.status !== 200) {
          throw new Error(`${res.statusText}`);
        }
        return res.json();
      }),
    { enabled: Boolean(agentResponse), retry: false, onSuccess: (data) => setCachedEvent(data) },
  );

  return {
    agentResponse,
    isLoadingAgentResponse,
    getAgentData,
    agentError,
    cachedEvent,
    identificationEvent,
    isLoadingServerResponse,
    serverError,
  };
}
