"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  message: string;
  data?: {
    projectTitle?: string;
    taskTitle?: string;
  };
  read: boolean;
  timestamp: string;
}

const NotificationToast = () => {
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);
  const notifications = useSelector((state: RootState) => state.notification.notifications);
  const [displayedIds, setDisplayedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Filter out notifications that have already been displayed
    const newNotifications = notifications.filter(
      (n: Notification) => !displayedIds.has(n.id)
    );

    if (newNotifications.length > 0) {
      // Add new notification IDs to the displayed set
      setDisplayedIds(prev => {
        const newSet = new Set(prev);
        newNotifications.forEach(n => newSet.add(n.id));
        return newSet;
      });

      // Add new notifications to display
      setVisibleNotifications(prev => [...prev, ...newNotifications]);

      // Set timeout to remove notifications after 5 seconds
      const timer = setTimeout(() => {
        setVisibleNotifications(prev => 
          prev.filter(n => !newNotifications.some(nn => nn.id === n.id))
        );
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setVisibleNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Notification type colors
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'PROJECT_CREATED':
        return 'border-green-500';
      case 'TASK_COMPLETED':
        return 'border-purple-500';
      case 'TASK_ASSIGNED':
        return 'border-blue-500';
      default:
        return 'border-orange-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={`relative bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 w-64 border-l-4 ${getNotificationColor(notification.type)}`}
          >
            <button
              onClick={() => handleDismiss(notification.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
            
            <div className="font-semibold text-gray-800 dark:text-gray-100">
              {notification.message}
            </div>
            
            {notification.data?.projectTitle && (
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Project: {notification.data.projectTitle}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {notification.type.replace(/_/g, ' ')}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;