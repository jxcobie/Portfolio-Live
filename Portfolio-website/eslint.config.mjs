import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Ignore CMS CommonJS files
    ignores: ['cms/**/*.js'],
  },
  {
    rules: {
      // Downgrade no-explicit-any from error to warning
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow empty object types in utility types
      '@typescript-eslint/no-empty-object-type': 'warn',
      // Allow unescaped entities in JSX (common in content)
      'react/no-unescaped-entities': 'warn',
      // Allow CommonJS require in config files
      '@typescript-eslint/no-require-imports': 'warn',
      // Allow missing display names in HOCs
      'react/display-name': 'warn',
    },
  },
];

export default eslintConfig;
