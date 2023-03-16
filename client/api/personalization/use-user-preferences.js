// @ts-check
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useVisitorData } from '../../use-visitor-data';
import { apiRequest } from '../api';

const GET_USER_PREFERENCES_QUERY = 'GET_USER_PREFERENCES_QUERY';

function getUserPreferences(fpData) {
  return apiRequest('/api/personalization/get-user-preferences', fpData);
}

function updateUserPreferences(fpData, hasDarkMode) {
  return apiRequest('/api/personalization/update-user-preferences', fpData, { hasDarkMode });
}

export function useUserPreferences() {
  const { data: fpData } = useVisitorData();

  const queryClient = useQueryClient();

  const userPreferencesQuery = useQuery(GET_USER_PREFERENCES_QUERY, () => getUserPreferences(fpData), {
    enabled: Boolean(fpData),
  });
  const updateUserPreferencesMutation = useMutation(
    // @ts-ignore
    (variables) => updateUserPreferences(fpData, variables.hasDarkMode),
    {
      onSuccess: async (data) => {
        if (data) {
          await queryClient.setQueryData(GET_USER_PREFERENCES_QUERY, data);
        }
      },
    }
  );

  const hasDarkMode = Boolean(userPreferencesQuery?.data?.data?.hasDarkMode);

  return {
    hasDarkMode,
    update: updateUserPreferencesMutation.mutate,
  };
}
