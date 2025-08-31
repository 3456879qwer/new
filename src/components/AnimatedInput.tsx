import React, { InputHTMLAttributes, TextareaHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  as?: 'input' | 'textarea'; 
  textareaProps?: TextareaHTMLAttributes<HTMLTextAreaElement>; 
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
  className = '',
  as = 'input',
  textareaProps,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseClasses = "w-full p-3 rounded-md bg-jay-black border text-jay-white outline-none font-poppins ";
  const focusClasses = "focus:ring-2 focus:ring-jay-orange";
  const borderClasses = isFocused ? "border-jay-orange" : "border-jay-gray-dark"; 

  const inputVariants = {
    unfocused: { borderColor: 'var(--color-jay-gray-dark)', boxShadow: 'none' },
    focused: {
      borderColor: 'var(--color-jay-orange)',
      boxShadow: '0 0 8px var(--color-jay-orange)', 
      transition: { duration: 0.2 }
    },
  };

  const Component = as === 'textarea' ? motion.textarea : motion.input;

  return (
    <Component
      className={`${baseClasses} ${focusClasses} ${borderClasses} ${className}`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      variants={inputVariants}
      initial="unfocused"
      animate={isFocused ? "focused" : "unfocused"}
      {...(as === 'textarea' ? textareaProps : {})} 
      {...rest}
    />
  );
};

export default AnimatedInput;