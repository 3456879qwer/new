import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  disabled = false,
  ...rest
}) => {
  const baseClasses = 'py-3 px-8 font-bold rounded-2xl transition-all duration-300 transform ';
  let variantClasses = '';
  let hoverShadow = '';

  switch (variant) {
    case 'primary':
      variantClasses = 'bg-jay-orange text-jay-black';
      hoverShadow = 'hover:bg-opacity-90 shadow-neon'; // Already defined
      break;
    case 'secondary':
      variantClasses = 'border border-jay-orange text-jay-orange';
      hoverShadow = 'hover:bg-jay-orange hover:text-jay-black shadow-neon-outline'; // Already defined
      break;
    case 'danger':
      variantClasses = 'bg-red-600 text-jay-white';
      hoverShadow = 'hover:bg-red-700 shadow-md';
      break;
    default:
      break;
  }

  if (disabled) {
    variantClasses = 'bg-jay-gray-light text-jay-gray-dark cursor-not-allowed';
    hoverShadow = ''; 
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className={`${baseClasses} ${variantClasses} ${hoverShadow} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default AnimatedButton;