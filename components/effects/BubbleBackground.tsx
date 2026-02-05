'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Bubble {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  opacity: number;
  hue: number;
}

interface BubbleBackgroundProps {
  className?: string;
  bubbleCount?: number;
  interactive?: boolean;
}

export function BubbleBackground({
  className = '',
  bubbleCount = 25,
  interactive = true
}: BubbleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubblesRef = useRef<Bubble[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  const createBubble = useCallback((canvas: HTMLCanvasElement, atMouse = false): Bubble => {
    const x = atMouse ? mouseRef.current.x : Math.random() * canvas.width;
    const y = atMouse ? mouseRef.current.y : canvas.height + Math.random() * 100;
    return {
      x,
      y,
      radius: Math.random() * 20 + 5,
      dx: (Math.random() - 0.5) * 0.5,
      dy: -Math.random() * 1.5 - 0.5,
      opacity: Math.random() * 0.3 + 0.1,
      hue: Math.random() * 30 + 165, // Teal range (165-195)
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize bubbles
    bubblesRef.current = Array.from({ length: bubbleCount }, () => createBubble(canvas));

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleClick = () => {
      if (interactive) {
        // Spawn burst of bubbles on click
        for (let i = 0; i < 5; i++) {
          bubblesRef.current.push(createBubble(canvas, true));
        }
      }
    };

    if (interactive) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('click', handleClick);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      bubblesRef.current.forEach((bubble, index) => {
        // Update position
        bubble.x += bubble.dx;
        bubble.y += bubble.dy;

        // Mouse interaction - bubbles are gently pushed away
        if (interactive) {
          const dx = bubble.x - mouseRef.current.x;
          const dy = bubble.y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            bubble.dx += dx * 0.001;
            bubble.dy += dy * 0.001;
          }
        }

        // Gentle floating motion
        bubble.dx += (Math.random() - 0.5) * 0.02;
        bubble.dx *= 0.99; // Damping

        // Reset bubble if it goes off screen
        if (bubble.y < -bubble.radius * 2 || bubble.x < -50 || bubble.x > canvas.offsetWidth + 50) {
          bubblesRef.current[index] = createBubble(canvas);
        }

        // Draw bubble
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);

        // Gradient fill for 3D effect
        const gradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          0,
          bubble.x,
          bubble.y,
          bubble.radius
        );
        gradient.addColorStop(0, `hsla(${bubble.hue}, 70%, 80%, ${bubble.opacity * 0.8})`);
        gradient.addColorStop(0.5, `hsla(${bubble.hue}, 60%, 70%, ${bubble.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${bubble.hue}, 50%, 60%, ${bubble.opacity * 0.2})`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // Highlight
        ctx.beginPath();
        ctx.arc(
          bubble.x - bubble.radius * 0.3,
          bubble.y - bubble.radius * 0.3,
          bubble.radius * 0.2,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.8})`;
        ctx.fill();
      });

      // Keep bubble count in check
      if (bubblesRef.current.length > bubbleCount * 2) {
        bubblesRef.current = bubblesRef.current.slice(-bubbleCount);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (interactive) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('click', handleClick);
      }
      cancelAnimationFrame(animationRef.current);
    };
  }, [bubbleCount, interactive, createBubble]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-auto ${className}`}
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
