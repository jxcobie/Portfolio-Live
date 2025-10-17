'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { LoadingStateProps } from '@/app/types';

const LoadingState = memo<LoadingStateProps>(({ text = 'Loading...', className = '' }) => {
  const dots = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div className={`loading-state flex items-center justify-center p-8 ${className}`}>
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center space-x-1">
          <span className="font-mono text-sm text-green-400">[{text.toUpperCase()}]</span>
          {dots.map((i) => (
            <motion.span
              key={i}
              className="font-mono text-green-400"
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              .
            </motion.span>
          ))}
        </div>

        {/* Animated progress bar */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-gray-800">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-cyan-400"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      </div>
    </div>
  );
});

LoadingState.displayName = 'LoadingState';

export default LoadingState;
