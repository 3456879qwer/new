import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TypewriterEffectProps {
  text: string;
  delay?: number; 
  typingSpeed?: number; 
  eraseSpeed?: number; 
  pauseAfterType?: number; 
  pauseAfterErase?: number; 
  loop?: boolean; 
  cursorChar?: string; 
  className?: string;
  onComplete?: () => void; 
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  text,
  delay = 500,
  typingSpeed = 100,
  eraseSpeed = 50,
  pauseAfterType = 2000,
  pauseAfterErase = 500,
  loop = false,
  cursorChar = '_',
  className,
  onComplete,
}) => {
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);


  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500); // Blink every 500ms
    return () => clearInterval(cursorInterval);
  }, []);


  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isTyping && charIndex < text.length) {
      timeout = setTimeout(() => {
        setCurrentText(text.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, typingSpeed + (charIndex === 0 ? delay : 0)); 
    } else if (isTyping && charIndex === text.length) {

      if (loop) {
        timeout = setTimeout(() => {
          setIsTyping(false);
          setIsDeleting(true);
        }, pauseAfterType);
      } else if (onComplete) {
        onComplete();
      }
    } else if (isDeleting && currentText.length > 0) {

      timeout = setTimeout(() => {
        setCurrentText(prev => prev.substring(0, prev.length - 1));
      }, eraseSpeed);
    } else if (isDeleting && currentText.length === 0) {

      timeout = setTimeout(() => {
        setIsDeleting(false);
        setIsTyping(true);
        setCharIndex(0);
      }, pauseAfterErase);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isTyping, isDeleting, text, typingSpeed, eraseSpeed, pauseAfterType, pauseAfterErase, loop, delay, onComplete, currentText.length]);


  return (
    <span className={`inline-block relative ${className}`}>
      {currentText}
      <motion.span
        initial={{ opacity: 1 }}
        animate={{ opacity: cursorVisible ? 1 : 0 }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        className="absolute inline-block w-px ml-1 bg-jay-orange -bottom-px" 
        style={{ left: currentText.length > 0 ? '100%' : '0' }} 
      >
        {cursorChar}
      </motion.span>
    </span>
  );
};

export default TypewriterEffect;