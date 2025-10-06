import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-4',
  };

  return (
    <div className={`
      ${sizeClasses[size]}
      animate-spin rounded-full border-jax-blue border-t-transparent
    `} role="status" aria-label="Loading...">
    </div>
  );
};

export default Spinner;
