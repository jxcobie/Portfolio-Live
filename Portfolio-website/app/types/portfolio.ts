// ==================== PORTFOLIO DATA TYPES ====================

/**
 * Personal information and contact details
 */
export interface PersonalInfo {
  name: string;
  title: string;
  tagline: string;
  about: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
  experience: string;
  avatar?: string;
  resume?: string;
}

/**
 * Skill category with associated skills
 */
export interface SkillCategory {
  id?: number;
  category: string;
  skills: string[];
  icon?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

/**
 * Project information
 */
export interface ProjectInfo {
  id: number;
  title: string;
  description: string;
  tech: string[];
  status: 'Featured Project' | 'Client Work' | 'Portfolio Project' | 'In Development' | 'Completed';
  link: string;
  image: string;
  featured: boolean;
  completedDate: string;
  clientType: 'Enterprise' | 'SMB' | 'Startup' | 'Personal' | 'Open Source';
  githubUrl?: string;
  liveUrl?: string;
  category?: string;
  duration?: string;
  teamSize?: number;
  challenges?: string[];
  outcomes?: string[];
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
  rating: number;
  date: string;
  avatar?: string;
  projectId?: number;
  verified?: boolean;
}

/**
 * Complete portfolio data structure
 */
export interface PortfolioData {
  personal: PersonalInfo;
  skills: SkillCategory[];
  projects: ProjectInfo[];
  testimonials: Testimonial[];
}

/**
 * API Request types
 */
export interface PortfolioUpdateRequest {
  section: keyof PortfolioData;
  data: PersonalInfo | SkillCategory[] | ProjectInfo[] | Testimonial[];
}

export interface PortfolioActionRequest {
  action:
    | 'add_project'
    | 'add_testimonial'
    | 'add_skill_category'
    | 'update_project'
    | 'update_testimonial';
  section: string;
  data: Partial<ProjectInfo> | Partial<Testimonial> | SkillCategory;
  id?: number;
}

export interface PortfolioDeleteRequest {
  section: 'projects' | 'testimonials' | 'skills';
  id: number;
}

/**
 * API Response types
 */
export interface PortfolioApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
}

export interface PortfolioGetResponse extends PortfolioApiResponse<PortfolioData> {}

export interface PortfolioSectionResponse<T = any> extends PortfolioApiResponse<T> {}

/**
 * Rate limiting types
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
}

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Error response with validation details
 */
export interface ErrorResponse extends PortfolioApiResponse {
  success: false;
  error: string;
  details?: ValidationError[];
  stack?: string;
}
