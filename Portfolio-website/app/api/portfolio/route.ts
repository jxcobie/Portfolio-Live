import { NextRequest, NextResponse } from 'next/server';
import {
  getPortfolioData,
  getPortfolioSection,
  updatePortfolioSection,
  addPortfolioItem,
  removePortfolioItem,
} from '@/lib/portfolio-data';
import {
  portfolioQuerySchema,
  portfolioUpdateRequestSchema,
  portfolioActionRequestSchema,
  portfolioDeleteRequestSchema,
  validateAndSanitize,
} from '@/lib/portfolio-validation';
import { checkRateLimit, getRateLimitHeaders } from '@/lib/rate-limit';
import { apiLogger } from '@/lib/api-logger';
import { PortfolioData, ValidationError } from '@/app/types/portfolio';

/**
 * Portfolio API Response Type
 */
interface PortfolioApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Error Response Type
 */
interface ErrorResponse {
  success: false;
  error: string;
  details?: ValidationError[];
  timestamp: string;
  requestId?: string;
  stack?: string;
}

/**
 * CORS headers configuration
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':
    process.env.NODE_ENV === 'development' ? '*' : 'https://jxcobcreations.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400', // 24 hours
};

/**
 * Cache headers for GET requests
 */
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // 5 minutes cache
  ETag: `"portfolio-${Date.now()}"`,
  'Last-Modified': new Date().toUTCString(),
};

/**
 * Create standardized API response
 *
 * @param data - Response data
 * @param success - Success status
 * @param message - Optional message
 * @param requestId - Request ID for tracking
 * @returns Formatted API response
 */
function createApiResponse<T>(
  data?: T,
  success: boolean = true,
  message?: string,
  requestId?: string
): PortfolioApiResponse<T> {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };
}

/**
 * Create error response
 *
 * @param error - Error message
 * @param details - Validation error details
 * @param requestId - Request ID for tracking
 * @returns Formatted error response
 */
function createErrorResponse(
  error: string,
  details?: ValidationError[],
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error,
    details,
    timestamp: new Date().toISOString(),
    requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: new Error().stack }),
  };
}

/**
 * Handle CORS preflight requests
 *
 * @returns CORS response
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/portfolio
 *
 * Retrieve portfolio data with optional filtering
 *
 * @param request - Next.js request object
 * @returns Portfolio data response
 *
 * @example
 * GET /api/portfolio - Get all portfolio data
 * GET /api/portfolio?section=projects - Get only projects
 * GET /api/portfolio?section=projects&featured=true - Get only featured projects
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = apiLogger.logRequest(request);

  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(request, 'GET');
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      apiLogger.logWarning(requestId, 'Rate limit exceeded', {
        ip: request.headers.get('x-forwarded-for'),
      });

      return NextResponse.json(
        createErrorResponse('Rate limit exceeded. Please try again later.', undefined, requestId),
        {
          status: 429,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const queryValidation = validateAndSanitize(portfolioQuerySchema, queryParams);
    if (!queryValidation.success) {
      const validationErrors: ValidationError[] = queryValidation.errors.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.input,
      }));

      apiLogger.logWarning(requestId, 'Invalid query parameters', { queryParams });

      return NextResponse.json(
        createErrorResponse('Invalid query parameters', validationErrors, requestId),
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    const { section, featured, category, limit, offset } = queryValidation.data;

    // Get portfolio data
    let responseData: any;

    if (section) {
      responseData = getPortfolioSection(section);

      // Apply filtering for specific sections
      if (section === 'projects') {
        if (featured !== undefined) {
          responseData = responseData.filter((project: any) => project.featured === featured);
        }
        if (category) {
          responseData = responseData.filter(
            (project: any) => project.category?.toLowerCase() === category.toLowerCase()
          );
        }
      }

      // Apply pagination
      if (Array.isArray(responseData)) {
        const startIndex = offset || 0;
        const endIndex = limit ? startIndex + limit : undefined;
        responseData = responseData.slice(startIndex, endIndex);
      }

      responseData = { [section]: responseData };
    } else {
      responseData = getPortfolioData();
    }

    const duration = Date.now() - startTime;
    apiLogger.logResponse(requestId, 200, duration, 'Portfolio data retrieved successfully');

    return NextResponse.json(
      createApiResponse(responseData, true, 'Portfolio data retrieved successfully', requestId),
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          ...rateLimitHeaders,
          ...CACHE_HEADERS,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    apiLogger.logError(requestId!, error as Error, { duration });
    apiLogger.logResponse(requestId!, 500, duration, 'Internal server error');

    return NextResponse.json(createErrorResponse('Internal server error', undefined, requestId), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}

/**
 * PUT /api/portfolio
 *
 * Update a specific section of portfolio data
 *
 * @param request - Next.js request object
 * @returns Update confirmation response
 *
 * @example
 * PUT /api/portfolio
 * Body: { "section": "personal", "data": { "name": "John Doe", ... } }
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = apiLogger.logRequest(request);

  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(request, 'PUT');
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      apiLogger.logWarning(requestId, 'Rate limit exceeded');

      return NextResponse.json(
        createErrorResponse('Rate limit exceeded. Please try again later.', undefined, requestId),
        {
          status: 429,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      apiLogger.logWarning(requestId, 'Invalid JSON in request body');

      return NextResponse.json(
        createErrorResponse('Invalid JSON in request body', undefined, requestId),
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    // Validate request data
    const validation = validateAndSanitize(portfolioUpdateRequestSchema, body);
    if (!validation.success) {
      const validationErrors: ValidationError[] = validation.errors.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.input,
      }));

      apiLogger.logWarning(requestId, 'Validation failed for PUT request', { validationErrors });

      return NextResponse.json(
        createErrorResponse('Validation failed', validationErrors, requestId),
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    const { section, data } = validation.data;

    // Update portfolio section
    const updatedData = updatePortfolioSection(section, data as any);

    const duration = Date.now() - startTime;
    apiLogger.logResponse(
      requestId,
      200,
      duration,
      `Portfolio section '${section}' updated successfully`
    );

    return NextResponse.json(
      createApiResponse(
        { [section]: updatedData[section] },
        true,
        `Portfolio section '${section}' updated successfully`,
        requestId
      ),
      {
        status: 200,
        headers: { ...CORS_HEADERS, ...rateLimitHeaders },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    apiLogger.logError(requestId!, error as Error, { duration });
    apiLogger.logResponse(requestId!, 500, duration, 'Failed to update portfolio');

    return NextResponse.json(
      createErrorResponse('Failed to update portfolio', undefined, requestId),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
}

/**
 * POST /api/portfolio
 *
 * Add new items to portfolio sections
 *
 * @param request - Next.js request object
 * @returns Add confirmation response
 *
 * @example
 * POST /api/portfolio
 * Body: { "action": "add_project", "section": "projects", "data": { "title": "New Project", ... } }
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = apiLogger.logRequest(request);

  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(request, 'POST');
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      apiLogger.logWarning(requestId, 'Rate limit exceeded');

      return NextResponse.json(
        createErrorResponse('Rate limit exceeded. Please try again later.', undefined, requestId),
        {
          status: 429,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      apiLogger.logWarning(requestId, 'Invalid JSON in request body');

      return NextResponse.json(
        createErrorResponse('Invalid JSON in request body', undefined, requestId),
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    // Validate request data
    const validation = validateAndSanitize(portfolioActionRequestSchema, body);
    if (!validation.success) {
      const validationErrors: ValidationError[] = validation.errors.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.input,
      }));

      apiLogger.logWarning(requestId, 'Validation failed for POST request', { validationErrors });

      return NextResponse.json(
        createErrorResponse('Validation failed', validationErrors, requestId),
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    const { action, data } = validation.data;

    let updatedData: PortfolioData;
    let message: string;

    // Handle different actions
    switch (action) {
      case 'add_project':
        updatedData = addPortfolioItem('projects', data as any);
        message = 'Project added successfully';
        break;

      case 'add_testimonial':
        updatedData = addPortfolioItem('testimonials', data as any);
        message = 'Testimonial added successfully';
        break;

      case 'add_skill_category':
        updatedData = addPortfolioItem('skills', data as any);
        message = 'Skill category added successfully';
        break;

      default:
        apiLogger.logWarning(requestId, `Unsupported action: ${action}`);

        return NextResponse.json(createErrorResponse('Unsupported action', undefined, requestId), {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        });
    }

    const duration = Date.now() - startTime;
    apiLogger.logResponse(requestId, 201, duration, message);

    return NextResponse.json(createApiResponse(updatedData, true, message, requestId), {
      status: 201,
      headers: { ...CORS_HEADERS, ...rateLimitHeaders },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    apiLogger.logError(requestId!, error as Error, { duration });
    apiLogger.logResponse(requestId!, 500, duration, 'Failed to perform action');

    return NextResponse.json(
      createErrorResponse('Failed to perform action', undefined, requestId),
      {
        status: 500,
        headers: CORS_HEADERS,
      }
    );
  }
}

/**
 * DELETE /api/portfolio
 *
 * Remove items from portfolio sections
 *
 * @param request - Next.js request object
 * @returns Delete confirmation response
 *
 * @example
 * DELETE /api/portfolio
 * Body: { "section": "projects", "id": 1 }
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = apiLogger.logRequest(request);

  try {
    // Check rate limit
    const rateLimitResult = checkRateLimit(request, 'DELETE');
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.allowed) {
      apiLogger.logWarning(requestId, 'Rate limit exceeded');

      return NextResponse.json(
        createErrorResponse('Rate limit exceeded. Please try again later.', undefined, requestId),
        {
          status: 429,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      apiLogger.logWarning(requestId, 'Invalid JSON in request body');

      return NextResponse.json(
        createErrorResponse('Invalid JSON in request body', undefined, requestId),
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    // Validate request data
    const validation = validateAndSanitize(portfolioDeleteRequestSchema, body);
    if (!validation.success) {
      const validationErrors: ValidationError[] = validation.errors.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.input,
      }));

      apiLogger.logWarning(requestId, 'Validation failed for DELETE request', { validationErrors });

      return NextResponse.json(
        createErrorResponse('Validation failed', validationErrors, requestId),
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...rateLimitHeaders },
        }
      );
    }

    const { section, id } = validation.data;

    // Remove item from portfolio
    const updatedData = removePortfolioItem(section, id);

    const duration = Date.now() - startTime;
    const message = `Item deleted from ${section} successfully`;
    apiLogger.logResponse(requestId, 200, duration, message);

    return NextResponse.json(createApiResponse(updatedData, true, message, requestId), {
      status: 200,
      headers: { ...CORS_HEADERS, ...rateLimitHeaders },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    apiLogger.logError(requestId!, error as Error, { duration });
    apiLogger.logResponse(requestId!, 500, duration, 'Failed to delete item');

    return NextResponse.json(createErrorResponse('Failed to delete item', undefined, requestId), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
}
