import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useVisitorData } from '../../../shared/client/useVisitorData';

const GET_USER_PREFERENCES_QUERY = 'GET_USER_PREFERENCES_QUERY';

function getUserPreferences(fpData) {
  return fetch(`/api/personalization/get-user-preferences`, {
    method: 'POST',
    body: JSON.stringify({
      requestId: fpData.requestId,
      visitorId: fpData.visitorId,
    }),
  }).then((res) => res.json());
}

function updateUserPreferences(fpData, hasDarkMode) {
  return fetch(`/api/personalization/update-user-preferences`, {
    method: 'POST',
    body: JSON.stringify({
      hasDarkMode,
      requestId: fpData.requestId,
      visitorId: fpData.visitorId,
    }),
  }).then((res) => res.json());
}

export function useUserPreferences() {
  const { data: fpData } = useVisitorData();

  const queryClient = useQueryClient();

  const userPreferencesQuery = useQuery(GET_USER_PREFERENCES_QUERY, () => getUserPreferences(fpData), {
    enabled: Boolean(fpData),
  });
  const updateUserPreferencesMutation = useMutation(
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
