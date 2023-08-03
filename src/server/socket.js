/**
 * @return import('socket.io').Socket
 * */
export function extractSocketServer(req) {
  return req?.socket?.server?.io;
}
