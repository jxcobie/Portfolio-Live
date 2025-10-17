import * as z from 'zod';

/**
 * Validation schemas for portfolio API endpoints
 */

// Personal info validation schema
export const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  tagline: z.string().min(5, 'Tagline must be at least 5 characters').max(200, 'Tagline too long'),
  about: z
    .string()
    .min(50, 'About section must be at least 50 characters')
    .max(5000, 'About section too long'),
  email: z.string().email('Invalid email format').max(100, 'Email too long'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  location: z
    .string()
    .min(2, 'Location must be at least 2 characters')
    .max(100, 'Location too long'),
  experience: z.string().min(1, 'Experience is required').max(50, 'Experience too long'),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  resume: z.string().url('Invalid resume URL').optional().or(z.literal('')),
});

// Skill category validation schema
export const skillCategorySchema = z.object({
  id: z.number().int().positive().optional(),
  category: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name too long'),
  skills: z
    .array(z.string().min(1, 'Skill name required').max(50, 'Skill name too long'))
    .min(1, 'At least one skill required'),
  icon: z.string().optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
});

// Project validation schema
export const projectSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description too long'),
  tech: z
    .array(z.string().min(1, 'Technology name required').max(50, 'Technology name too long'))
    .min(1, 'At least one technology required'),
  status: z.enum([
    'Featured Project',
    'Client Work',
    'Portfolio Project',
    'In Development',
    'Completed',
  ]),
  link: z.string().url('Invalid project URL').or(z.literal('#')),
  image: z.string().min(1, 'Image URL required'),
  featured: z.boolean(),
  completedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  clientType: z.enum(['Enterprise', 'SMB', 'Startup', 'Personal', 'Open Source']),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  liveUrl: z.string().url('Invalid live URL').optional().or(z.literal('')),
  category: z.string().max(50, 'Category too long').optional(),
  duration: z.string().max(50, 'Duration too long').optional(),
  teamSize: z.number().int().min(1).max(100).optional(),
  challenges: z.array(z.string().max(200, 'Challenge description too long')).optional(),
  outcomes: z.array(z.string().max(200, 'Outcome description too long')).optional(),
});

// Testimonial validation schema
export const testimonialSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  company: z
    .string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name too long'),
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(100, 'Position too long'),
  text: z
    .string()
    .min(20, 'Testimonial must be at least 20 characters')
    .max(1000, 'Testimonial too long'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  projectId: z.number().int().positive().optional(),
  verified: z.boolean().optional(),
});

// Request validation schemas
export const portfolioUpdateRequestSchema = z.object({
  section: z.enum(['personal', 'skills', 'projects', 'testimonials']),
  data: z.union([
    personalInfoSchema,
    z.array(skillCategorySchema),
    z.array(projectSchema),
    z.array(testimonialSchema),
  ]),
});

export const portfolioActionRequestSchema = z.object({
  action: z.enum([
    'add_project',
    'add_testimonial',
    'add_skill_category',
    'update_project',
    'update_testimonial',
  ]),
  section: z.string().min(1, 'Section required'),
  data: z.union([projectSchema.partial(), testimonialSchema.partial(), skillCategorySchema]),
  id: z.number().int().positive().optional(),
});

export const portfolioDeleteRequestSchema = z.object({
  section: z.enum(['projects', 'testimonials', 'skills']),
  id: z.number().int().positive('ID must be a positive integer'),
});

// Query parameter validation
export const portfolioQuerySchema = z.object({
  section: z.enum(['personal', 'skills', 'projects', 'testimonials']).optional(),
  featured: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  category: z.string().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  offset: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
});

/**
 * Sanitize input data by removing potentially harmful content
 *
 * @param data - Data to sanitize
 * @returns Sanitized data
 */
export function sanitizeInput(data: any): any {
  if (typeof data === 'string') {
    return data
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
      .trim();
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }

  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}

/**
 * Validate and sanitize data based on schema
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  try {
    const sanitizedData = sanitizeInput(data);
    const validatedData = schema.parse(sanitizedData);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}
