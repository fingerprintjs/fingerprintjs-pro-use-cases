import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useVisitorData } from '../../use-visitor-data';
import { apiRequest } from '../api';
import { GetResult } from '@fingerprintjs/fingerprintjs-pro';
import { useCallback, useEffect, useMemo } from 'react';

type UserPreferences = {
  hasDarkMode: boolean;
};

type UserPreferencesResponse = {
  data: UserPreferences;
};

const GET_USER_PREFERENCES_QUERY = 'GET_USER_PREFERENCES_QUERY';

function getUserPreferencesFromServer(fpData: GetResult, abortSignal: AbortSignal): Promise<UserPreferencesResponse> {
  return apiRequest('/api/personalization/get-user-preferences', fpData, {}, abortSignal);
}

function updateUserPreferencesOnServer(fpData: GetResult, preferences: UserPreferences) {
  return apiRequest('/api/personalization/update-user-preferences', fpData, preferences);
}

export function useUserPreferences() {
  // Get visitorId
  const { data: fingerprintResult } = useVisitorData();

  // An abort controller to cancel the query if the user changes dark mode while the query is still loading
  const abortController = useMemo(() => new AbortController(), []);

  // Query database for user preferences for this visitorId
  const { data: preferencesResponse } = useQuery(
    GET_USER_PREFERENCES_QUERY,
    () => getUserPreferencesFromServer(fingerprintResult, abortController.signal),
    {
      enabled: Boolean(fingerprintResult),
      onSuccess: (data) => {
        // Store the result in localStorage to get it faster on page reload
        localStorage.setItem('hasDarkMode', String(data?.data?.hasDarkMode));
      },
    }
  );

  // Use the same query object to update preferences synchronously further down
  const queryClient = useQueryClient();
  const updateUserPreferencesOnClient = useCallback(
    (data: UserPreferences) => {
      queryClient.setQueryData<UserPreferencesResponse>(GET_USER_PREFERENCES_QUERY, { data });
    },
    [queryClient]
  );

  // On component mount, set the query state of the user preferences to the value stored in localStorage
  // (to prevent a long flash of light mode while waiting for userPreferencesQuery)
  useEffect(() => {
    updateUserPreferencesOnClient({ hasDarkMode: localStorage.getItem('hasDarkMode') === 'true' });
  }, [updateUserPreferencesOnClient]);

  // Mutation to update user preferences in the database
  const updateUserPreferencesMutation = useMutation<unknown, unknown, UserPreferences>(
    (preferences) => updateUserPreferencesOnServer(fingerprintResult, preferences),
    {
      onMutate: (data) => {
        // Also optimistically updates the query data and localStorage switches to dark mode immediately, regardless of the database request result)
        updateUserPreferencesOnClient(data);
        localStorage.setItem('hasDarkMode', String(data.hasDarkMode));
        // If user changes dark mode while the query is still loading, cancel the query
        abortController.abort();
      },
    }
  );

  return {
    hasDarkMode: Boolean(preferencesResponse?.data?.hasDarkMode),
    updateUserPreferences: updateUserPreferencesMutation.mutate,
  };
}
