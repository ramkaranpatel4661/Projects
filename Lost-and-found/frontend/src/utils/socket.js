// frontend/src/utils/socket.js
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token') // or however you store your JWT
  },
  transports: ['websocket'],
  withCredentials: true
});

export { socket };
