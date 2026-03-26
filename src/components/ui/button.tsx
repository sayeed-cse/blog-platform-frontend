import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
};

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-primary text-white hover:bg-blue-700',
  outline: 'border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800',
  ghost: 'bg-transparent text-slate-100 hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
