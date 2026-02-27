import { useEffect } from 'react';
import { cn } from '../../lib/utils';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning';
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type, onDismiss, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium',
        'animate-bounce-in',
        type === 'success' && 'bg-green-500 text-white',
        type === 'info' && 'bg-blue-500 text-white',
        type === 'warning' && 'bg-amber-500 text-white',
      )}
    >
      {message}
    </div>
  );
}
