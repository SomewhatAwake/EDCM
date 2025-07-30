import React, {createContext, useContext, useEffect, useState} from 'react';
import io from 'socket.io-client';
import {useAuth} from './AuthContext';
import {API_BASE_URL} from '../config';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({children}) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const {token, isAuthenticated} = useAuth();

  useEffect(() => {
    if (isAuthenticated && token) {
      const newSocket = io(API_BASE_URL, {
        auth: {
          token: token,
        },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, token]);

  const subscribeToCarrierUpdates = (carrierId) => {
    if (socket) {
      socket.emit('subscribe_carrier_updates', carrierId);
    }
  };

  const unsubscribeFromCarrierUpdates = (carrierId) => {
    if (socket) {
      socket.emit('unsubscribe_carrier_updates', carrierId);
    }
  };

  const value = {
    socket,
    connected,
    subscribeToCarrierUpdates,
    unsubscribeFromCarrierUpdates,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
