'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface FreshSparkleProps {
  children: React.ReactNode;
  className?: string;
  sparkleCount?: number;
  trigger?: 'hover' | 'always' | 'click';
}

export function FreshSparkle({
  children,
  className,
  sparkleCount = 8,
  trigger = 'hover'
}: FreshSparkleProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [isActive, setIsActive] = useState(trigger === 'always');

  const generateSparkles = () => {
    return Array.from({ length: sparkleCount }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.5,
    }));
  };

  useEffect(() => {
    if (trigger === 'always') {
      setSparkles(generateSparkles());
      const interval = setInterval(() => {
        setSparkles(generateSparkles());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [trigger, sparkleCount]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsActive(true);
      setSparkles(generateSparkles());
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsActive(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setSparkles(generateSparkles());
      setIsActive(true);
      setTimeout(() => setIsActive(false), 1000);
    }
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
      {isActive && sparkles.map((sparkle) => (
        <span
          key={sparkle.id}
          className="absolute pointer-events-none animate-sparkle"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-accent-400"
          >
            <path
              d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"
              fill="currentColor"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}
