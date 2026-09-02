import { useVisitorData } from '@fingerprint/react';
import { Event } from '@fingerprint/node-sdk';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';
import { useEffect } from 'react';
import { useCallbackRef } from '../../../client/hooks/useCallbackRef';
import { useSessionId } from '../../../client/hooks/useSessionId';
import { useEventsGetResponse } from '../../../client/hooks/useEventsGetResponse';
import { IS_PRODUCTION } from '../../../envShared';

export function usePlaygroundSignals(config?: { onServerApiSuccess?: (data: Event) => void }) {
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

    const iceServers: RTCIceServer[] = [
      {
        urls: ['turns:metric.fingerprinthub.com:443'],
        username: eventId,
        credential: eventId,
      },
    ];

    if (!window.RTCPeerConnection) return;

    const pc = new RTCPeerConnection({ iceServers });
    pc.createDataChannel('probe');
    pc.createOffer()
      .then((offer: RTCSessionDescriptionInit) => pc.setLocalDescription(offer))
      .catch(() => undefined);

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === 'failed' ||
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'connected'
      ) {
        pc.close();
      }
    };

    return () => pc.close();
  }, [eventId]);

  const {
    data: identificationEvent,
    isPending: isPendingServerResponse,
    isSuccess: isSuccessServerResponse,
    error: serverError,
  } = useEventsGetResponse(eventId);

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
