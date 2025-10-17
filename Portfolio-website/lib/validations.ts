/**
 * Validation Schemas and Utilities
 *
 * This file contains all Zod validation schemas and custom validation functions
 * for the application. It serves as the single source of truth for data validation.
 *
 * @module lib/validations
 */

import { z } from 'zod';
import type { Project, ContactFormData } from './types';

// ==================== CUSTOM VALIDATION HELPERS ====================

/**
 * Validates a slug format (lowercase alphanumeric with hyphens)
 */
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Validates a URL format
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates an email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes HTML content by stripping dangerous tags
 * Basic sanitization - use DOMPurify for production
 */
export const sanitizeHtml = (html: string): string => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
};

/**
 * Sanitizes user input by trimming and removing extra whitespace
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Validates and sanitizes a slug
 */
export const sanitizeSlug = (slug: string): string => {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ==================== CUSTOM ZOD REFINEMENTS ====================

/**
 * Custom Zod refinement for slug validation
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(100, 'Slug must be less than 100 characters')
  .refine(isValidSlug, {
    message: 'Slug must be lowercase alphanumeric with hyphens (e.g., my-project-name)',
  });

/**
 * Custom Zod refinement for URL validation
 */
export const urlSchema = z
  .string()
  .min(1, 'URL is required')
  .url('Invalid URL format')
  .refine((url) => url.startsWith('http://') || url.startsWith('https://'), {
    message: 'URL must start with http:// or https://',
  });

/**
 * Optional URL schema (allows empty string)
 */
export const optionalUrlSchema = z
  .string()
  .optional()
  .refine((url) => !url || isValidUrl(url), {
    message: 'Invalid URL format',
  });

/**
 * Custom Zod refinement for email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')
  .max(255, 'Email must be less than 255 characters')
  .toLowerCase()
  .transform(sanitizeInput);

/**
 * Phone number schema (optional)
 */
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (phone) => {
      if (!phone) return true;
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      return phoneRegex.test(phone);
    },
    {
      message: 'Invalid phone number format',
    }
  );

// ==================== ENUM SCHEMAS ====================

/**
 * Project status enum schema
 */
export const projectStatusSchema = z.enum([
  'Deployed',
  'Active',
  'In Dev',
  'Archive',
  'Completed',
  'On Hold',
] as const);

/**
 * Image type enum schema
 */
export const imageTypeSchema = z.enum(['cover', 'gallery', 'thumbnail', 'screenshot'] as const);

/**
 * Skill level enum schema
 */
export const skillLevelSchema = z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const);

/**
 * Project category enum schema
 */
export const projectCategorySchema = z.enum([
  'Web Application',
  'Mobile App',
  'API Development',
  'Automation',
  'E-Commerce',
  'SaaS',
  'Portfolio',
  'Open Source',
  'Enterprise',
] as const);

/**
 * Client type enum schema
 */
export const clientTypeSchema = z.enum([
  'Enterprise',
  'SMB',
  'Startup',
  'Personal',
  'Open Source',
] as const);

/**
 * Message status enum schema
 */
export const messageStatusSchema = z.enum(['new', 'read', 'replied', 'archived', 'spam'] as const);

/**
 * Message priority enum schema
 */
export const messagePrioritySchema = z.enum(['low', 'medium', 'high'] as const);

// ==================== CORE DATA SCHEMAS ====================

/**
 * Technology schema
 */
export const technologySchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(1, 'Technology name is required')
    .max(50, 'Technology name must be less than 50 characters')
    .transform(sanitizeInput),
  category: z
    .enum(['frontend', 'backend', 'database', 'devops', 'mobile', 'other'] as const)
    .optional(),
  icon_url: optionalUrlSchema,
  color: z.string().optional(),
  proficiency: z
    .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
    .optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

/**
 * Project image schema
 */
export const projectImageSchema = z.object({
  id: z.number().int().positive(),
  url: urlSchema,
  alternativeText: z
    .string()
    .min(1, 'Alt text is required')
    .max(255, 'Alt text must be less than 255 characters')
    .transform(sanitizeInput),
  caption: z.string().max(500).optional(),
  image_type: imageTypeSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.enum(['jpeg', 'png', 'webp', 'avif'] as const).optional(),
  size: z.number().int().positive().optional(),
});

/**
 * Project metrics schema
 */
export const projectMetricsSchema = z.object({
  users: z.number().int().nonnegative().optional(),
  performance: z.string().max(100).optional(),
  revenue: z.string().max(100).optional(),
  satisfaction: z.number().min(1).max(5).optional(),
  customMetrics: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
});

/**
 * Project schema
 */
export const projectSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeInput),
  slug: slugSchema,
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .transform(sanitizeInput),
  shortDescription: z
    .string()
    .max(300, 'Short description must be less than 300 characters')
    .optional(),
  status: projectStatusSchema,
  category: projectCategorySchema.optional(),
  liveUrl: optionalUrlSchema,
  repoUrl: optionalUrlSchema,
  demoUrl: optionalUrlSchema,
  coverImage: projectImageSchema.optional(),
  galleryImages: z.array(projectImageSchema).optional(),
  technologies: z
    .array(technologySchema)
    .min(1, 'At least one technology is required')
    .max(20, 'Maximum 20 technologies allowed'),
  client: z.string().max(200).optional(),
  clientType: clientTypeSchema.optional(),
  duration: z.string().max(100).optional(),
  role: z.string().max(200).optional(),
  teamSize: z.number().int().positive().max(1000).optional(),
  detailedContent: z.string().max(50000).optional(),
  features: z.array(z.string().max(500)).max(50).optional(),
  challenges: z.array(z.string().max(1000)).max(20).optional(),
  outcomes: z.array(z.string().max(1000)).max(20).optional(),
  metrics: projectMetricsSchema.optional(),
  featured: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
});

/**
 * Create project schema (for POST requests)
 */
export const createProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
});

/**
 * Update project schema (for PUT/PATCH requests)
 */
export const updateProjectSchema = projectSchema
  .omit({
    createdAt: true,
  })
  .partial()
  .required({ id: true });

/**
 * Skill category schema
 */
export const skillCategorySchema = z.object({
  id: z.number().int().positive().optional(),
  category: z
    .string()
    .min(1, 'Category name is required')
    .max(100, 'Category name must be less than 100 characters')
    .transform(sanitizeInput),
  title: z.string().max(100).optional(),
  skills: z
    .array(
      z
        .string()
        .min(1, 'Skill name is required')
        .max(100, 'Skill name must be less than 100 characters')
    )
    .min(1, 'At least one skill is required')
    .max(50, 'Maximum 50 skills per category'),
  icon: z.string().max(50).optional(),
  color: z.enum(['cyan', 'orange', 'purple', 'green', 'blue', 'red', 'yellow'] as const).optional(),
  level: skillLevelSchema.optional(),
  order: z.number().int().min(0).optional(),
});

/**
 * Personal info schema
 */
export const personalInfoSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeInput),
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform(sanitizeInput),
  tagline: z
    .string()
    .min(10, 'Tagline must be at least 10 characters')
    .max(500, 'Tagline must be less than 500 characters')
    .transform(sanitizeInput),
  about: z
    .string()
    .min(50, 'About must be at least 50 characters')
    .max(5000, 'About must be less than 5000 characters')
    .transform(sanitizeInput),
  longBio: z.string().max(10000).optional(),
  email: emailSchema,
  phone: phoneSchema,
  linkedin: urlSchema,
  github: urlSchema,
  twitter: optionalUrlSchema,
  website: optionalUrlSchema,
  location: z.string().min(2).max(200).transform(sanitizeInput),
  timezone: z.string().max(100).optional(),
  experience: z.string().min(1).max(100).transform(sanitizeInput),
  yearsOfExperience: z.number().int().min(0).max(100).optional(),
  avatar: optionalUrlSchema,
  resume: optionalUrlSchema,
  availability: z.enum(['Available', 'Not Available', 'Open to Opportunities'] as const).optional(),
  preferredContact: z.enum(['email', 'linkedin', 'phone'] as const).optional(),
});

/**
 * Testimonial schema
 */
export const testimonialSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeInput),
  company: z
    .string()
    .min(2, 'Company must be at least 2 characters')
    .max(200, 'Company must be less than 200 characters')
    .transform(sanitizeInput),
  position: z
    .string()
    .min(2, 'Position must be at least 2 characters')
    .max(200, 'Position must be less than 200 characters')
    .transform(sanitizeInput),
  text: z
    .string()
    .min(20, 'Testimonial text must be at least 20 characters')
    .max(2000, 'Testimonial text must be less than 2000 characters')
    .transform(sanitizeInput),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  date: z.string().datetime(),
  avatar: optionalUrlSchema,
  projectId: z.number().int().positive().optional(),
  projectName: z.string().max(200).optional(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  linkedinUrl: optionalUrlSchema,
  companyUrl: optionalUrlSchema,
});

/**
 * Create testimonial schema (for POST requests)
 */
export const createTestimonialSchema = testimonialSchema.omit({
  id: true,
  date: true,
});

/**
 * Update testimonial schema (for PUT/PATCH requests)
 */
export const updateTestimonialSchema = testimonialSchema.partial().required({ id: true });

/**
 * Message schema
 */
export const messageSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeInput),
  email: emailSchema,
  subject: z.string().max(300).optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
    .transform(sanitizeInput),
  phone: phoneSchema,
  company: z.string().max(200).optional(),
  projectType: z.string().max(200).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(200).optional(),
  status: messageStatusSchema.default('new'),
  priority: messagePrioritySchema.default('medium'),
  ipAddress: z.string().optional(),
  userAgent: z.string().max(500).optional(),
  referrer: optionalUrlSchema,
  createdAt: z.string().datetime(),
  readAt: z.string().datetime().optional(),
  repliedAt: z.string().datetime().optional(),
});

/**
 * Analytics event schema
 */
export const analyticsEventSchema = z.object({
  id: z.string().uuid().optional(),
  event_type: z.enum([
    'page_view',
    'button_click',
    'link_click',
    'form_submit',
    'download',
    'scroll',
    'custom',
  ] as const),
  event_data: z.record(z.string(), z.any()).optional(),
  page_url: optionalUrlSchema,
  page_title: z.string().max(300).optional(),
  referrer: optionalUrlSchema,
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  device_type: z.enum(['desktop', 'mobile', 'tablet'] as const).optional(),
  browser: z.string().max(100).optional(),
  os: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  timestamp: z.string().datetime().optional(),
  duration: z.number().min(0).optional(),
});

// ==================== FORM SCHEMAS ====================

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(sanitizeInput),
  email: emailSchema,
  subject: z
    .string()
    .max(300, 'Subject must be less than 300 characters')
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : val)),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters')
    .transform(sanitizeInput),
  phone: phoneSchema,
  company: z
    .string()
    .max(200, 'Company name must be less than 200 characters')
    .optional()
    .transform((val) => (val ? sanitizeInput(val) : val)),
  projectType: z.string().max(200).optional(),
  budget: z.string().max(100).optional(),
  timeline: z.string().max(200).optional(),
  honeypot: z.string().max(0).optional(), // Bot detection - should be empty
});

/**
 * Contact form with honeypot validation
 */
export const contactFormWithHoneypotSchema = contactFormSchema.refine(
  (data) => !data.honeypot || data.honeypot === '',
  {
    message: 'Bot detection failed',
    path: ['honeypot'],
  }
);

// ==================== API REQUEST/RESPONSE SCHEMAS ====================

/**
 * Pagination params schema
 */
export const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(12),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc'] as const).default('desc'),
});

/**
 * Query string pagination params (converts strings to numbers)
 */
export const queryPaginationParamsSchema = z.object({
  page: z.string().regex(/^\d+$/).default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).default('12').transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc'] as const).default('desc'),
});

/**
 * Portfolio update request schema
 */
export const portfolioUpdateRequestSchema = z.object({
  section: z.enum(['personal', 'skills', 'projects', 'testimonials'] as const),
  data: z.union([
    personalInfoSchema,
    z.array(skillCategorySchema),
    z.array(projectSchema),
    z.array(testimonialSchema),
  ]),
});

/**
 * Portfolio action request schema
 */
export const portfolioActionRequestSchema = z.object({
  action: z.enum([
    'add_project',
    'add_testimonial',
    'add_skill_category',
    'update_project',
    'update_testimonial',
    'update_skill_category',
    'delete_project',
    'delete_testimonial',
  ] as const),
  section: z.string(),
  data: z.union([projectSchema.partial(), testimonialSchema.partial(), skillCategorySchema]),
  id: z.union([z.number(), z.string()]).optional(),
});

/**
 * Portfolio delete request schema
 */
export const portfolioDeleteRequestSchema = z.object({
  section: z.enum(['projects', 'testimonials', 'skills'] as const),
  id: z.union([z.number(), z.string()]),
});

/**
 * Generic API response schema
 */
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.discriminatedUnion('success', [
    z.object({
      success: z.literal(true),
      data: dataSchema,
      message: z.string().optional(),
      timestamp: z.string().datetime().optional(),
      requestId: z.string().optional(),
    }),
    z.object({
      success: z.literal(false),
      error: z.string(),
      details: z
        .array(
          z.object({
            field: z.string(),
            message: z.string(),
            code: z.string(),
            value: z.any().optional(),
            path: z.array(z.string()).optional(),
          })
        )
        .optional(),
      message: z.string().optional(),
      timestamp: z.string().datetime().optional(),
      requestId: z.string().optional(),
      stack: z.string().optional(),
    }),
  ]);

/**
 * Paginated response schema
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: z.array(dataSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive(),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
      hasNext: z.boolean().optional(),
      hasPrev: z.boolean().optional(),
    }),
    error: z.string().optional(),
  });

// ==================== TYPE INFERENCE HELPERS ====================

/**
 * Infer TypeScript types from Zod schemas
 */
export type TechnologyInput = z.infer<typeof technologySchema>;
export type ProjectImageInput = z.infer<typeof projectImageSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SkillCategoryInput = z.infer<typeof skillCategorySchema>;
export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type PaginationParamsInput = z.infer<typeof paginationParamsSchema>;
export type QueryPaginationParamsInput = z.infer<typeof queryPaginationParamsSchema>;

// ==================== VALIDATION UTILITIES ====================

/**
 * Validates data against a schema and returns typed result
 */
export function validateData<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Validates data and throws error if invalid
 */
export function validateDataOrThrow<T extends z.ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
  return schema.parse(data);
}

/**
 * Formats Zod errors into user-friendly messages
 */
export function formatZodErrors(error: z.ZodError): Array<{
  field: string;
  message: string;
  code: string;
}> {
  return error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
}

/**
 * Creates a validation error response
 */
export function createValidationErrorResponse(error: z.ZodError) {
  return {
    success: false,
    error: 'Validation failed',
    details: formatZodErrors(error),
  };
}

// ==================== REACT-HOOK-FORM INTEGRATION ====================

/**
 * Converts Zod schema to react-hook-form resolver
 * Usage: import { zodResolver } from '@hookform/resolvers/zod';
 *        const { register } = useForm({ resolver: zodResolver(contactFormSchema) });
 */
export { zodResolver } from '@hookform/resolvers/zod';

// ==================== SANITIZATION UTILITIES ====================

/**
 * Sanitizes contact form data
 */
export function sanitizeContactFormData(data: ContactFormData): ContactFormData {
  return {
    name: sanitizeInput(data.name),
    email: sanitizeInput(data.email).toLowerCase() as ContactFormData['email'],
    subject: data.subject ? sanitizeInput(data.subject) : undefined,
    message: sanitizeInput(data.message),
    phone: data.phone ? sanitizeInput(data.phone) : undefined,
    company: data.company ? sanitizeInput(data.company) : undefined,
    projectType: data.projectType,
    budget: data.budget,
    timeline: data.timeline,
    honeypot: data.honeypot,
  };
}

/**
 * Sanitizes project data
 */
export function sanitizeProjectData(data: Partial<Project>): Partial<Project> {
  return {
    ...data,
    title: data.title ? sanitizeInput(data.title) : undefined,
    slug: data.slug ? sanitizeSlug(data.slug as string) : undefined,
    description: data.description ? sanitizeInput(data.description) : undefined,
    shortDescription: data.shortDescription ? sanitizeInput(data.shortDescription) : undefined,
    detailedContent: data.detailedContent ? sanitizeHtml(data.detailedContent) : undefined,
  } as Partial<Project>;
}

// All schemas are exported above with `export const` declarations
