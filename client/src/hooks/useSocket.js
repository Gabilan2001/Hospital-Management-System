import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addNotification } from '../features/notification/notificationSlice';
import { updateQueue } from '../features/queue/queueSlice';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (userId) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    socketRef.current = io(SOCKET_URL, { withCredentials: true });

    socketRef.current.emit('join-room', `user-${userId}`);

    socketRef.current.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });

    socketRef.current.on('queue-update', (data) => {
      dispatch(updateQueue(data));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId, dispatch]);

  return socketRef;
};

export const useQueueSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.emit('join-room', 'queue-display');

    socketRef.current.on('queue-update', () => {
      fetch(`${import.meta.env.VITE_API_URL}/queue/display`)
        .then((res) => res.json())
        .then((data) => dispatch(updateQueue(data.data)));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [dispatch]);

  return socketRef;
};

export default useSocket;
