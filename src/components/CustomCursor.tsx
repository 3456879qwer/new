import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', mouseMove);

    return () => {
      window.removeEventListener('mousemove', mouseMove);
    };
  }, []);

  const variants = {
    default: {
      x: mousePosition.x - 8, 
      y: mousePosition.y - 8,
      backgroundColor: 'var(--color-jay-orange)',
      boxShadow: '0 0 10px var(--color-jay-orange), 0 0 20px var(--color-jay-orange), 0 0 30px var(--color-jay-orange)',
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 150,
        mass: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={variants}
      animate="default"
      className="fixed w-4 h-4 rounded-full pointer-events-none z-[9999] opacity-70" 
      style={{

        top: 0,
        left: 0,
        transform: 'translate3d(0,0,0)',
      }}
    />
  );
};

export default CustomCursor;