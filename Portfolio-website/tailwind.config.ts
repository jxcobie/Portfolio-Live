import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

// ============================================================================
// CYBERPUNK DESIGN SYSTEM - TAILWIND CONFIGURATION
// ============================================================================

/**
 * Comprehensive Tailwind configuration for the Cyberpunk Portfolio
 * Integrates seamlessly with the custom design system from globals.css
 */

const config = {
  // ==================== CONTENT PATHS ====================

  /**
   * Configure all paths that should be scanned for Tailwind classes
   * Updated for Next.js 15 App Router structure
   */
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './context/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // For Pages Router compatibility
  ],

  // ==================== DARK MODE ====================

  /**
   * Dark mode strategy: 'class' for manual toggle, 'media' for system preference
   * Default: 'media' - respects user's system preference
   */
  darkMode: 'media', // or 'class' if you want manual dark mode toggle

  // ==================== THEME CUSTOMIZATION ====================

  theme: {
    // ========== SCREENS (BREAKPOINTS) ==========

    /**
     * Responsive breakpoints matching the design system
     * Aligned with CSS custom properties in globals.css
     */
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },

    // ========== CONTAINER ==========

    /**
     * Container configuration for consistent max-width across breakpoints
     */
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },

    // ========== EXTEND THEME ==========

    extend: {
      // ===== COLORS =====

      /**
       * Cyberpunk color palette with semantic naming
       * Matches CSS custom properties for consistency
       */
      colors: {
        // Primary Cyberpunk Colors
        'cyber-cyan': {
          DEFAULT: '#00ff88',
          50: '#e6fff5',
          100: '#b3ffdd',
          200: '#80ffc6',
          300: '#4dffae',
          400: '#1aff97',
          500: '#00ff88', // Default
          600: '#00e67a',
          700: '#00cc6c',
          800: '#00b35e',
          900: '#009950',
        },
        'cyber-magenta': {
          DEFAULT: '#ff0080',
          50: '#ffe6f2',
          100: '#ffb3d9',
          200: '#ff80bf',
          300: '#ff4da6',
          400: '#ff1a8c',
          500: '#ff0080', // Default
          600: '#e60073',
          700: '#cc0066',
          800: '#b30059',
          900: '#99004d',
        },
        'cyber-blue': {
          DEFAULT: '#00d4ff',
          50: '#e6f9ff',
          100: '#b3edff',
          200: '#80e2ff',
          300: '#4dd6ff',
          400: '#1acbff',
          500: '#00d4ff', // Default
          600: '#00bfe6',
          700: '#00aacc',
          800: '#0095b3',
          900: '#008099',
        },
        'cyber-purple': {
          DEFAULT: '#a855f7',
          50: '#f5edff',
          100: '#e5d4ff',
          200: '#d4b8ff',
          300: '#c49dff',
          400: '#b481ff',
          500: '#a855f7', // Default
          600: '#974dde',
          700: '#8645c5',
          800: '#753dac',
          900: '#643593',
        },

        // Background Colors
        dark: {
          DEFAULT: '#0a0a14',
          50: '#3d3d4a',
          100: '#2e2e3a',
          200: '#24243a',
          300: '#1a1a2e',
          400: '#12121f',
          500: '#0a0a14', // Default
          600: '#080811',
          700: '#06060d',
          800: '#04040a',
          900: '#020207',
        },

        // Semantic Colors
        success: '#00ff88',
        warning: '#ffaa00',
        error: '#ff0055',
        info: '#00d4ff',
        accent: 'var(--cyber-cyan)',
        'accent-secondary': 'var(--cyber-orange)',
        surface: 'var(--card)',
        'surface-muted': 'var(--card-bg)',
        'surface-overlay': 'rgba(15, 15, 25, 0.8)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-base': 'var(--border-color)',
      },

      // ===== FONT FAMILY =====

      /**
       * Custom font families with proper fallback stacks
       */
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Courier New"', 'Courier', 'monospace'],
        display: ['Orbitron', '"Space Grotesk"', 'system-ui', 'sans-serif'],
      },

      // ===== FONT SIZE =====

      /**
       * Extended font size scale with line heights
       */
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },

      // ===== SPACING =====

      /**
       * Extended spacing scale for precise control
       */
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },

      // ===== BORDER RADIUS =====

      /**
       * Extended border radius scale
       */
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        card: 'var(--radius)',
        full: '9999px',
      },

      // ===== BOX SHADOW =====

      /**
       * Cyberpunk glow effects and shadows
       */
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 255, 136, 0.3)',
        glow: '0 0 20px rgba(0, 255, 136, 0.4)',
        'glow-md': '0 0 20px rgba(0, 255, 136, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 255, 136, 0.5)',
        'glow-xl': '0 0 40px rgba(0, 255, 136, 0.6)',
        'glow-2xl': '0 0 60px rgba(0, 255, 136, 0.7)',
        'glow-magenta': '0 0 20px rgba(255, 0, 128, 0.4)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 136, 0.2)',
      },

      // ===== TEXT SHADOW =====

      /**
       * Custom text shadow utilities for glitch effects
       */
      textShadow: {
        'glow-sm': '0 0 10px rgba(0, 255, 136, 0.5)',
        glow: '0 0 20px rgba(0, 255, 136, 0.6)',
        'glow-lg': '0 0 30px rgba(0, 255, 136, 0.7)',
        glitch: '2px 2px 0 #ff0080, -2px -2px 0 #00d4ff',
      },

      // ===== BACKDROP BLUR =====

      /**
       * Extended backdrop blur values
       */
      backdropBlur: {
        xs: '2px',
        '3xl': '40px',
        '4xl': '56px',
      },

      // ===== ANIMATIONS =====

      /**
       * Cyberpunk-themed animations
       */
      animation: {
        // Pulse animations
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        // Bounce animations
        bounce: 'bounce 1s infinite',
        'bounce-slow': 'bounce 2s infinite',

        // Spin animations
        spin: 'spin 1s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'spin-fast': 'spin 0.5s linear infinite',

        // Custom cyberpunk animations
        glow: 'glow 2s ease-in-out infinite',
        glitch: 'glitch 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite',
        scanline: 'scanline 8s linear infinite',
        flicker: 'flicker 0.15s infinite',
        matrix: 'matrix 20s linear infinite',
        'neon-pulse': 'neon-pulse 1.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
      },

      // ===== KEYFRAMES =====

      /**
       * Custom keyframe definitions for animations
       */
      keyframes: {
        glow: {
          '0%, 100%': {
            opacity: '0.5',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
          },
          '50%': {
            opacity: '1',
            boxShadow: '0 0 40px rgba(0, 255, 136, 0.8)',
          },
        },
        glitch: {
          '0%': {
            transform: 'translate(0)',
            textShadow: '2px 2px 0 #ff0080, -2px -2px 0 #00d4ff',
          },
          '20%': {
            transform: 'translate(-2px, 2px)',
            textShadow: '-2px -2px 0 #ff0080, 2px 2px 0 #00d4ff',
          },
          '40%': {
            transform: 'translate(-2px, -2px)',
            textShadow: '2px -2px 0 #ff0080, -2px 2px 0 #00d4ff',
          },
          '60%': {
            transform: 'translate(2px, 2px)',
            textShadow: '-2px 2px 0 #ff0080, 2px -2px 0 #00d4ff',
          },
          '80%': {
            transform: 'translate(2px, -2px)',
            textShadow: '2px 2px 0 #ff0080, -2px -2px 0 #00d4ff',
          },
          '100%': {
            transform: 'translate(0)',
            textShadow: '2px 2px 0 #ff0080, -2px -2px 0 #00d4ff',
          },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '41.99%': { opacity: '1' },
          '42%': { opacity: '0' },
          '43%': { opacity: '0' },
          '43.01%': { opacity: '1' },
          '47.99%': { opacity: '1' },
          '48%': { opacity: '0' },
          '49%': { opacity: '0' },
          '49.01%': { opacity: '1' },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'neon-pulse': {
          '0%, 100%': {
            textShadow: '0 0 7px #00ff88, 0 0 10px #00ff88, 0 0 21px #00ff88',
          },
          '50%': {
            textShadow: '0 0 4px #00ff88, 0 0 7px #00ff88, 0 0 13px #00ff88',
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
      },

      // ===== Z-INDEX =====

      /**
       * Semantic z-index scale
       */
      zIndex: {
        '-1': '-1',
        '0': '0',
        '1': '1',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        auto: 'auto',
        dropdown: '100',
        sticky: '500',
        fixed: '1000',
        modal: '2000',
        popover: '3000',
        tooltip: '4000',
      },

      // ===== TRANSITION =====

      /**
       * Custom transition timing functions
       */
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'bounce-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ===== OPACITY =====

      /**
       * Extended opacity scale
       */
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
    },
  },

  // ==================== SAFELIST ====================

  /**
   * Safelist classes that might be generated dynamically
   * Prevents Tailwind from purging these in production
   */
  safelist: [
    // Status colors
    'text-success',
    'text-warning',
    'text-error',
    'text-info',
    'bg-success',
    'bg-warning',
    'bg-error',
    'bg-info',
    'border-success',
    'border-warning',
    'border-error',
    'border-info',

    // Cyberpunk colors
    'text-cyber-cyan',
    'text-cyber-magenta',
    'text-cyber-blue',
    'text-cyber-purple',
    'bg-cyber-cyan',
    'bg-cyber-magenta',
    'bg-cyber-blue',
    'bg-cyber-purple',

    // Animations
    'animate-glow',
    'animate-glitch',
    'animate-pulse',
    'animate-neon-pulse',

    // Glow effects (pattern matching)
    {
      pattern: /shadow-glow-.*/,
      variants: ['hover', 'focus', 'active'],
    },
  ],

  // ==================== PLUGINS ====================

  /**
   * Tailwind plugins for extended functionality
   */
  plugins: [
    // ===== CUSTOM UTILITY PLUGIN =====

    /**
     * Custom utilities for cyberpunk effects
     */
    plugin(function ({ addUtilities, addComponents, theme }) {
      // Text shadow utilities
      addUtilities({
        '.text-shadow-glow': {
          textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
        },
        '.text-shadow-glow-sm': {
          textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
        },
        '.text-shadow-glow-lg': {
          textShadow: '0 0 30px rgba(0, 255, 136, 0.7)',
        },
        '.text-shadow-glitch': {
          textShadow: '2px 2px 0 #ff0080, -2px -2px 0 #00d4ff',
        },
      });

      // Cyberpunk border utilities
      addUtilities({
        '.border-glow': {
          borderColor: 'rgba(0, 255, 136, 0.4)',
          boxShadow: '0 0 10px rgba(0, 255, 136, 0.2)',
        },
        '.border-glow-strong': {
          borderColor: 'rgba(0, 255, 136, 0.8)',
          boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
        },
      });

      // CRT/Scanline effects
      addUtilities({
        '.crt-scanlines': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.03) 2px, rgba(0, 255, 136, 0.03) 4px)',
            pointerEvents: 'none',
            zIndex: '1',
          },
        },
      });

      // Cyberpunk button component
      addComponents({
        '.btn-cyber': {
          padding: '0.5rem 1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(0, 255, 136, 0.4)',
          background: 'rgba(10, 10, 20, 0.8)',
          color: '#00ff88',
          fontFamily: theme('fontFamily.mono'),
          fontSize: '0.875rem',
          fontWeight: '500',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          '&:hover': {
            borderColor: '#00ff88',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.4)',
            textShadow: '0 0 10px rgba(0, 255, 136, 0.6)',
          },
          '&:focus': {
            outline: 'none',
            borderColor: '#00ff88',
            boxShadow: '0 0 0 3px rgba(0, 255, 136, 0.2)',
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        '.btn-cyber-magenta': {
          borderColor: 'rgba(255, 0, 128, 0.4)',
          color: '#ff0080',
          '&:hover': {
            borderColor: '#ff0080',
            boxShadow: '0 0 20px rgba(255, 0, 128, 0.4)',
            textShadow: '0 0 10px rgba(255, 0, 128, 0.6)',
          },
        },
      });
    }),

    // ===== REDUCED MOTION PLUGIN =====

    /**
     * Automatically respects prefers-reduced-motion
     */
    plugin(function ({ addVariant }) {
      addVariant('motion-safe', '@media (prefers-reduced-motion: no-preference)');
      addVariant('motion-reduce', '@media (prefers-reduced-motion: reduce)');
    }),
  ],

  // ==================== CORE PLUGINS ====================

  /**
   * Disable unused core plugins to reduce bundle size
   * Uncomment to disable specific plugins you don't use
   */
  corePlugins: {
    // preflight: true, // Disable Tailwind's base reset
    // container: false,
    // accessibility: true,
  },
};

export default config;
