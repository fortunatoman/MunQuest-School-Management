import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'role-select' | 'role-select-active';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'btn font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[#A88554] hover:bg-[#9a7849] text-white focus:ring-[#A88554] shadow-lg',
    secondary: 'bg-[#1E395D] hover:bg-[#1a324f] text-white focus:ring-[#1E395D]',
    outline: 'bg-white border border-gray-300 hover:border-gray-400 text-gray-700 focus:ring-gray-300',
    'role-select': 'bg-white border border-gray-300 hover:border-gray-400 text-gray-700 focus:ring-gray-300',
    'role-select-active': 'bg-[#C7A87D] hover:bg-[#b89a6a] text-white border border-[#C7A87D] focus:ring-[#C7A87D] shadow-lg'
  };

  const sizeClasses = {
    small: 'px-3 py-1 text-xs',
    medium: 'px-5 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;
