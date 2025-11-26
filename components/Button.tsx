

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  iconOnly?: boolean; // New prop for icon-only buttons
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  disabled,
  iconOnly = false, // Default to false
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-opacity-75 transition ease-in-out duration-150 flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-400',
    danger: 'bg-red-700 hover:bg-red-800 text-white focus:ring-red-700',
    ghost: 'bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-gray-600',
  };

  const sizeStyles = {
    sm: iconOnly ? 'p-1' : 'px-3 py-1.5 text-sm', // Adjusted for iconOnly
    md: iconOnly ? 'p-2' : 'px-4 py-2 text-base', // Adjusted for iconOnly
    lg: iconOnly ? 'p-3' : 'px-6 py-3 text-lg', // Adjusted for iconOnly
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';
  const loadingStyles = 'cursor-wait opacity-70';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? disabledStyles : ''} ${loading ? loadingStyles : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};

export default Button;