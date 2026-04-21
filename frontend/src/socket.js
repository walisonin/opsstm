import { io } from 'socket.io-client';
import { getToken } from './api.js';

let socket = null;

export function connectSocket() {
  if (socket?.connected) return socket;
  if (socket) socket.disconnect();
  socket = io('/', {
    path: '/socket.io',
    auth: { token: getToken() },
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });
  return socket;
}

export function getSocket() { return socket; }

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
