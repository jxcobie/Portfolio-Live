'use client';

import React, { Suspense, useCallback, memo } from 'react';
import { ErrorBoundary, LoadingState } from './components/shared';
import { FloatingNavbar } from '../components/FloatingNavbar';
import {
  HeroSection,
  AboutSection,
  SkillsSection,
  ProjectsSection,
  ContactSection,
} from './components/sections';

// Page wrapper with performance optimizations
const PageWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <div className="home-page main-container">
    {/* CRT scanline overlay */}
    <div className="crt-overlay" aria-hidden="true"></div>

    {/* Floating Navigation */}
    <FloatingNavbar />

    {children}
  </div>
));

PageWrapper.displayName = 'PageWrapper';

// Content sections wrapper
const ContentWrapper = memo(({ children }: { children: React.ReactNode }) => (
  <div className="content-wrapper">
    {/* Animated grid background */}
    <div className="cyber-grid" aria-hidden="true"></div>
    {children}
  </div>
));

ContentWrapper.displayName = 'ContentWrapper';

// Spacer component with performance optimization
const ScrollSpacer = memo(() => <div style={{ height: '100vh' }} aria-hidden="true" />);

ScrollSpacer.displayName = 'ScrollSpacer';

// Section wrapper with error boundary
interface SectionWrapperProps {
  children: React.ReactNode;
  sectionName: string;
}

const SectionWrapper = memo<SectionWrapperProps>(({ children, sectionName }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error(`Error in ${sectionName} section:`, error, errorInfo);
    }}
  >
    <Suspense fallback={<LoadingState text={`Loading ${sectionName}`} />}>{children}</Suspense>
  </ErrorBoundary>
));

SectionWrapper.displayName = 'SectionWrapper';

// Main App Component with optimizations
const App = memo(() => {
  // Memoized callback for hero animation completion
  const handleHeroAnimationComplete = useCallback(() => {
    // Optional: Track analytics or perform other actions
  }, []);

  return (
    <PageWrapper>
      {/* Hero Section - Separate background */}
      <SectionWrapper sectionName="Hero">
        <HeroSection onAnimationComplete={handleHeroAnimationComplete} />
      </SectionWrapper>

      {/* Spacer for scroll */}
      <ScrollSpacer />

      {/* All content sections with unified cyberpunk background */}
      <ContentWrapper>
        <SectionWrapper sectionName="About">
          <AboutSection />
        </SectionWrapper>

        <SectionWrapper sectionName="Skills">
          <SkillsSection />
        </SectionWrapper>

        <SectionWrapper sectionName="Projects">
          <ProjectsSection />
        </SectionWrapper>

        <SectionWrapper sectionName="Contact">
          <ContactSection />
        </SectionWrapper>
      </ContentWrapper>
    </PageWrapper>
  );
});

App.displayName = 'App';

export default App;
