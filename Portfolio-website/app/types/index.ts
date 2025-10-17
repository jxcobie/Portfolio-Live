// ==================== CORE TYPES ====================

export interface Technology {
  id: number;
  name: string;
  category?: string;
  icon_url?: string;
}

export interface ProjectImage {
  id: number;
  url: string;
  alternativeText: string;
  caption?: string;
  image_type: 'cover' | 'gallery';
}

export interface Project {
  id: string | number;
  title: string;
  slug: string;
  description: string;
  status: 'Deployed' | 'Active' | 'In Dev' | 'Archive';
  liveUrl?: string;
  repoUrl?: string;
  demoUrl?: string;
  coverImage?: ProjectImage;
  galleryImages?: ProjectImage[];
  technologies: Technology[];
  client?: string;
  duration?: string;
  role?: string;
  teamSize?: number;
  detailedContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: string[];
  color: 'cyan' | 'orange' | 'purple' | 'green';
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

// ==================== COMPONENT PROPS ====================

export interface GlitchTextProps {
  children: string;
  scramble?: boolean;
  className?: string;
  delay?: number;
}

export interface CircuitTraceProps {
  startElement: string;
  endElement: string;
  delay?: number;
  className?: string;
}

export interface SectionHeaderProps {
  tag: string;
  title: string;
  className?: string;
}

export interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  initial?: object;
  animate?: object;
  transition?: object;
  viewport?: object;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

export interface LoadingStateProps {
  text?: string;
  className?: string;
}

// ==================== ANALYTICS TYPES ====================

export interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
  page_url?: string;
  referrer?: string;
}

// ==================== FORM VALIDATION ====================

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

export interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  isLoading?: boolean;
}

// ==================== NAVIGATION TYPES ====================

export interface NavItem {
  id: string;
  label: string;
  href: string;
  section: string;
}

export interface NavigationProps {
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

// ==================== HERO SECTION TYPES ====================

export interface HeroSectionProps {
  onAnimationComplete?: () => void;
}

export interface IntroAnimationProps {
  onComplete: () => void;
  logoLines: string[];
  slogan: string;
}

// ==================== PROJECTS SECTION TYPES ====================

export interface ProjectsGridProps {
  projects: Project[];
  loading?: boolean;
  error?: string;
}

export interface ProjectCardProps {
  project: Project;
  index: number;
}

// ==================== CONTACT SECTION TYPES ====================

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
  messageId?: string;
}

// ==================== UTILITY TYPES ====================

export type StatusVariant = 'deployed' | 'active' | 'in-dev' | 'default';

export type AnimationVariant = 'hidden' | 'visible';

export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string | number[];
}

// ==================== ERROR TYPES ====================

export interface ComponentError {
  message: string;
  stack?: string;
  componentStack?: string;
}

export interface ErrorInfo {
  componentStack: string;
}
