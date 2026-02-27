import { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95',
        variant === 'primary' && 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
        variant === 'secondary' && 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400',
        variant === 'ghost' && 'bg-transparent hover:bg-gray-100 text-gray-600 focus:ring-gray-300',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
