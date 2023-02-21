import { createContext, useContext, useState } from 'react';
import { useMount } from 'react-use';
import io from 'socket.io-client';

const Context = createContext({});

/**
 * @returns {io.Socket | undefined} socket
 * */
export function useSocketInstance() {
  return useContext(Context);
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState();

  useMount(() => {
    fetch('/api/socket')
      .then(() => {
        const socket = io();

        setSocket(socket);

        socket.on('connect', () => {
          console.debug('Socket connected', socket);
        });
      })
      .catch(console.error);
  });

  return <Context.Provider value={socket}>{children}</Context.Provider>;
}
