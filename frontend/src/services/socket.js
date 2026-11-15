import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  transports: ['websocket', 'polling'],
});

export const subscribeToDevice = (deviceId) => {
  socket.emit('subscribe_device', deviceId);
};

export const unsubscribeFromDevice = (deviceId) => {
  socket.emit('unsubscribe_device', deviceId);
};
