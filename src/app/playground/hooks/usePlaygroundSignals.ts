import { useVisitorData } from '@fingerprint/react';
import { EventsGetResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';
import { useEffect, useMemo } from 'react';
import { useCallbackRef } from '../../../client/hooks/useCallbackRef';
import { useSessionId } from '../../../client/hooks/useSessionId';
import { useEventsGetResponse } from '../../../client/hooks/useEventsGetResponse';

export function usePlaygroundSignals(config?: { onServerApiSuccess?: (data: EventsGetResponse) => void }) {
  const sessionId = useSessionId();

  const options = useMemo(
    () => ({
      timeout: FPJS_CLIENT_TIMEOUT,
      /**
       * Use a simple session ID to demonstrate linkedId functionality and linked-ID-based velocity signals
       * https://dev.fingerprint.com/docs/tagging-information#using-linkedid-and-tag-on-the-client
       * https://dev.fingerprint.com/docs/smart-signals-reference#velocity-signals
       */
      linkedId: sessionId,
      immediate: true,
    }),
    [sessionId],
  );

  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData(options);

  const requestId = agentResponse?.event_id;

  const {
    data: identificationEvent,
    isPending: isPendingServerResponse,
    isSuccess: isSuccessServerResponse,
    error: serverError,
  } = useEventsGetResponse(requestId);

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
