import { useVisitorData } from '@fingerprintjs/fingerprintjs-pro-react';
import { EventResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { useQuery } from '@tanstack/react-query';
import { FPJS_CLIENT_TIMEOUT } from '../../../const';
import { useWithPreviousData } from '../../../client/hooks/usePreviousQueryData';
import { useEffect } from 'react';

export function usePlaygroundSignals(config?: { onServerApiSuccess?: (data: EventResponse) => void }) {
  const {
    data: agentResponse,
    isLoading: isLoadingAgentResponse,
    getData: getAgentData,
    error: agentError,
  } = useVisitorData({ extendedResult: true, ignoreCache: true, timeout: FPJS_CLIENT_TIMEOUT }, { immediate: true });

  const requestId = agentResponse?.requestId;

  const {
    data: identificationEvent,
    previousData: previousIdentificationEvent,
    isPending: isPendingServerResponse,
    isSuccess: isSuccessServerResponse,
    error: serverError,
  } = useWithPreviousData(
    useQuery<EventResponse | undefined>({
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
    }),
  );

  useEffect(() => {
    if (isSuccessServerResponse && identificationEvent) {
      config?.onServerApiSuccess?.(identificationEvent);
    }
  }, [identificationEvent, isSuccessServerResponse, config]);

  return {
    agentResponse,
    isLoadingAgentResponse,
    getAgentData,
    agentError,
    identificationEvent,
    previousIdentificationEvent,
    isPendingServerResponse,
    serverError,
  };
}
