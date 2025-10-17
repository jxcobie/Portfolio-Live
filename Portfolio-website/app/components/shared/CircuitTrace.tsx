'use client';

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { CircuitTraceProps } from '@/app/types';

const CircuitTrace = memo<CircuitTraceProps>(
  ({ startElement, endElement, delay = 0, className = '' }) => {
    const [path, setPath] = useState('');

    const calculatePath = useMemo(() => {
      return () => {
        const start = document.getElementById(startElement);
        const end = document.getElementById(endElement);

        if (start && end) {
          const startRect = start.getBoundingClientRect();
          const endRect = end.getBoundingClientRect();
          const container = start.closest('.skills-container');
          const containerRect = container?.getBoundingClientRect();

          if (containerRect) {
            // Calculate relative positions within container
            const startX = startRect.right - containerRect.left;
            const startY = startRect.top + startRect.height / 2 - containerRect.top;
            const endX = endRect.left - containerRect.left;
            const endY = endRect.top + endRect.height / 2 - containerRect.top;

            // Create a stepped path for circuit board aesthetic
            const midX = startX + (endX - startX) / 2;
            return `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;
          }
        }
        return '';
      };
    }, [startElement, endElement]);

    useEffect(() => {
      const updatePath = () => {
        const newPath = calculatePath();
        setPath(newPath);
      };

      // Initial calculation
      updatePath();

      // Add resize listener
      const handleResize = () => {
        requestAnimationFrame(updatePath);
      };

      window.addEventListener('resize', handleResize);

      // Add mutation observer for dynamic element changes
      const observer = new MutationObserver(() => {
        requestAnimationFrame(updatePath);
      });

      const startEl = document.getElementById(startElement);
      const endEl = document.getElementById(endElement);

      if (startEl) observer.observe(startEl, { attributes: true, childList: true, subtree: true });
      if (endEl) observer.observe(endEl, { attributes: true, childList: true, subtree: true });

      return () => {
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }, [calculatePath, startElement, endElement]);

    if (!path) return null;

    return (
      <svg
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <defs>
          <filter id={`glow-${startElement}-${endElement}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={path}
          stroke="rgba(0, 255, 136, 0.4)"
          strokeWidth="2"
          fill="none"
          filter={`url(#glow-${startElement}-${endElement})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay, ease: 'easeInOut' }}
        />

        {/* Animated pulse along the trace */}
        <motion.circle
          r="3"
          fill="rgba(0, 255, 136, 0.8)"
          filter={`url(#glow-${startElement}-${endElement})`}
          initial={{ offsetDistance: '0%' }}
          animate={{ offsetDistance: '100%' }}
          transition={{
            duration: 3,
            delay: delay + 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <animateMotion dur="3s" repeatCount="indefinite" path={path} />
        </motion.circle>
      </svg>
    );
  }
);

CircuitTrace.displayName = 'CircuitTrace';

export default CircuitTrace;
