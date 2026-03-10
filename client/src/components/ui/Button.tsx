import type React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

const variants = {
  primary:
    'bg-pipe-green hover:bg-pipe-dark text-white shadow-md hover:shadow-lg',
  secondary:
    'bg-white hover:bg-gray-50 text-text-dark border border-card-border',
  danger:
    'bg-red-100 hover:bg-red-200 text-red-600 border border-red-300',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`font-bold rounded-xl transition-all duration-200 flex items-center justify-center
      disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
      ${variants[variant]} ${className}`}
  >
    {children}
  </button>
);
