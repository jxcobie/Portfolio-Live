'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavbar } from '../context/NavbarContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface NavItem {
  id: string;
  label: string;
  ariaLabel?: string;
}

export interface FloatingNavbarProps {
  navItems?: NavItem[];
  timeZone?: string;
  locationLabel?: string;
  enableMobileMenu?: boolean;
  onNavigate?: (sectionId: string) => void;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', ariaLabel: 'Navigate to home section' },
  { id: 'about', label: 'ABOUT', ariaLabel: 'Navigate to about section' },
  { id: 'skills', label: 'SKILLS', ariaLabel: 'Navigate to skills section' },
  { id: 'projects', label: 'PROJECTS', ariaLabel: 'Navigate to projects section' },
  { id: 'contact', label: 'CONTACT', ariaLabel: 'Navigate to contact section' },
];

const TIME_UPDATE_INTERVAL = 1000;
const SCROLL_DEBOUNCE = 100; // ms to wait before updating active section

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Simple scroll-based active section detection
 * Much more reliable than IntersectionObserver
 */
function useScrollActiveSection(navItems: NavItem[]) {
  const [activeSection, setActiveSection] = useState<string>('home');
  const isScrollingProgrammatically = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const getActiveSection = (): string => {
      // Don't update during programmatic scrolls
      if (isScrollingProgrammatically.current) {
        return activeSection;
      }

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      // If at the very top, always show home
      if (scrollPosition < windowHeight * 0.3) {
        return 'home';
      }

      // Get all section positions
      const sectionPositions = navItems
        .map((item) => {
          const element = document.getElementById(item.id);
          if (!element) return null;

          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;

          return {
            id: item.id,
            top: elementTop,
            bottom: elementBottom,
            middle: elementTop + rect.height / 2,
          };
        })
        .filter((section): section is NonNullable<typeof section> => section !== null);

      // Find which section we're currently in
      // A section is "active" if we're past its top minus an offset
      const navbarHeight = 100; // approximate navbar height
      const currentScroll = scrollPosition + navbarHeight + 100; // offset for better UX

      // Find the section we're currently in or have passed
      let currentSection = 'home';

      for (let i = sectionPositions.length - 1; i >= 0; i--) {
        const section = sectionPositions[i];
        if (currentScroll >= section.top) {
          currentSection = section.id;
          break;
        }
      }

      return currentSection;
    };

    const handleScroll = () => {
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Debounce the update
      scrollTimeoutRef.current = setTimeout(() => {
        const newActiveSection = getActiveSection();
        setActiveSection(newActiveSection);
      }, SCROLL_DEBOUNCE);
    };

    // Initial check
    handleScroll();

    // Listen to scroll events
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [navItems, activeSection]);

  // Function to manually set active section (for click navigation)
  const setActiveSectionManually = useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    isScrollingProgrammatically.current = true;

    // Re-enable automatic detection after scroll completes
    setTimeout(() => {
      isScrollingProgrammatically.current = false;
    }, 1000);
  }, []);

  return { activeSection, setActiveSectionManually };
}

/**
 * Keyboard navigation support
 */
function useKeyboardNavigation(navItems: NavItem[], scrollToSection: (sectionId: string) => void) {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!navRef.current?.contains(document.activeElement)) return;

      const currentIndex = navItems.findIndex(
        (item) => item.id === (document.activeElement as HTMLElement)?.dataset.sectionId
      );

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            const prevButton = navRef.current?.querySelector(
              `[data-section-id="${navItems[currentIndex - 1].id}"]`
            ) as HTMLButtonElement;
            prevButton?.focus();
          }
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex < navItems.length - 1) {
            const nextButton = navRef.current?.querySelector(
              `[data-section-id="${navItems[currentIndex + 1].id}"]`
            ) as HTMLButtonElement;
            nextButton?.focus();
          }
          break;

        case 'Home':
          e.preventDefault();
          const firstButton = navRef.current?.querySelector(
            `[data-section-id="${navItems[0].id}"]`
          ) as HTMLButtonElement;
          firstButton?.focus();
          break;

        case 'End':
          e.preventDefault();
          const lastButton = navRef.current?.querySelector(
            `[data-section-id="${navItems[navItems.length - 1].id}"]`
          ) as HTMLButtonElement;
          lastButton?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navItems, scrollToSection]);

  return navRef;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface TimeDisplayProps {
  timeZone: string;
  locationLabel: string;
}

const TimeDisplay = memo<TimeDisplayProps>(({ timeZone, locationLabel }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const localTime = new Date(now.toLocaleString('en-US', { timeZone }));
      setTime(
        localTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, TIME_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, [timeZone]);

  return (
    <span className="mono-text" aria-live="polite" aria-atomic="true">
      [{locationLabel} {'//'} {time} GMT+1]
    </span>
  );
});

TimeDisplay.displayName = 'TimeDisplay';

interface NavItemsProps {
  items: NavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isMobile?: boolean;
}

const NavItems = memo<NavItemsProps>(({ items, activeSection, onNavigate, isMobile = false }) => {
  return (
    <>
      {items.map((item) => {
        const isActive = activeSection === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            data-section-id={item.id}
            className={`nav-item ${isActive ? 'active' : ''} ${isMobile ? 'mobile' : ''}`}
            aria-label={item.ariaLabel || `Navigate to ${item.label.toLowerCase()} section`}
            aria-current={isActive ? 'page' : undefined}
            type="button"
          >
            <span className="nav-text">{item.label}</span>
          </button>
        );
      })}
    </>
  );
});

NavItems.displayName = 'NavItems';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const MobileMenuButton = memo<MobileMenuButtonProps>(({ isOpen, onClick }) => {
  return (
    <button
      className="mobile-menu-button"
      onClick={onClick}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-menu"
      type="button"
    >
      <span className="hamburger-icon">
        <span className={`line ${isOpen ? 'open' : ''}`}></span>
        <span className={`line ${isOpen ? 'open' : ''}`}></span>
        <span className={`line ${isOpen ? 'open' : ''}`}></span>
      </span>
    </button>
  );
});

MobileMenuButton.displayName = 'MobileMenuButton';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const FloatingNavbar = memo<FloatingNavbarProps>(
  ({
    navItems = DEFAULT_NAV_ITEMS,
    timeZone = 'CET',
    locationLabel = 'Tunis, TN',
    enableMobileMenu = true,
    onNavigate,
    className = '',
  }) => {
    const { navbarText } = useNavbar();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { activeSection, setActiveSectionManually } = useScrollActiveSection(navItems);

    /**
     * Scroll to section with smooth behavior
     */
    const scrollToSection = useCallback(
      (sectionId: string) => {
        // Immediately update active section
        setActiveSectionManually(sectionId);

        // Special handling for home section - scroll to top
        if (sectionId === 'home') {
          window.scrollTo({
            top: 0,
            behavior: 'smooth',
          });

          setIsMobileMenuOpen(false);
          onNavigate?.(sectionId);
          return;
        }

        // For other sections, scroll to element
        const element = document.getElementById(sectionId);
        if (element) {
          const navbar = document.querySelector('.floating-navbar-fixed');
          const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight - 20;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          setIsMobileMenuOpen(false);
          onNavigate?.(sectionId);
        }
      },
      [onNavigate, setActiveSectionManually]
    );

    // Keyboard navigation hook
    const navRef = useKeyboardNavigation(navItems, scrollToSection);

    /**
     * Toggle mobile menu
     */
    const toggleMobileMenu = useCallback(() => {
      setIsMobileMenuOpen((prev) => !prev);
    }, []);

    /**
     * Close mobile menu when clicking outside
     */
    useEffect(() => {
      if (!isMobileMenuOpen) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.floating-navbar-fixed')) {
          setIsMobileMenuOpen(false);
        }
      };

      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen]);

    /**
     * Lock body scroll when mobile menu is open
     */
    useEffect(() => {
      if (isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.body.style.overflow = '';
      };
    }, [isMobileMenuOpen]);

    return (
      <motion.nav
        ref={navRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`floating-navbar-fixed ${className}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Left: System Identifier */}
        <div className="navbar-status-left">
          <div className="system-indicator">
            <span
              className="indicator-dot pulse-green"
              role="status"
              aria-label="System online"
              title="System Status: Online"
            ></span>
            <span className="mono-text" aria-label="System identifier">
              {navbarText}
            </span>
          </div>
        </div>

        {/* Center: Navigation Pills (Desktop) */}
        <div className="navbar-pill desktop-nav" role="menubar">
          <NavItems items={navItems} activeSection={activeSection} onNavigate={scrollToSection} />
        </div>

        {/* Mobile Menu Button */}
        {enableMobileMenu && (
          <MobileMenuButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
        )}

        {/* Mobile Menu Overlay */}
        {enableMobileMenu && (
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ duration: 0.3 }}
                className="mobile-nav-overlay"
                id="mobile-nav-menu"
                role="menu"
                aria-label="Mobile navigation menu"
              >
                <nav className="mobile-nav-content">
                  <NavItems
                    items={navItems}
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    isMobile
                  />
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Right: Status Indicator */}
        <div className="navbar-status-right">
          <div className="system-status">
            <TimeDisplay timeZone={timeZone} locationLabel={locationLabel} />
            <span
              className="status-indicator pulse-green"
              role="status"
              aria-label="System operational"
              title="Status: Operational"
            ></span>
          </div>
        </div>
      </motion.nav>
    );
  }
);

FloatingNavbar.displayName = 'FloatingNavbar';
