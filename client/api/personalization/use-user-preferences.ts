import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useVisitorData } from '../../use-visitor-data';
import { apiRequest } from '../api';
import { GetResult } from '@fingerprintjs/fingerprintjs-pro';
import { useCallback, useEffect } from 'react';

type UserPreferences = {
  hasDarkMode: boolean;
};

type UserPreferencesResponse = {
  data: UserPreferences;
};

const GET_USER_PREFERENCES_QUERY = 'GET_USER_PREFERENCES_QUERY';

function getUserPreferences(fpData: GetResult): Promise<UserPreferencesResponse> {
  return apiRequest('/api/personalization/get-user-preferences', fpData);
}

function updateUserPreferences(fpData: GetResult, preferences: UserPreferences) {
  return apiRequest('/api/personalization/update-user-preferences', fpData, preferences);
}

export function useUserPreferences() {
  // Get visitorId
  const { data: fingerprintResult } = useVisitorData();

  // Query database for user preferences for this visitorId
  const userPreferencesQuery = useQuery(GET_USER_PREFERENCES_QUERY, () => getUserPreferences(fingerprintResult), {
    enabled: Boolean(fingerprintResult),
    onSuccess: (data) => {
      // Store the result in localStorage to get it faster on page reload
      localStorage.setItem('hasDarkMode', String(data?.data?.hasDarkMode));
    },
  });

  // Use the same query object to update preferences synchronously further down
  const queryClient = useQueryClient();
  const updateUserPreferencesData = useCallback(
    (data: UserPreferences) => queryClient.setQueryData<UserPreferencesResponse>(GET_USER_PREFERENCES_QUERY, { data }),
    [queryClient]
  );

  // On component mount, set the global state of the user preferences to the value stored in localStorage
  // (to prevent a long flash of light mode while waiting for userPreferencesQuery)
  useEffect(() => {
    updateUserPreferencesData({ hasDarkMode: localStorage.getItem('hasDarkMode') === 'true' });
  }, [updateUserPreferencesData]);

  // Mutation to update user preferences in the database
  const updateUserPreferencesMutation = useMutation<unknown, unknown, UserPreferences>(
    (preferences) => updateUserPreferences(fingerprintResult, preferences),
    {
      onMutate: (data) => {
        // Also optimistically updates the query data and localStorage switches to dark mode immediately, regardless of the database request result)
        updateUserPreferencesData(data);
        localStorage.setItem('hasDarkMode', String(data.hasDarkMode));
      },
    }
  );

  return {
    hasDarkMode: Boolean(userPreferencesQuery?.data?.data?.hasDarkMode),
    updateUserPreferences: (preferences: UserPreferences) => updateUserPreferencesMutation.mutate(preferences),
  };
}
