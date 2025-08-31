import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import NotificationToast from '@/components/NotificationToast'; 
import { v4 as uuidv4 } from 'uuid';
import 'uuid'; 

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showNotification: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);


  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 5000) => {
    const id = uuidv4();
    const newNotification: Notification = { id, message, type };

    setNotifications((prev) => [...prev, newNotification]);


    if (duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, duration);
    }
  }, []);


  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      <div className="fixed bottom-4 right-4 z-[6000] flex flex-col items-end"> 
        <AnimatePresence>
          {notifications.map((notification) => (
            <NotificationToast
              key={notification.id}
              id={notification.id}
              message={notification.message}
              type={notification.type}
              onDismiss={dismissNotification}
            />
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};