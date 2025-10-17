'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import { GlitchTextProps } from '@/app/types';

const GlitchText = memo<GlitchTextProps>(
  ({ children, scramble = false, className = '', delay = 0 }) => {
    const [displayText, setDisplayText] = useState(children);
    const [isHovered, setIsHovered] = useState(false);
    const originalText = useRef(children);

    useEffect(() => {
      originalText.current = children;
      setDisplayText(children);
    }, [children]);

    useEffect(() => {
      if (scramble && isHovered) {
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEF';
        let iterations = 0;

        const interval = setInterval(() => {
          setDisplayText(
            originalText.current
              .split('')
              .map((char, index) => {
                if (index < iterations) return originalText.current[index];
                return chars[Math.floor(Math.random() * chars.length)];
              })
              .join('')
          );

          if (iterations >= originalText.current.length) {
            clearInterval(interval);
          }
          iterations += 1;
        }, 30);

        return () => clearInterval(interval);
      } else {
        setDisplayText(children);
      }
    }, [isHovered, children, scramble]);

    return (
      <span
        className={`glitch-text ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'relative',
          display: 'inline-block',
          animationDelay: `${delay}ms`,
        }}
        role="text"
        aria-label={originalText.current}
      >
        {displayText}
      </span>
    );
  }
);

GlitchText.displayName = 'GlitchText';

export default GlitchText;
