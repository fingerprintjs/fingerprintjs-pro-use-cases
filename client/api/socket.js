import { useSocketInstance } from './socket-provider';
import { useEffect } from 'react';

export function useSocketEvent(name, callback) {
  const socket = useSocketInstance();

  useEffect(() => {
    if (!socket) {
      console.debug('Socket not available, skipping event registration', name);

      return;
    }

    socket.on(name, callback);

    console.debug('Socket event registered: ', name);

    return () => {
      socket.off(name, callback);
    };
  }, [callback, name, socket]);
}
