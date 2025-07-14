import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { EventsGetResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';
import { useEffect } from 'react';
import { useCallbackRef } from '../../../client/hooks/useCallbackRef';
import { useSessionId } from '../../../client/hooks/useSessionId';

export function usePlaygroundSignals(config?: { onServerApiSuccess?: (data: EventsGetResponse) => void }) {
  const sessionId = useSessionId();

  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData(
    {
      extendedResult: true,
      ignoreCache: true,
      timeout: FPJS_CLIENT_TIMEOUT,
      /**
       * Use a simple session ID to demonstrate linkedId functionality and linked-ID-based velocity signals
       * https://dev.fingerprint.com/docs/tagging-information#using-linkedid-and-tag-on-the-client
       * https://dev.fingerprint.com/docs/smart-signals-reference#velocity-signals
       */
      linkedId: sessionId,
    },
    { immediate: true },
  );

  const requestId = agentResponse?.requestId;

  const {
    data: identificationEvent,
    isPending: isPendingServerResponse,
    isSuccess: isSuccessServerResponse,
    error: serverError,
  } = useQuery<EventsGetResponse | undefined>({
    queryKey: [requestId],
    queryFn: async () => {
      const res = await fetch(`/api/event/${agentResponse?.requestId}`, { method: 'POST' });
      if (res.status !== 200) {
        throw new Error(res.statusText);
      }
      return res.json();
    },
    enabled: Boolean(agentResponse),
    retry: false,
    placeholderData: keepPreviousData,
  });

  const onServerApiSuccessCallback = useCallbackRef(config?.onServerApiSuccess);

  // Call the callback on every successful Server API request
  useEffect(() => {
    if (isSuccessServerResponse && identificationEvent) {
      onServerApiSuccessCallback(identificationEvent);
    }
  }, [identificationEvent, isSuccessServerResponse, onServerApiSuccessCallback]);

  return {
    agentResponse,
    isLoadingAgentResponse,
    getAgentData,
    agentError,
    identificationEvent,
    isPendingServerResponse,
    serverError,
  };
}
