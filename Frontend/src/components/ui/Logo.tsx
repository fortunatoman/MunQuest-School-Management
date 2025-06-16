import React from 'react';
import logoImage from '../../assets/Logo.png';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'figma';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-6 w-auto',
    medium: 'h-10 w-auto',
    large: 'h-12 w-auto',
    figma: 'w-[375px] h-[82px] flex-shrink-0'
  };

  return (
    <div className={`flex items-center justify-start ${className}`}>
      <img 
        src={logoImage} 
        alt="MunQuest Logo" 
        className={`${sizeClasses[size]} object-contain`}
      />
    </div>
  );
};

export default Logo;
