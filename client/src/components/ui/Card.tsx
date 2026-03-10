import type React from 'react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div
    className={`bg-card-bg border border-card-border rounded-2xl shadow-md ${className}`}
  >
    {children}
  </div>
);
