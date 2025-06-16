import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from './ui';

interface PageLoaderProps {
  children: React.ReactNode;
  loadingText?: string;
  delay?: number; // delay in milliseconds, default 1000ms (1 second)
}

const PageLoader: React.FC<PageLoaderProps> = ({ 
  children, 
  loadingText = 'Loading...',
  delay = 1000 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading for the specified delay (default 1 second)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="large" text={loadingText} />
      </div>
    );
  }

  return <>{children}</>;
};

export default PageLoader;
