/**
 * Next.js Middleware
 *
 * Handles cross-cutting concerns for all requests:
 * - Rate limiting for API routes
 * - Security headers
 * - Request logging and monitoring
 * - CSRF protection
 * - Bot detection and blocking
 * - URL normalization (redirects)
 * - Performance monitoring
 * - Authentication checks
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';

// ==================== CONFIGURATION ====================

/**
 * Environment configuration
 */
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * Blocked IP addresses (you can move this to environment variables)
 */
const BLOCKED_IPS = new Set<string>([
  // Add IPs to block here
  // '192.168.1.1',
]);

/**
 * Known bad bot user agents (regex patterns)
 */
const BAD_BOT_PATTERNS = [
  /scrapy/i,
  /curl(?!\/7\.8[0-9])/i, // Allow modern curl, block old versions
  /python-requests/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /bot.*scrape/i,
  /scrape.*bot/i,
  /grab/i,
  /harvest/i,
  /extract/i,
  /spider/i,
  /crawler/i,
];

/**
 * Allowed bots (Googlebot, Bingbot, etc.) - these override bad bot patterns
 */
const ALLOWED_BOT_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i, // Yahoo
  /duckduckbot/i,
  /baiduspider/i,
  /yandex/i,
  /facebookexternalhit/i,
  /linkedinbot/i,
  /twitterbot/i,
  /whatsapp/i,
  /telegram/i,
  /discordbot/i,
];

/**
 * Protected routes that require authentication
 * These will be checked for valid session/token
 */
const PROTECTED_ROUTES = ['/admin', '/api/portfolio', '/api/upload'];

/**
 * Public API routes that don't require authentication
 */
const PUBLIC_API_ROUTES = [
  '/api/contact',
  '/api/analytics',
  '/api/projects',
  '/api/projects/featured',
];

/**
 * Routes that should bypass rate limiting
 */
const RATE_LIMIT_BYPASS_ROUTES = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip'); // Cloudflare

  return cfConnectingIp || forwardedFor?.split(',')[0].trim() || realIp || 'unknown';
}

/**
 * Get user agent
 */
function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * Check if IP is blocked
 */
function isIpBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip);
}

/**
 * Check if user agent is a bad bot
 */
function isBadBot(userAgent: string): boolean {
  // First check if it's an allowed bot
  if (ALLOWED_BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return false;
  }

  // Then check if it's a bad bot
  return BAD_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * Check if route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is a public API route
 */
function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route should bypass rate limiting
 */
function shouldBypassRateLimit(pathname: string): boolean {
  return RATE_LIMIT_BYPASS_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Normalize URL (remove trailing slash, handle www)
 */
function normalizeUrl(url: URL): string | null {
  let needsRedirect = false;
  const newUrl = new URL(url);

  // Remove www subdomain in production
  if (IS_PRODUCTION && newUrl.hostname.startsWith('www.')) {
    newUrl.hostname = newUrl.hostname.replace('www.', '');
    needsRedirect = true;
  }

  // Remove trailing slash (except for root path)
  if (newUrl.pathname !== '/' && newUrl.pathname.endsWith('/')) {
    newUrl.pathname = newUrl.pathname.slice(0, -1);
    needsRedirect = true;
  }

  return needsRedirect ? newUrl.toString() : null;
}

/**
 * Validate CSRF token for state-changing requests
 */
function validateCsrfToken(request: NextRequest): boolean {
  // Skip CSRF validation for GET and HEAD requests
  const method = request.method;
  if (method === 'GET' || method === 'HEAD') {
    return true;
  }

  // Skip CSRF validation for public API routes
  const pathname = request.nextUrl.pathname;
  if (isPublicApiRoute(pathname)) {
    return true;
  }

  // In development, skip CSRF validation
  if (IS_DEVELOPMENT) {
    return true;
  }

  // Get CSRF token from header or cookie
  const csrfTokenHeader = request.headers.get('x-csrf-token');
  const csrfTokenCookie = request.cookies.get('csrf-token')?.value;

  // Validate that tokens match
  if (!csrfTokenHeader || !csrfTokenCookie || csrfTokenHeader !== csrfTokenCookie) {
    return false;
  }

  return true;
}

/**
 * Check authentication for protected routes
 */
function checkAuthentication(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;

  // Skip auth check for non-protected routes
  if (!isProtectedRoute(pathname)) {
    return true;
  }

  // Check for admin session cookie or API key
  const sessionCookie = request.cookies.get('admin-session')?.value;
  const apiKey = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');

  // In development, allow if any auth method is present
  if (IS_DEVELOPMENT) {
    return !!(sessionCookie || apiKey || authHeader);
  }

  // In production, validate the session/token
  // TODO: Implement proper session validation with your auth provider
  // For now, just check if they exist
  return !!(sessionCookie || apiKey || authHeader);
}

/**
 * Log request for monitoring
 */
function logRequest(
  _requestId: string,
  _request: NextRequest,
  _startTime: number,
  _statusCode?: number
): void {
  // Request logging removed for production
  // Could be replaced with proper logging service in the future
}

// ==================== SECURITY HEADERS ====================

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): void {
  // These headers complement those in next.config.ts

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection (for older browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature policy / Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Expect-CT header (Certificate Transparency)
  if (IS_PRODUCTION) {
    response.headers.set('Expect-CT', 'max-age=86400, enforce');
  }

  // CORS headers for API routes
  if (response.headers.get('content-type')?.includes('application/json')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
    );
  }
}

/**
 * Handle CORS preflight requests
 */
function handleCorsPreFlight(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });

    // Get origin from request
    const origin = request.headers.get('origin');

    // In production, validate origin against allowlist
    if (IS_PRODUCTION && origin) {
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_SITE_URL,
        'https://jxcobcreations.com',
        'https://www.jxcobcreations.com',
      ].filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
    } else {
      // In development, allow all origins
      response.headers.set('Access-Control-Allow-Origin', origin || '*');
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token, X-Requested-With'
    );
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

    return response;
  }

  return null;
}

// ==================== MAIN MIDDLEWARE FUNCTION ====================

/**
 * Next.js Middleware
 */
export async function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Handle CORS preflight
  const corsResponse = handleCorsPreFlight(request);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // ==================== SECURITY CHECKS ====================

    // 1. Check if IP is blocked
    const clientIp = getClientIp(request);
    if (isIpBlocked(clientIp)) {
      logRequest(requestId, request, startTime, 403);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Access denied',
          requestId,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Check if user agent is a bad bot
    const userAgent = getUserAgent(request);
    if (isBadBot(userAgent)) {
      logRequest(requestId, request, startTime, 403);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'Bot detected',
          requestId,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. URL normalization (redirects)
    const normalizedUrl = normalizeUrl(request.nextUrl);
    if (normalizedUrl) {
      logRequest(requestId, request, startTime, 308);
      return NextResponse.redirect(normalizedUrl, { status: 308 });
    }

    // 4. Authentication check for protected routes
    if (!checkAuthentication(request)) {
      logRequest(requestId, request, startTime, 401);

      // If it's an API route, return JSON
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Authentication required',
            requestId,
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Otherwise redirect to login (you can customize this)
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // 5. CSRF token validation
    if (!validateCsrfToken(request)) {
      logRequest(requestId, request, startTime, 403);
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: 'CSRF token validation failed',
          requestId,
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // ==================== RATE LIMITING ====================

    // Apply rate limiting to API routes (unless bypassed)
    if (pathname.startsWith('/api/') && !shouldBypassRateLimit(pathname)) {
      // Type guard for HTTP methods
      const httpMethod = ['GET', 'POST', 'PUT', 'DELETE'].includes(method)
        ? (method as 'GET' | 'POST' | 'PUT' | 'DELETE')
        : 'GET';

      const rateLimitResult = checkRateLimit(request, httpMethod);

      // If rate limit exceeded
      if (!rateLimitResult.allowed) {
        logRequest(requestId, request, startTime, 429);

        const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

        return new NextResponse(
          JSON.stringify({
            success: false,
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${rateLimitResult.retryAfter} seconds.`,
            requestId,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              ...rateLimitHeaders,
            },
          }
        );
      }

      // Add rate limit headers to successful response
      const response = NextResponse.next();
      const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add request metadata headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

      // Add security headers
      addSecurityHeaders(response);

      logRequest(requestId, request, startTime, 200);

      return response;
    }

    // ==================== GEOLOCATION-BASED LOGIC ====================

    // Example: Redirect users from specific countries (if needed)
    // Get geo from Cloudflare headers: request.headers.get('cf-ipcountry')
    // const geoCountry = request.headers.get('cf-ipcountry');
    // if (geoCountry === 'CN' && pathname === '/') {
    //   return NextResponse.redirect(new URL('/zh', request.url));
    // }

    // ==================== A/B TESTING LOGIC ====================

    // Example: Assign users to A/B test variants (if needed)
    // const abTestVariant = request.cookies.get('ab-test-variant')?.value;
    // if (!abTestVariant && pathname === '/') {
    //   const variant = Math.random() < 0.5 ? 'A' : 'B';
    //   const response = NextResponse.next();
    //   response.cookies.set('ab-test-variant', variant, {
    //     maxAge: 60 * 60 * 24 * 30, // 30 days
    //   });
    //   return response;
    // }

    // ==================== DEFAULT RESPONSE ====================

    const response = NextResponse.next();

    // Add request metadata headers
    response.headers.set('X-Request-ID', requestId);
    response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

    // Add security headers
    addSecurityHeaders(response);

    // Log request
    logRequest(requestId, request, startTime);

    return response;
  } catch (error) {
    // Handle middleware errors
    console.error(`[${requestId}] Middleware error:`, error);

    logRequest(requestId, request, startTime, 500);

    // Return error response
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        requestId,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ==================== MIDDLEWARE CONFIGURATION ====================

/**
 * Configure which routes the middleware should run on
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif|woff|woff2|ttf|otf)).*)',

    // Always run middleware on API routes
    '/api/:path*',

    // Always run middleware on admin routes
    '/admin/:path*',
  ],
};

// ==================== TYPE DEFINITIONS ====================

/**
 * Extended NextRequest with custom properties
 */
export interface ExtendedNextRequest extends NextRequest {
  requestId?: string;
  startTime?: number;
  clientIp?: string;
  geo?: {
    country?: string;
    city?: string;
    region?: string;
  };
}
