import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useVisitorData } from '../../use-visitor-data';
import { apiRequest } from '../api';
import { GetResult } from '@fingerprintjs/fingerprintjs-pro';

type UserPreferences = {
  hasDarkMode: boolean;
};

const GET_USER_PREFERENCES_QUERY = 'GET_USER_PREFERENCES_QUERY';

function getUserPreferences(fpData: GetResult): Promise<UserPreferences> {
  return apiRequest('/api/personalization/get-user-preferences', fpData);
}

function updateUserPreferences(fpData: GetResult, preferences: UserPreferences) {
  return apiRequest('/api/personalization/update-user-preferences', fpData, preferences);
}

export function useUserPreferences() {
  const { data: fingerprintResult } = useVisitorData();
  const queryClient = useQueryClient();

  const userPreferencesQuery = useQuery(GET_USER_PREFERENCES_QUERY, () => getUserPreferences(fingerprintResult), {
    enabled: Boolean(fingerprintResult),
  });

  const updateUserPreferencesMutation = useMutation<unknown, unknown, UserPreferences>(
    (preferences) => updateUserPreferences(fingerprintResult, preferences),
    {
      onMutate: (data) => {
        queryClient.setQueryData(GET_USER_PREFERENCES_QUERY, data);
      },
    }
  );

  const hasDarkMode = Boolean(userPreferencesQuery?.data?.hasDarkMode);

  return {
    hasDarkMode,
    update: (preferences: UserPreferences) => updateUserPreferencesMutation.mutate(preferences),
  };
}
