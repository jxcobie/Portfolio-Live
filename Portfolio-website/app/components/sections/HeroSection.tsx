'use client';

import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { HeroSectionProps } from '@/app/types';
import pfp from '../../../public/pfp.png';

// Constants
const LOGO_ASCII = [
  '    ██╗ ██╗  ██╗ ██████╗ ██████╗  ██████╗ ',
  '    ██║ ╚██╗██╔╝██╔════╝██╔═══██╗ ██╔══██╗',
  '    ██║  ╚███╔╝ ██║     ██║   ██║ ██████╔╝',
  '██  ██║  ██╔██╗ ██║     ██║   ██║ ██╔══██╗',
  '╚█████╔╝██╔╝ ██╗╚██████╗╚██████╔╝ ██████╔╝',
  ' ╚════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ',
  '',
  ' ██████╗██████╗ ███████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗',
  '██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝',
  '██║     ██████╔╝█████╗  ███████║   ██║   ██║██║   ██║██╔██╗ ██║███████╗',
  '██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║',
  '╚██████╗██║  ██║███████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║',
  ' ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝',
];

const SLOGAN = '< Where Code Meets Creativity />';

// Floating Particles Component
const FloatingParticles = memo(() => {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    char: ['▓', '▒', '░', '█', '▲', '▼'][i % 6],
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 8 + Math.random() * 4,
  }));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 0,
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            rotate: 0,
          }}
          animate={{
            opacity: [0, 0.15, 0],
            y: [`${particle.y}vh`, `${particle.y - 20}vh`],
            rotate: [0, 180],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            color: 'rgba(0, 255, 136, 0.3)',
            fontSize: '8px',
            fontFamily: 'monospace',
            zIndex: 1,
          }}
        >
          {particle.char}
        </motion.div>
      ))}
    </div>
  );
});

FloatingParticles.displayName = 'FloatingParticles';

// Intro Animation Component
interface IntroAnimationProps {
  currentLine: number;
  showSlogan: boolean;
  showIntro: boolean;
}

const IntroAnimation = memo<IntroAnimationProps>(({ currentLine, showSlogan, showIntro }) => (
  <motion.div
    initial={{ opacity: 1 }}
    animate={{ opacity: showIntro ? 1 : 0 }}
    transition={{ duration: 1.5, ease: 'easeInOut' }}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle at center, #111111 0%, #000000 70%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      fontFamily: '"JetBrains Mono", monospace',
      pointerEvents: showIntro ? 'auto' : 'none',
    }}
    role="banner"
    aria-label="Loading animation"
  >
    <motion.div
      style={{
        textAlign: 'center',
        color: '#ffffff',
        fontSize: '18px',
        lineHeight: 1.2,
      }}
    >
      {LOGO_ASCII.slice(0, currentLine).map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          style={{ display: 'block', whiteSpace: 'pre' }}
        >
          {line}
        </motion.div>
      ))}
    </motion.div>
    {showSlogan && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ marginTop: '40px', fontSize: '20px', color: '#cccccc' }}
      >
        {SLOGAN}
      </motion.div>
    )}
  </motion.div>
));

IntroAnimation.displayName = 'IntroAnimation';

// Main Hero Content Component
interface MainContentProps {
  introComplete: boolean;
}

const MainContent = memo<MainContentProps>(({ introComplete }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: introComplete ? 1 : 0 }}
    transition={{ duration: 1.5, ease: 'easeOut' }}
    style={{ width: '100%', height: '100%', position: 'relative' }}
  >
    <Image
      src={pfp}
      alt="Jacob Jaballah - Full-Stack Developer"
      className="hero-image"
      priority
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
    <div className="hero-content-wrapper">
      <h1 className="hero-title" tabIndex={0}>
        <span style={{ fontSize: '85px' }}>JXCOB</span>
        <br />
        <span style={{ fontSize: '50px' }}>CREATIONS</span>
      </h1>
      <div className="hero-subtitle">
        <div className="subtitle-main">FULL-STACK DEVELOPER • N8N AUTOMATION EXPERT</div>
        <div className="subtitle-box" role="banner">
          ╔═══════════════════════════════════════════╗
          <br />
          ║&nbsp;TRANSFORMING IDEAS INTO DIGITAL MAGIC&nbsp;║
          <br />
          ╚═══════════════════════════════════════════╝
        </div>
      </div>
    </div>
    <div className="hero-background-text" aria-hidden="true">
      JACOB
    </div>
  </motion.div>
));

MainContent.displayName = 'MainContent';

// Scroll Indicator Component
interface ScrollIndicatorProps {
  currentLine: number;
}

const ScrollIndicator = memo<ScrollIndicatorProps>(({ currentLine }) => (
  <motion.div
    className="scroll-indicator"
    initial={{ opacity: 0 }}
    animate={{ opacity: currentLine >= Math.floor(LOGO_ASCII.length * 0.7) ? 1 : 0 }}
    transition={{ duration: 1, ease: 'easeOut' }}
    role="button"
    tabIndex={0}
    aria-label="Scroll to explore content"
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    }}
  >
    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
      [ SCROLL TO EXPLORE ]<br />
      <span style={{ color: 'rgba(0, 255, 136, 0.8)' }}>▼ ▼ ▼</span>
    </motion.div>
  </motion.div>
));

ScrollIndicator.displayName = 'ScrollIndicator';

// Main Hero Section Component
const HeroSection = memo<HeroSectionProps>(({ onAnimationComplete }) => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 0.8, 0.2]);

  // State for the intro animation
  const [showIntro, setShowIntro] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);
  const [showSlogan, setShowSlogan] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const handleAnimationComplete = useCallback(() => {
    setIntroComplete(true);
    setShowIntro(false);
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  useEffect(() => {
    if (showIntro && currentLine < LOGO_ASCII.length) {
      const timer = setTimeout(() => {
        setCurrentLine((prev) => prev + 1);
      }, 60);
      return () => clearTimeout(timer);
    }
    if (showIntro && currentLine >= LOGO_ASCII.length && !showSlogan) {
      setTimeout(() => setShowSlogan(true), 200);
      // Fade out intro and show main content
      setTimeout(handleAnimationComplete, 1500);
    }
  }, [currentLine, showIntro, showSlogan, handleAnimationComplete]);

  return (
    <motion.section
      ref={heroRef}
      id="home"
      className="hero-section"
      style={{ y, opacity, overflow: 'hidden' }}
      role="banner"
      aria-label="Hero section with Jacob Jaballah introduction"
    >
      {/* Background Effects */}
      <FloatingParticles />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.02) 2px, rgba(255, 255, 255, 0.02) 4px)',
          opacity: 0.8,
          pointerEvents: 'none',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      {/* Intro Animation */}
      <IntroAnimation currentLine={currentLine} showSlogan={showSlogan} showIntro={showIntro} />

      {/* Main Hero Content */}
      <MainContent introComplete={introComplete} />

      {/* Scroll Indicator */}
      <ScrollIndicator currentLine={currentLine} />
    </motion.section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
