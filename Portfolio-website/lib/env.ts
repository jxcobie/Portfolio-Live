import 'server-only';

/**
 * Resolve CMS base URL with sensible fallbacks.
 * Preference order:
 * 1. CMS_INTERNAL_URL (private network URL)
 * 2. CMS_URL (legacy server-side variable)
 * 3. NEXT_PUBLIC_CMS_URL (client-exposed URL)
 * 4. Default localhost fallback
 */
const resolvedCmsUrl =
  process.env.CMS_INTERNAL_URL ||
  process.env.CMS_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'http://localhost:1337';

/**
 * Normalized CMS base URL without trailing slash.
 */
export const CMS_BASE_URL = resolvedCmsUrl.replace(/\/$/, '');

/**
 * API key used for authenticated CMS requests (optional).
 */
export const CMS_API_KEY = process.env.CMS_API_KEY || '';

/**
 * Helper to build CMS URLs.
 *
 * @param path - API path starting with `/`
 * @returns Fully qualified CMS URL
 */
export const buildCmsUrl = (path: string): string => {
  if (!path.startsWith('/')) {
    throw new Error(`CMS path must start with '/': ${path}`);
  }
  return `${CMS_BASE_URL}${path}`;
};
