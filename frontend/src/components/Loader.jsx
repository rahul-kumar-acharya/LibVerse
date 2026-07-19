import React from 'react';

const Loader = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-t-indigo-600 border-r-transparent border-b-indigo-600 border-l-transparent rounded-full animate-spin`}
      />
    </div>
  );
};

export default Loader;
