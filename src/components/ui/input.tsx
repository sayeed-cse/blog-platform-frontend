import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none ring-0 placeholder:text-slate-400 focus:border-blue-500',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
