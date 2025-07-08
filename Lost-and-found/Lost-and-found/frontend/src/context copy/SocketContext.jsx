import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;
    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });
    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
    newSocket.on('disconnect', () => console.log('Socket disconnected'));
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, [token]);

  const joinChat = (itemId) => socket?.emit('join_item_chat', itemId);
  const leaveChat = (itemId) => socket?.emit('leave_item_chat', itemId);
  const sendMessage = (itemId, content) => socket?.emit('send_message', { itemId, content });

  return (
    <SocketContext.Provider value={{ socket, joinChat, leaveChat, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};