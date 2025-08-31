import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from './AnimatedButton'; 

interface OnboardingTooltipProps {
  storageKey: string; 
  title: string;
  message: string | ReactNode;
  delay?: number; 
  onDismiss?: () => void; 
}

const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  storageKey,
  title,
  message,
  delay = 1000, 
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(true); 

  useEffect(() => {

    const seenBefore = localStorage.getItem(storageKey);
    if (!seenBefore) {
      setHasBeenSeen(false);

      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [storageKey, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true'); 
    if (onDismiss) {
      onDismiss();
    }
  };

  if (hasBeenSeen && !isVisible) { 
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-jay-black p-6 rounded-lg border border-jay-orange shadow-lg text-jay-white text-center"
        >
          <h3 className="text-2xl font-orbitron text-jay-orange mb-3 holographic-text">{title}</h3>
          <p className="font-poppins text-jay-gray-light text-sm mb-4">{message}</p>
          <AnimatedButton onClick={handleDismiss} className="px-4 py-2 text-sm">
            Got it!
          </AnimatedButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTooltip;