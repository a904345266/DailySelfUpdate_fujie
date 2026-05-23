'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number; // 1-5 (or 0 = unset)
  onChange: (value: number) => void;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function StarRating({ value, onChange, max = 5, disabled, className }: StarRatingProps) {
  return (
    <div className={cn('flex gap-1', className)} role="radiogroup">
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          disabled={disabled}
          onClick={() => onChange(n)}
          className={cn(
            'rounded p-0.5 transition-colors',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-label={`${n} 星`}
        >
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              n <= value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground hover:text-yellow-400'
            )}
          />
        </button>
      ))}
    </div>
  );
}
