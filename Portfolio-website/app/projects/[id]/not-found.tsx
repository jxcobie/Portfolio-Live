'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProjectNotFound() {
  const [glitchText, setGlitchText] = useState('404');
  const [messageGlitch, setMessageGlitch] = useState('PROJECT NOT FOUND');

  useEffect(() => {
    // Glitch effect for 404 text
    const glitchInterval = setInterval(() => {
      const glitchChars = ['4', '0', '█', '▓', '▒', '░', '4', '0'];
      const shouldGlitch = Math.random() > 0.7;

      if (shouldGlitch) {
        const glitched = '404'
          .split('')
          .map(() => glitchChars[Math.floor(Math.random() * glitchChars.length)])
          .join('');
        setGlitchText(glitched);

        setTimeout(() => setGlitchText('404'), 100);
      }
    }, 2000);

    // Glitch effect for message
    const messageInterval = setInterval(() => {
      const originalMessage = 'PROJECT NOT FOUND';
      const shouldGlitch = Math.random() > 0.8;

      if (shouldGlitch) {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEF';
        const glitched = originalMessage
          .split('')
          .map((char) => {
            if (char === ' ') return ' ';
            return Math.random() > 0.5 ? char : glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join('');
        setMessageGlitch(glitched);

        setTimeout(() => setMessageGlitch(originalMessage), 80);
      }
    }, 1500);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div className="not-found-container">
      {/* Animated Background */}
      <div className="cyber-grid"></div>
      <div className="scanline"></div>

      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="particle"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="not-found-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 404 Number */}
        <motion.div
          className="not-found-number"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
        >
          {glitchText}
        </motion.div>

        {/* Error Message */}
        <motion.h1
          className="not-found-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {messageGlitch}
        </motion.h1>

        <motion.p
          className="not-found-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          The project you&apos;re looking for doesn&apos;t exist in the database.
          <br />
          It may have been moved, deleted, or never existed.
        </motion.p>

        {/* Error Code */}
        <motion.div
          className="error-code"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <span className="error-label">ERROR_CODE:</span>
          <span className="error-value">PROJECT_NOT_FOUND_0x404</span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="not-found-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Link href="/projects" className="primary-button">
            <ArrowLeft className="button-icon" />
            Return to Projects
          </Link>

          <Link href="/" className="secondary-button">
            <Home className="button-icon" />
            Go Home
          </Link>

          <Link href="/projects" className="tertiary-button">
            <Search className="button-icon" />
            Browse All Projects
          </Link>
        </motion.div>

        {/* Terminal-style suggestion */}
        <motion.div
          className="terminal-suggestion"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <div className="terminal-line">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command">cd /projects</span>
          </div>
          <div className="terminal-line">
            <span className="terminal-prompt">$</span>
            <span className="terminal-command">ls -la</span>
          </div>
          <div className="terminal-output">
            Try browsing all available projects instead
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .not-found-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a0f;
          overflow: hidden;
          padding: 2rem;
        }

        .cyber-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.3;
          pointer-events: none;
        }

        .scanline {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 255, 136, 0.03) 50%,
            transparent 100%
          );
          animation: scan 8s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2;
        }

        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #00ff88;
          box-shadow: 0 0 4px #00ff88;
        }

        .not-found-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 800px;
          width: 100%;
        }

        .not-found-number {
          font-size: clamp(8rem, 20vw, 16rem);
          font-weight: 900;
          line-height: 1;
          background: linear-gradient(135deg, #00ff88 0%, #00d4aa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 80px rgba(0, 255, 136, 0.5);
          margin-bottom: 1rem;
          font-family: 'Courier New', monospace;
          letter-spacing: -0.05em;
          filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.3));
        }

        .not-found-title {
          font-size: clamp(1.5rem, 4vw, 3rem);
          font-weight: 700;
          color: #00ff88;
          margin-bottom: 1.5rem;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.1em;
          text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }

        .not-found-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .error-code {
          display: inline-block;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          margin-bottom: 3rem;
          font-family: 'Courier New', monospace;
        }

        .error-label {
          color: rgba(255, 255, 255, 0.5);
          margin-right: 0.5rem;
        }

        .error-value {
          color: #00ff88;
          font-weight: 600;
        }

        .not-found-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .primary-button,
        .secondary-button,
        .tertiary-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .primary-button {
          background: #00ff88;
          color: #0a0a0f;
          box-shadow: 0 4px 20px rgba(0, 255, 136, 0.3);
        }

        .primary-button:hover {
          background: #00d4aa;
          box-shadow: 0 6px 30px rgba(0, 255, 136, 0.5);
          transform: translateY(-2px);
        }

        .secondary-button {
          background: transparent;
          color: #00ff88;
          border: 2px solid #00ff88;
        }

        .secondary-button:hover {
          background: rgba(0, 255, 136, 0.1);
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
          transform: translateY(-2px);
        }

        .tertiary-button {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tertiary-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-color: rgba(255, 255, 255, 0.4);
          transform: translateY(-2px);
        }

        .button-icon {
          width: 20px;
          height: 20px;
        }

        .terminal-suggestion {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 8px;
          padding: 1.5rem;
          font-family: 'Courier New', monospace;
          text-align: left;
          max-width: 500px;
          margin: 0 auto;
        }

        .terminal-line {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .terminal-prompt {
          color: #00ff88;
          font-weight: 700;
        }

        .terminal-command {
          color: rgba(255, 255, 255, 0.9);
        }

        .terminal-output {
          color: rgba(255, 255, 255, 0.5);
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .not-found-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .primary-button,
          .secondary-button,
          .tertiary-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
