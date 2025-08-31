import React from 'react';
import { motion } from 'framer-motion';

interface NotificationToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ id, message, type, onDismiss }) => {
  let bgColorClass = '';
  let borderColorClass = '';
  let textColorClass = 'text-jay-white'; 

  switch (type) {
    case 'success':
      bgColorClass = 'bg-green-600/20'; 
      borderColorClass = 'border-green-500';
      textColorClass = 'text-green-300';
      break;
    case 'error':
      bgColorClass = 'bg-red-600/20'; 
      borderColorClass = 'border-red-500';
      textColorClass = 'text-red-300';
      break;
    case 'info':
      bgColorClass = 'bg-blue-600/20'; 
      borderColorClass = 'border-blue-500';
      textColorClass = 'text-blue-300';
      break;
    default:
      bgColorClass = 'bg-jay-black/50';
      borderColorClass = 'border-jay-orange';
      break;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      className={`p-4 rounded-lg shadow-xl mb-4 w-full max-w-sm flex items-center justify-between space-x-4
        ${bgColorClass} ${borderColorClass} border`}
      style={{ backdropFilter: 'blur(5px)' }} 
    >
      <p className={`flex-grow font-poppins text-sm ${textColorClass}`}>{message}</p>
      <button onClick={() => onDismiss(id)} className="text-jay-white opacity-70 hover:opacity-100 transition-opacity">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

export default NotificationToast;