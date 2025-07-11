import { useSessionStorage } from 'react-use';

/**
 * Generates and provides a random ID stored in sessionStorage
 */
export const useSessionId = () => {
  const [sessionId] = useSessionStorage('fp_playground_session_id', `session_id_${crypto.randomUUID().slice(0, 8)}`);
  return sessionId;
};
