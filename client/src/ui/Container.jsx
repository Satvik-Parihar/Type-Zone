import React from 'react';

/**
 * Global layout container for consistent max width and horizontal padding
 */
export default function Container({ children, className = '' }) {
  return (
    <div
      className={`container-max mx-auto px-6 sm:px-6 md:px-8 lg:px-8 xl:px-0` + (className ? ` ${className}` : '')}
      style={{ maxWidth: 1200 }}
    >
      {children}
    </div>
  );
}
