import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines class names using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a project ID to a string format for consistent handling
 * @param id - Project ID as string or number
 * @returns Normalized project ID as string
 */
export function normalizeProjectId(id: string | number): string {
  return String(id);
}

/**
 * Safely parses a project ID to a number
 * @param id - Project ID as string or number
 * @returns Parsed number or NaN if invalid
 */
export function parseProjectId(id: string | number): number {
  if (typeof id === 'number') return id;
  const parsed = parseInt(id, 10);
  return parsed;
}

/**
 * Checks if two project IDs are equal, handling both string and number types
 * @param id1 - First project ID
 * @param id2 - Second project ID
 * @returns True if IDs are equal
 */
export function projectIdsEqual(id1: string | number, id2: string | number): boolean {
  return normalizeProjectId(id1) === normalizeProjectId(id2);
}

/**
 * Normalizes a project status string to the proper ProjectStatus type
 * @param status - Status string in any case
 * @returns Normalized status with proper casing
 */
export function normalizeStatus(status: string): 'Deployed' | 'Active' | 'In Dev' | 'Archive' {
  const normalized = status.toLowerCase().trim();
  switch (normalized) {
    case 'deployed':
      return 'Deployed';
    case 'active':
      return 'Active';
    case 'in dev':
    case 'development':
    case 'in development':
      return 'In Dev';
    case 'archive':
    case 'archived':
      return 'Archive';
    default:
      return 'Archive';
  }
}

/**
 * Gets the status variant class name for styling (lowercase for CSS classes)
 * @param status - Project status string
 * @returns Lowercase status variant for CSS class names
 */
export function getStatusVariant(status: string): 'deployed' | 'active' | 'in-dev' | 'default' {
  const normalized = status.toLowerCase().trim();
  switch (normalized) {
    case 'deployed':
      return 'deployed';
    case 'active':
      return 'active';
    case 'in dev':
    case 'development':
    case 'in development':
      return 'in-dev';
    default:
      return 'default';
  }
}
