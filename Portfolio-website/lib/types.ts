/**
 * Central Type Definitions
 *
 * This file serves as the single source of truth for all TypeScript types and interfaces
 * used throughout the application. Import from this file rather than defining types inline.
 *
 * @module lib/types
 */

import { ReactNode, ComponentType, MouseEvent, ChangeEvent, FormEvent } from 'react';

// ==================== BRANDED TYPES ====================

/**
 * Branded type for ensuring type safety with IDs
 */
export type ProjectId = string & { readonly __brand: 'ProjectId' };
export type TestimonialId = number & { readonly __brand: 'TestimonialId' };
export type SkillCategoryId = number & { readonly __brand: 'SkillCategoryId' };
export type MessageId = string & { readonly __brand: 'MessageId' };
export type UserId = string & { readonly __brand: 'UserId' };

/**
 * Branded type for URLs to ensure validation
 */
export type HttpUrl = string & { readonly __brand: 'HttpUrl' };
export type EmailAddress = string & { readonly __brand: 'EmailAddress' };
export type Slug = string & { readonly __brand: 'Slug' };

/**
 * Helper functions to create branded types
 */
export const createProjectId = (id: string): ProjectId => id as ProjectId;
export const createTestimonialId = (id: number): TestimonialId => id as TestimonialId;
export const createHttpUrl = (url: string): HttpUrl => url as HttpUrl;
export const createEmailAddress = (email: string): EmailAddress => email as EmailAddress;
export const createSlug = (slug: string): Slug => slug as Slug;

// ==================== UTILITY TYPES ====================

/**
 * Make specific properties optional
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties nullable
 */
export type Nullable<T> = T | null;

/**
 * Make all properties nullable
 */
export type NullableFields<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Pick properties by value type
 */
export type PickByValue<T, V> = Pick<T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>;

/**
 * Exclude null and undefined
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract keys that are required (not optional)
 */
export type RequiredKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Extract keys that are optional
 */
export type OptionalKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// ==================== DATA MODEL TYPES ====================

/**
 * Technology/Tool used in projects
 */
export interface Technology {
  id: number;
  name: string;
  category?: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'other';
  icon_url?: string;
  color?: string;
  proficiency?: 1 | 2 | 3 | 4 | 5; // 1=Beginner, 5=Expert
  yearsOfExperience?: number;
}

/**
 * Project image types
 */
export type ImageType = 'cover' | 'gallery' | 'thumbnail' | 'screenshot';

/**
 * Project image
 */
export interface ProjectImage {
  id: number;
  url: string;
  alternativeText: string;
  caption?: string;
  image_type: ImageType;
  width?: number;
  height?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  size?: number; // in bytes
}

/**
 * Project status types
 */
export type ProjectStatus = 'Deployed' | 'Active' | 'In Dev' | 'Archive' | 'Completed' | 'On Hold';

/**
 * Project categories
 */
export type ProjectCategory =
  | 'Web Application'
  | 'Mobile App'
  | 'API Development'
  | 'Automation'
  | 'E-Commerce'
  | 'SaaS'
  | 'Portfolio'
  | 'Open Source'
  | 'Enterprise';

/**
 * Complete project information
 */
export interface Project {
  id: string | number;
  title: string;
  slug: Slug;
  description: string;
  shortDescription?: string;
  status: ProjectStatus;
  category?: ProjectCategory;
  liveUrl?: HttpUrl;
  repoUrl?: HttpUrl;
  demoUrl?: HttpUrl;
  coverImage?: ProjectImage;
  galleryImages?: ProjectImage[];
  technologies: Technology[];
  client?: string;
  clientType?: 'Enterprise' | 'SMB' | 'Startup' | 'Personal' | 'Open Source';
  duration?: string;
  role?: string;
  teamSize?: number;
  detailedContent?: string;
  features?: string[];
  challenges?: string[];
  outcomes?: string[];
  metrics?: ProjectMetrics;
  featured: boolean;
  priority?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

/**
 * Project metrics for showcasing impact
 */
export interface ProjectMetrics {
  users?: number;
  performance?: string; // e.g., "50% faster"
  revenue?: string; // e.g., "$100k+ revenue"
  satisfaction?: number; // 1-5 rating
  customMetrics?: Record<string, string | number>;
}

/**
 * Skill proficiency levels
 */
export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

/**
 * Skill category with skills
 */
export interface SkillCategory {
  id?: number;
  category: string;
  title?: string;
  skills: string[];
  icon?: string;
  color?: 'cyan' | 'orange' | 'purple' | 'green' | 'blue' | 'red' | 'yellow';
  level?: SkillLevel;
  order?: number;
}

/**
 * Personal information
 */
export interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  about: string;
  longBio?: string;
  email: EmailAddress;
  phone?: string;
  linkedin: HttpUrl;
  github: HttpUrl;
  twitter?: HttpUrl;
  website?: HttpUrl;
  location: string;
  timezone?: string;
  experience: string;
  yearsOfExperience?: number;
  avatar?: string;
  resume?: string;
  availability?: 'Available' | 'Not Available' | 'Open to Opportunities';
  preferredContact?: 'email' | 'linkedin' | 'phone';
}

/**
 * Client testimonial
 */
export interface Testimonial {
  id: number;
  name: string;
  company: string;
  position: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  avatar?: string;
  projectId?: number;
  projectName?: string;
  verified?: boolean;
  featured?: boolean;
  linkedinUrl?: HttpUrl;
  companyUrl?: HttpUrl;
}

/**
 * Contact message from website visitors
 */
export interface Message {
  id: string;
  name: string;
  email: EmailAddress;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  status: 'new' | 'read' | 'replied' | 'archived' | 'spam';
  priority?: 'low' | 'medium' | 'high';
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
}

/**
 * Timeline item for experience/education
 */
export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  type: 'work' | 'education' | 'achievement' | 'certification';
  startDate?: string;
  endDate?: string;
  current?: boolean;
  company?: string;
  location?: string;
  highlights?: string[];
}

/**
 * Analytics event
 */
export interface AnalyticsEvent {
  id?: string;
  event_type:
    | 'page_view'
    | 'button_click'
    | 'link_click'
    | 'form_submit'
    | 'download'
    | 'scroll'
    | 'custom';
  event_data?: Record<string, unknown>;
  page_url?: string;
  page_title?: string;
  referrer?: string;
  user_id?: UserId;
  session_id?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  country?: string;
  timestamp?: string;
  duration?: number;
}

/**
 * Complete portfolio data structure
 */
export interface PortfolioData {
  personal: PersonalInfo;
  skills: SkillCategory[];
  projects: Project[];
  testimonials: Testimonial[];
}

// ==================== API TYPES ====================

/**
 * Generic API response wrapper with discriminated union
 */
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      message?: string;
      timestamp?: string;
      requestId?: string;
    }
  | {
      success: false;
      error: string;
      details?: ValidationError[];
      message?: string;
      timestamp?: string;
      requestId?: string;
      stack?: string;
    };

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
  error?: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/**
 * Pagination query parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Portfolio API request types
 */
export interface PortfolioUpdateRequest {
  section: keyof PortfolioData;
  data: PersonalInfo | SkillCategory[] | Project[] | Testimonial[];
}

export interface PortfolioActionRequest {
  action:
    | 'add_project'
    | 'add_testimonial'
    | 'add_skill_category'
    | 'update_project'
    | 'update_testimonial'
    | 'update_skill_category'
    | 'delete_project'
    | 'delete_testimonial';
  section: string;
  data: Partial<Project> | Partial<Testimonial> | SkillCategory;
  id?: number | string;
}

export interface PortfolioDeleteRequest {
  section: 'projects' | 'testimonials' | 'skills';
  id: number | string;
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
  path?: string[];
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Request metadata for logging
 */
export interface RequestMetadata {
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  timestamp: string;
  duration?: number;
  section?: string;
  action?: string;
  requestId?: string;
}

// ==================== FORM TYPES ====================

/**
 * Contact form data
 */
export interface ContactFormData {
  name: string;
  email: EmailAddress;
  subject?: string;
  message: string;
  phone?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  timeline?: string;
  honeypot?: string; // Bot detection
}

/**
 * Contact form submission result
 */
export interface ContactSubmissionResult {
  success: boolean;
  message: string;
  messageId?: MessageId;
  errors?: ValidationError[];
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  options?: Array<{ value: string; label: string }>;
  helperText?: string;
  errorText?: string;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitCount: number;
}

// ==================== COMPONENT PROP TYPES ====================

/**
 * Base component props
 */
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

/**
 * Glitch text effect props
 */
export interface GlitchTextProps {
  children: string;
  scramble?: boolean;
  className?: string;
  delay?: number;
  duration?: number;
  intensity?: 'low' | 'medium' | 'high';
}

/**
 * Circuit trace animation props
 */
export interface CircuitTraceProps {
  startElement: string;
  endElement: string;
  delay?: number;
  duration?: number;
  className?: string;
  color?: string;
}

/**
 * Section header props
 */
export interface SectionHeaderProps {
  tag: string;
  title: string;
  subtitle?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Loading state props
 */
export interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'spinner' | 'dots' | 'pulse';
}

/**
 * Error boundary props
 */
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error boundary fallback props
 */
export interface ErrorBoundaryFallbackProps {
  error: Error;
  errorInfo?: ErrorInfo;
  reset: () => void;
}

/**
 * Error info from React
 */
export interface ErrorInfo {
  componentStack: string;
  digest?: string;
}

/**
 * Navigation item
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  section: string;
  icon?: ReactNode;
  external?: boolean;
}

/**
 * Floating navbar props
 */
export interface FloatingNavbarProps {
  navItems?: NavItem[];
  timeZone?: string;
  locationLabel?: string;
  className?: string;
}

/**
 * Project card props
 */
export interface ProjectCardProps {
  project: Project;
  index?: number;
  featured?: boolean;
  onClick?: (project: Project) => void;
  className?: string;
}

/**
 * Projects grid props
 */
export interface ProjectsGridProps {
  projects: Project[];
  loading?: boolean;
  error?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'small' | 'medium' | 'large';
}

/**
 * Testimonial card props
 */
export interface TestimonialCardProps {
  testimonial: Testimonial;
  variant?: 'default' | 'compact' | 'detailed';
  showProject?: boolean;
}

/**
 * Skills section props
 */
export interface SkillsSectionProps {
  categories: SkillCategory[];
  layout?: 'grid' | 'list' | 'accordion';
  showProficiency?: boolean;
}

/**
 * Hero section props
 */
export interface HeroSectionProps {
  onAnimationComplete?: () => void;
  personalInfo?: PersonalInfo;
  showCTA?: boolean;
}

/**
 * Contact form props
 */
export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<ContactSubmissionResult>;
  isLoading?: boolean;
  initialValues?: Partial<ContactFormData>;
  showExtendedFields?: boolean;
}

// ==================== EVENT HANDLER TYPES ====================

/**
 * Generic event handlers
 */
export type ClickHandler<T = HTMLElement> = (event: MouseEvent<T>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: ChangeEvent<T>) => void;
export type SubmitHandler<T = HTMLFormElement> = (event: FormEvent<T>) => void;
export type AsyncClickHandler<T = HTMLElement> = (event: MouseEvent<T>) => Promise<void>;
export type AsyncSubmitHandler<T = HTMLFormElement> = (event: FormEvent<T>) => Promise<void>;

/**
 * Form-specific handlers
 */
export type InputChangeHandler = ChangeHandler<HTMLInputElement>;
export type TextareaChangeHandler = ChangeHandler<HTMLTextAreaElement>;
export type SelectChangeHandler = ChangeHandler<HTMLSelectElement>;
export type FormSubmitHandler = SubmitHandler<HTMLFormElement>;

// ==================== ANIMATION TYPES ====================

/**
 * Animation variants
 */
export type AnimationVariant = 'hidden' | 'visible' | 'exit';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string | number[];
  type?: 'spring' | 'tween' | 'inertia';
}

/**
 * Framer Motion animation props
 */
export interface MotionProps {
  initial?: AnimationVariant | object;
  animate?: AnimationVariant | object;
  exit?: AnimationVariant | object;
  transition?: AnimationConfig;
  variants?: Record<string, unknown>;
  whileHover?: object;
  whileTap?: object;
  whileInView?: object;
  viewport?: { once?: boolean; amount?: number };
}

/**
 * Motion wrapper component props
 */
export interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  initial?: object;
  animate?: object;
  transition?: object;
  viewport?: object;
}

/**
 * Status variant type for project status styling
 */
export type StatusVariant = 'deployed' | 'active' | 'in-dev' | 'default';

/**
 * Form field props for dynamic form generation
 */
export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'textarea';
  required?: boolean;
  placeholder?: string;
  className?: string;
  rows?: number;
  maxLength?: number;
  minLength?: number;
}

/**
 * Navigation component props
 */
export interface NavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

/**
 * Intro animation props for hero section
 */
export interface IntroAnimationProps {
  onComplete: () => void;
  logoLines: string[];
  slogan: string;
}

/**
 * Component error interface
 */
export interface ComponentError {
  message: string;
  stack?: string;
  componentStack?: string;
}

// ==================== CMS DATA TYPES ====================

/**
 * CMS project response
 */
export interface CMSProjectResponse {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description: string;
    status: ProjectStatus;
    coverImage?: {
      data: {
        id: number;
        attributes: {
          url: string;
          alternativeText: string;
          formats?: Record<string, unknown>;
        };
      };
    };
    technologies: {
      data: Array<{
        id: number;
        attributes: {
          name: string;
          category: string;
        };
      }>;
    };
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * CMS collection response wrapper
 */
export interface CMSCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

// ==================== CONFIGURATION TYPES ====================

/**
 * Site configuration
 */
export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  url: HttpUrl;
  ogImage?: string;
  links: {
    github: HttpUrl;
    linkedin: HttpUrl;
    twitter?: HttpUrl;
  };
  creator: string;
  keywords: string[];
  locale: string;
  theme: {
    defaultMode: 'light' | 'dark';
    colors: Record<string, string>;
  };
}

/**
 * API configuration
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  cacheTime: number;
  headers: Record<string, string>;
}

/**
 * Feature flags
 */
export interface FeatureFlags {
  enableAnalytics: boolean;
  enableContactForm: boolean;
  enableBlog: boolean;
  enableTestimonials: boolean;
  enableDarkMode: boolean;
  maintenanceMode: boolean;
}

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if response is successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is Extract<ApiResponse<T>, { success: true }> {
  return response.success === true;
}

/**
 * Type guard to check if response is error
 */
export function isErrorResponse<T>(
  response: ApiResponse<T>
): response is Extract<ApiResponse<T>, { success: false }> {
  return response.success === false;
}

/**
 * Type guard for Project
 */
export function isProject(value: unknown): value is Project {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'title' in value &&
    'slug' in value &&
    'description' in value &&
    'status' in value
  );
}

/**
 * Type guard for Testimonial
 */
export function isTestimonial(value: unknown): value is Testimonial {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'company' in value &&
    'text' in value &&
    'rating' in value
  );
}

/**
 * Type guard for validation errors
 */
export function hasValidationErrors<T>(
  response: ApiResponse<T>
): response is Extract<ApiResponse<T>, { success: false }> & { details: ValidationError[] } {
  return (
    isErrorResponse(response) && Array.isArray(response.details) && response.details.length > 0
  );
}

// ==================== DISCRIMINATED UNION HELPERS ====================

/**
 * Status types with discriminated union
 */
export type LoadingState<T, E = Error> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: E };

/**
 * Async operation state
 */
export type AsyncState<T, E = string> =
  | { kind: 'not-started' }
  | { kind: 'loading' }
  | { kind: 'success'; value: T }
  | { kind: 'failure'; error: E };

/**
 * Resource state
 */
export type ResourceState<T> =
  | { type: 'loading' }
  | { type: 'loaded'; data: T }
  | { type: 'error'; message: string }
  | { type: 'empty' };

// ==================== EXPORT ALL ====================

/**
 * Re-export common types from React
 */
export type { ReactNode, ComponentType, MouseEvent, ChangeEvent, FormEvent } from 'react';
