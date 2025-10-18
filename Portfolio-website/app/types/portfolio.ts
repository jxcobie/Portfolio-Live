/**
 * Legacy Portfolio Types - DEPRECATED
 *
 * This file is deprecated and maintained only for backward compatibility.
 * All types have been moved to lib/types.ts
 *
 * Please import from '@/lib/types' or '@/app/types' instead.
 *
 * @deprecated Use '@/lib/types' instead
 * @module app/types/portfolio
 */

// Re-export all types from the central type definitions
export * from '@/lib/types';

// Legacy type alias for backward compatibility
import { Project } from '@/lib/types';

/**
 * @deprecated Use Project from '@/lib/types' instead
 */
export type ProjectInfo = Project;
