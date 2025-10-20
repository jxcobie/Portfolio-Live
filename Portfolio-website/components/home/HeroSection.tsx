'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
// import { FloatingParticles } from '@/components/effects/FloatingParticles';
import styles from './HeroSection.module.css';

// Constants
const LOGO_ASCII = [
  '    ██╗██╗  ██╗ ██████╗ ██████╗ ██████╗ ',
  '    ██║╚██╗██╔╝██╔════╝██╔═══██╗██╔══██╗',
  '    ██║ ╚███╔╝ ██║     ██║   ██║██████╔╝',
  '██  ██║ ██╔██╗ ██║     ██║   ██║██╔══██╗',
  '╚█████╔╝██╔╝ ██╗╚██████╗╚██████╔╝██████╔╝',
  ' ╚════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚═════╝ ',
  '',
  ' ██████╗██████╗ ███████╗ █████╗ ████████╗██╗ ██████╗ ███╗   ██╗███████╗',
  '██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║██╔════╝',
  '██║     ██████╔╝█████╗  ███████║   ██║   ██║██║   ██║██╔██╗ ██║███████╗',
  '██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██║██║   ██║██║╚██╗██║╚════██║',
  '╚██████╗██║  ██║███████╗██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║███████║',
  ' ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝',
];

const SLOGAN = '< Where Code Meets Creativity />';

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7], [1, 0.8, 0.2]);

  // Intro animation state
  const [showIntro, setShowIntro] = useState(true);
  const [currentLine, setCurrentLine] = useState(0);
  const [showSlogan, setShowSlogan] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Check if intro has been shown before
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
      setIntroComplete(true);
      return;
    }

    // Intro animation sequence
    if (showIntro && currentLine < LOGO_ASCII.length) {
      const timer = setTimeout(() => {
        setCurrentLine((prev) => prev + 1);
      }, 60);
      return () => clearTimeout(timer);
    }

    if (showIntro && currentLine >= LOGO_ASCII.length && !showSlogan) {
      const timer = setTimeout(() => setShowSlogan(true), 200);
      return () => clearTimeout(timer);
    }

    if (showIntro && showSlogan && !introComplete) {
      const timer = setTimeout(() => {
        setIntroComplete(true);
        setShowIntro(false);
        sessionStorage.setItem('hasSeenIntro', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentLine, showIntro, showSlogan, introComplete]);

  return (
    <motion.section ref={heroRef} id="home" className={styles.heroSection} style={{ y, opacity }}>
      {/* Background Effects */}
      {/* <FloatingParticles /> */}
      <div className={styles.scanlineOverlay} />

      {/* Intro Animation */}
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: showIntro ? 1 : 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className={styles.introOverlay}
        >
          <div className={styles.asciiLogo}>
            {LOGO_ASCII.slice(0, currentLine).map((line, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={styles.asciiLine}
              >
                {line}
              </motion.div>
            ))}
          </div>
          {showSlogan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={styles.sloganText}
            >
              {SLOGAN}
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Main Hero Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: introComplete ? 1 : 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className={styles.heroContent}
      >
        <Image
          src="/pfp.png"
          alt="Jacob Jaballah"
          width={600}
          height={800}
          className={styles.heroImage}
          priority
          quality={90}
        />

        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            <span className={styles.titleMain}>JXCOB</span>
            <span className={styles.titleSub}>CREATIONS</span>
          </h1>

          <div className={styles.heroSubtitle}>
            <p className={styles.subtitleMain}>FULL-STACK DEVELOPER • N8N AUTOMATION EXPERT</p>
            <div className={styles.subtitleBox}>
              <span>╔══════════════════════════════════════════╗</span>
              <span>║ TRANSFORMING IDEAS INTO DIGITAL MAGIC ║</span>
              <span>╚══════════════════════════════════════════╝</span>
            </div>
          </div>
        </div>

        <div className={styles.heroBackgroundText} aria-hidden="true">
          JACOB
        </div>

        <motion.div
          className={styles.scrollIndicator}
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span>[ SCROLL TO EXPLORE ]</span>
          <span className={styles.scrollArrows}>▼ ▼ ▼</span>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
