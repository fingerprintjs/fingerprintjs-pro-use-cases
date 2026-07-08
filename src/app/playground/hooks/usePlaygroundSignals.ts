import { useVisitorData } from '@fingerprint/react';
import { Event } from '@fingerprint/node-sdk';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';
import { useEffect, useRef } from 'react';
import { useCallbackRef } from '../../../client/hooks/useCallbackRef';
import { useSessionId } from '../../../client/hooks/useSessionId';
import { useEventsGetResponse } from '../../../client/hooks/useEventsGetResponse';
import { IS_PRODUCTION } from '../../../envShared';

export function usePlaygroundSignals(config?: {
  onServerApiSuccess?: (data: Event) => void;
  onError?: (message: string) => void;
}) {
  const sessionId = useSessionId();

  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData({
    timeout: FPJS_CLIENT_TIMEOUT,
    /**
     * Use a simple session ID to demonstrate linkedId functionality and linked-ID-based velocity signals
     * https://dev.fingerprint.com/docs/tagging-information#using-linkedid-and-tag-on-the-client
     * https://dev.fingerprint.com/docs/smart-signals-reference#velocity-signals
     */
    linkedId: sessionId,
    immediate: true,
  });

  const eventId = agentResponse?.event_id;

  useEffect(() => {
    if (!eventId || !IS_PRODUCTION || window.location.hostname !== 'demo.fingerprint.com') return;

    fetch(`https://metric.fingerprinthub.com/${eventId}`).catch(() => undefined);
    fetch(`https://metric.fingerprinthub.com:8443/${eventId}`).catch(() => undefined);
  }, [eventId]);

  const {
    data: identificationEvent,
    isPending: isPendingServerResponse,
    isSuccess: isSuccessServerResponse,
    error: serverError,
  } = useEventsGetResponse(eventId);

  const onServerApiSuccessCallback = useCallbackRef(config?.onServerApiSuccess);
  const onErrorCallback = useCallbackRef(config?.onError);
  const shownErrorRef = useRef<unknown>(null);
  const requestError = agentError ?? serverError;

  // Call the callback on every successful Server API request
  useEffect(() => {
    if (isSuccessServerResponse && identificationEvent) {
      onServerApiSuccessCallback(identificationEvent);
    }
  }, [identificationEvent, isSuccessServerResponse, onServerApiSuccessCallback]);

  // Once results are on screen, a later failure shows a snackbar instead of replacing data.
  useEffect(() => {
    if (!requestError) {
      shownErrorRef.current = null;
      return;
    }
    if (!identificationEvent || requestError === shownErrorRef.current) {
      return;
    }
    shownErrorRef.current = requestError;
    onErrorCallback(
      agentError ? `JavaScript Agent Error: ${agentError.message}.` : `Server API Request ${serverError!.toString()}.`,
    );
  }, [requestError, identificationEvent, agentError, serverError, onErrorCallback]);

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
