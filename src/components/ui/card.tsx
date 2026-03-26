import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-800 bg-slate-900/70 shadow-soft backdrop-blur',
        className
      )}
      {...props}
    />
  );
}
