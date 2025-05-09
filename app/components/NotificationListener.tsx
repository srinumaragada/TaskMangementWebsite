"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { webSocketService } from "../services/websocket";
import { addNotification } from "../redux/slice/notificationSlice";

const NotificationListener = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.Auth.isAuthenticated);
  const userId = useSelector((state: RootState) => state.Auth.user?.id);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;

    console.log('Initializing notification listener for user:', userId);

    const handleIncomingNotification = (message: any) => {
      console.log('Received raw notification:', message);
      
      if (!message?.type || !message?.message) {
        console.error('Invalid notification format:', message);
        return;
      }

      const notification = {
        id: `${message.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: message.type,
        message: message.message,
        data: message.data || {},
        read: false,
        timestamp: message.timestamp || new Date().toISOString()
      };

      console.log('Dispatching notification:', notification);
      dispatch(addNotification(notification));

      // Play sound if available
      if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
        try {
          const audio = new Audio("/sounds/notification.mp3");
          audio.play().catch(err => console.warn('Audio play failed:', err));
        } catch (err) {
          console.warn('Sound initialization failed:', err);
        }
      }

      // Show system notification if tab is not active
      if (typeof window !== 'undefined' && 
          document.visibilityState !== 'visible' &&
          'Notification' in window && 
          Notification.permission === 'granted') {
        new Notification(notification.message, {
          body: notification.data?.projectTitle || notification.data?.taskTitle || '',
          icon: "/logo.png"
        });
      }
    };

    // Connect with retry logic
    const connectWebSocket = async () => {
      try {
        console.log('Attempting WebSocket connection...');
        await webSocketService.connect(handleIncomingNotification);
        console.log('WebSocket connected successfully');
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        // Retry after delay
        setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      console.log('Cleaning up WebSocket connection');
      webSocketService.disconnect();
    };
  }, [dispatch, isAuthenticated, userId]);

  return null;
};

export default NotificationListener;