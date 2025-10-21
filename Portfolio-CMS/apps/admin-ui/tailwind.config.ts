import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff'
        },
        muted: {
          DEFAULT: '#1f2937',
          foreground: '#9ca3af'
        }
      },
      borderRadius: {
        lg: '0.75rem'
      }
    }
  },
  plugins: []
};

export default config;
