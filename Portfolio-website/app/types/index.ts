/**
 * Type Re-exports
 *
 * This file re-exports all types from lib/types.ts to maintain backward compatibility
 * with existing imports from '@/app/types'.
 *
 * @module app/types
 */

// Re-export all types from the central type definitions
export * from '@/lib/types';

// Note: All type definitions have been moved to lib/types.ts
// This file exists only for backward compatibility and to maintain
// the ability to add app-specific types if needed in the future.
