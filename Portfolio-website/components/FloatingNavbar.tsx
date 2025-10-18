'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavbar } from '../context/NavbarContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Navigation item configuration
 */
export interface NavItem {
  id: string;
  label: string;
  ariaLabel?: string;
}

/**
 * FloatingNavbar component props
 */
export interface FloatingNavbarProps {
  /** Array of navigation items to display */
  navItems?: NavItem[];
  /** Custom time zone for the clock (default: Asia/Kuala_Lumpur) */
  timeZone?: string;
  /** Location label for the clock */
  locationLabel?: string;
  /** Enable/disable mobile hamburger menu */
  enableMobileMenu?: boolean;
  /** Callback when navigation item is clicked */
  onNavigate?: (sectionId: string) => void;
  /** Custom class name for additional styling */
  className?: string;
}

/**
 * Intersection Observer hook return type
 */
interface UseActiveSection {
  activeSection: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default navigation items - exported for reuse across the application
 */
export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', ariaLabel: 'Navigate to home section' },
  { id: 'about', label: 'ABOUT', ariaLabel: 'Navigate to about section' },
  { id: 'skills', label: 'SKILLS', ariaLabel: 'Navigate to skills section' },
  { id: 'projects', label: 'PROJECTS', ariaLabel: 'Navigate to projects section' },
  { id: 'contact', label: 'CONTACT', ariaLabel: 'Navigate to contact section' },
];

const INTERSECTION_THRESHOLD = 0.5;
const TIME_UPDATE_INTERVAL = 1000; // 1 second

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom hook for active section detection using Intersection Observer
 * @param navItems - Array of navigation items to observe
 * @returns Currently active section ID
 */
function useActiveSection(navItems: NavItem[]): UseActiveSection {
  const [activeSection, setActiveSection] = useState<string>(navItems[0]?.id || 'home');

  useEffect(() => {
    // Add scroll listener to detect when at top of page
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Create intersection observer to detect which section is in view
    const observer = new IntersectionObserver(
      (entries) => {
        // Skip if we're at the top of the page
        if (window.scrollY < 100) {
          return;
        }

        // Find the entry with the highest intersection ratio
        let maxRatio = 0;
        let maxEntry: IntersectionObserverEntry | null = null;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxEntry = entry;
          }
        });

        // Update active section if we found an intersecting entry
        if (maxEntry && maxEntry.intersectionRatio >= INTERSECTION_THRESHOLD) {
          setActiveSection(maxEntry.target.id);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1.0], // Multiple thresholds for better detection
        rootMargin: '-10% 0px -40% 0px', // Detect section when it's near the top
      }
    );

    // Observe all navigation sections
    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [navItems]);

  return { activeSection };
}

/**
 * Custom hook for keyboard navigation support
 * @param navItems - Array of navigation items
 * @param scrollToSection - Function to scroll to a section
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

/**
 * Optimized Time Display Component - only re-renders when time changes
 */
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
      [{locationLabel} {'//'} {time} GMT+8]
    </span>
  );
});

TimeDisplay.displayName = 'TimeDisplay';

/**
 * Navigation Items Component
 */
interface NavItemsProps {
  items: NavItem[];
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  isMobile?: boolean;
}

const NavItems = memo<NavItemsProps>(({ items, activeSection, onNavigate, isMobile = false }) => {
  return (
    <>
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          data-section-id={item.id}
          className={`nav-item ${activeSection === item.id ? 'active' : ''} ${
            isMobile ? 'mobile' : ''
          }`}
          aria-label={item.ariaLabel || `Navigate to ${item.label.toLowerCase()} section`}
          aria-current={activeSection === item.id ? 'page' : undefined}
          type="button"
        >
          <span className="nav-text">{item.label}</span>
        </button>
      ))}
    </>
  );
});

NavItems.displayName = 'NavItems';

/**
 * Mobile Menu Button Component
 */
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

/**
 * FloatingNavbar Component
 *
 * A production-ready, accessible navigation bar with:
 * - Intersection Observer for active section detection
 * - Full keyboard navigation support
 * - WCAG AA compliant focus indicators
 * - Optimized rendering with React.memo
 * - Mobile responsive design with hamburger menu
 * - Configurable navigation items
 * - TypeScript type safety
 *
 * @example
 * ```tsx
 * <FloatingNavbar
 *   navItems={customNavItems}
 *   timeZone="Asia/Tokyo"
 *   locationLabel="TOKYO"
 *   onNavigate={(id) => handleNavigate(id)}
 * />
 * ```
 */
export const FloatingNavbar = memo<FloatingNavbarProps>(
  ({
    navItems = DEFAULT_NAV_ITEMS,
    timeZone = 'Asia/Kuala_Lumpur',
    locationLabel = 'SEPANG',
    enableMobileMenu = true,
    onNavigate,
    className = '',
  }) => {
    const { navbarText } = useNavbar();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { activeSection } = useActiveSection(navItems);

    /**
     * Scroll to section with smooth behavior and fallback
     */
    const scrollToSection = useCallback(
      (sectionId: string) => {
        // Special handling for home section - scroll to top
        if (sectionId === 'home') {
          if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            window.scrollTo(0, 0);
          }

          // Close mobile menu after navigation
          setIsMobileMenuOpen(false);

          // Call optional callback
          onNavigate?.(sectionId);
          return;
        }

        // For other sections, use scrollIntoView
        const element = document.getElementById(sectionId);
        if (element) {
          // Calculate navbar height to offset scroll position
          const navbar = document.querySelector('.floating-navbar-fixed');
          const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight - 20; // 20px extra padding

          // Check if smooth scroll is supported
          if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth',
            });
          } else {
            // Fallback for browsers that don't support smooth scroll
            window.scrollTo(0, offsetPosition);
          }

          // Close mobile menu after navigation
          setIsMobileMenuOpen(false);

          // Call optional callback
          onNavigate?.(sectionId);
        }
      },
      [onNavigate]
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
              className="indicator-dot"
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

// ============================================================================
// TESTS STRUCTURE (To be implemented)
// ============================================================================

/**
 * Unit Tests:
 *
 * describe('FloatingNavbar', () => {
 *   describe('Rendering', () => {
 *     it('should render with default props')
 *     it('should render with custom nav items')
 *     it('should display the correct time for the timezone')
 *     it('should show the navbar text from context')
 *   })
 *
 *   describe('Navigation', () => {
 *     it('should scroll to section when nav item is clicked')
 *     it('should update active section on scroll')
 *     it('should call onNavigate callback when provided')
 *   })
 *
 *   describe('Keyboard Navigation', () => {
 *     it('should navigate with arrow keys')
 *     it('should navigate to first item with Home key')
 *     it('should navigate to last item with End key')
 *     it('should handle Enter key to activate navigation')
 *   })
 *
 *   describe('Mobile Menu', () => {
 *     it('should toggle mobile menu on button click')
 *     it('should close mobile menu after navigation')
 *     it('should close mobile menu on outside click')
 *     it('should lock body scroll when menu is open')
 *   })
 *
 *   describe('Accessibility', () => {
 *     it('should have proper ARIA labels')
 *     it('should have aria-current on active section')
 *     it('should be keyboard navigable')
 *     it('should meet WCAG AA contrast requirements')
 *   })
 *
 *   describe('Intersection Observer', () => {
 *     it('should detect active section on scroll')
 *     it('should handle multiple sections in view')
 *   })
 * })
 */
