'use client';

import { cn } from '@/lib/utils';

interface WaveTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function WaveText({ text, className, delay = 0.05 }: WaveTextProps) {
  return (
    <span className={cn('inline-flex', className)}>
      {text.split('').map((char, index) => (
        <span
          key={index}
          className="inline-block animate-wave"
          style={{
            animationDelay: `${index * delay}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}
