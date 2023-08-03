import { Server } from 'socket.io';

export default function socketHandler(req, res) {
  if (!req.socket.server.io) {
    req.socket.server.io = new Server(req.socket.server);
  }

  return res.end();
}
