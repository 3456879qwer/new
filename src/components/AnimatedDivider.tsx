import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedDividerProps {
  className?: string;
  delay?: number;
}

const AnimatedDivider: React.FC<AnimatedDividerProps> = ({ className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className={`relative w-full h-px overflow-hidden ${className}`} // h-px for a very thin line
      style={{
        background: 'linear-gradient(to right, transparent, var(--color-jay-orange), transparent)',
      }}
    >
      {/* Animated glow effect */}
      <motion.div
        className="absolute inset-0"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 3,
          ease: "linear",
          delay: delay + 0.5, 
        }}
        style={{
          background: `
            linear-gradient(to right,
              transparent 0%,
              rgba(255, 255, 255, 0.1) 40%,
              rgba(255, 165, 0, 0.6) 50%, /* Brightest part of scan */
              rgba(255, 255, 255, 0.1) 60%,
              transparent 100%
            )
          `,
        }}
      />
    </motion.div>
  );
};

export default AnimatedDivider;