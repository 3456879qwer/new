import React from 'react';
import { motion } from 'framer-motion';

interface CyberLoaderProps {
  message?: string;
}

const loadingVariants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const charVariants = {
  animate: {
    opacity: [0.2, 1, 0.2],
    y: [0, -5, 0],
    transition: (i: number) => ({
      delay: i * 0.1,
      duration: 1.2,
      repeat: Infinity,
      ease: "easeInOut"
    })
  }
};

const CyberLoader: React.FC<CyberLoaderProps> = ({ message = "Processing Data..." }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-8 bg-jay-black border border-jay-orange border-opacity-50 rounded-lg shadow-neon-outline"
      variants={loadingVariants}
      initial="animate" 
      animate="animate"
    >
      <p className="text-4xl font-orbitron text-jay-orange mb-4 select-none">
        {message.split("").map((char, i) => (
          <motion.span key={i} variants={charVariants} custom={i} className="inline-block">
            {char === " " ? "\u00A0" : char} 
          </motion.span>
        ))}
      </p>
      <div className="w-24 h-2 bg-jay-gray-dark rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-jay-orange shadow-neon-outline"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
};

export default CyberLoader;