'use client';

import React, { useState, useEffect, use, Component, ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { normalizeProjectId, parseProjectId, projectIdsEqual, getStatusVariant } from '@/lib/utils';
import styles from './project.module.css';

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ProjectErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProjectErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }
      return <CyberpunkErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

// ============================================================================
// ERROR TYPES
// ============================================================================

enum ErrorType {
  NOT_FOUND = 'NOT_FOUND',
  FETCH_FAILED = 'FETCH_FAILED',
  INVALID_ID = 'INVALID_ID',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN',
}

interface ErrorDetails {
  type: ErrorType;
  message: string;
  statusCode?: number;
  canRetry: boolean;
}

function parseError(error: unknown, statusCode?: number): ErrorDetails {
  if (statusCode === 404) {
    return {
      type: ErrorType.NOT_FOUND,
      message: 'Project not found in database',
      statusCode: 404,
      canRetry: false,
    };
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      message: 'Network connection failed. Please check your connection.',
      canRetry: true,
    };
  }

  if (error instanceof Error) {
    if (error.message.includes('not found')) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'The requested project could not be located',
        statusCode: 404,
        canRetry: false,
      };
    }

    if (error.message.includes('Invalid') || error.message.includes('invalid')) {
      return {
        type: ErrorType.INVALID_ID,
        message: 'Invalid project identifier',
        canRetry: false,
      };
    }

    return {
      type: ErrorType.FETCH_FAILED,
      message: error.message,
      canRetry: true,
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred',
    canRetry: true,
  };
}

// ============================================================================
// CYBERPUNK ERROR FALLBACK COMPONENT
// ============================================================================

interface CyberpunkErrorFallbackProps {
  error: Error;
  errorDetails?: ErrorDetails;
  onRetry?: () => void;
}

const CyberpunkErrorFallback: React.FC<CyberpunkErrorFallbackProps> = ({
  error,
  errorDetails: providedDetails,
  onRetry,
}) => {
  const errorDetails = providedDetails || parseError(error);
  const [glitchText, setGlitchText] = useState('ERROR');

  useEffect(() => {
    const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`ERROR';
    let iterations = 0;
    const maxIterations = 20;

    const interval = setInterval(() => {
      if (iterations < maxIterations) {
        setGlitchText(
          'ERROR'
            .split('')
            .map(() => chars[Math.floor(Math.random() * chars.length)])
            .join('')
        );
        iterations++;
      } else {
        setGlitchText('ERROR');
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getErrorIcon = () => {
    switch (errorDetails.type) {
      case ErrorType.NOT_FOUND:
        return '⚠️';
      case ErrorType.NETWORK_ERROR:
        return '📡';
      case ErrorType.INVALID_ID:
        return '🚫';
      case ErrorType.FETCH_FAILED:
        return '⚡';
      default:
        return '❌';
    }
  };

  const getErrorCode = () => {
    switch (errorDetails.type) {
      case ErrorType.NOT_FOUND:
        return '404';
      case ErrorType.NETWORK_ERROR:
        return 'NET_ERR';
      case ErrorType.INVALID_ID:
        return '400';
      case ErrorType.FETCH_FAILED:
        return '500';
      default:
        return 'UNKNOWN';
    }
  };

  return (
    <div className={styles.projectPage}>
      {/* Background Effects */}
      <div className={styles.cyberGrid}></div>
      <div className={styles.dataStream}></div>
      <div className={styles.crtOverlay}></div>

      <div className={styles.errorScreen}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={styles.errorContainer}
        >
          {/* Error Header */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              repeat: 3,
              repeatType: 'reverse',
            }}
            className={styles.errorIcon}
          >
            {getErrorIcon()}
          </motion.div>

          {/* Glitch Title */}
          <motion.h1 initial={{ x: -20 }} animate={{ x: 0 }} className={styles.errorTitle}>
            [{glitchText}: {getErrorCode()}]
          </motion.h1>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={styles.errorMessageBox}
          >
            <div className={styles.errorMessageHeader}>
              <span className={styles.terminalPrompt}>{'>'}_</span>
              <span className={styles.errorLabel}>SYSTEM MESSAGE:</span>
            </div>
            <p className={styles.errorMessage}>{errorDetails.message}</p>

            {errorDetails.statusCode && (
              <div className={styles.errorMetadata}>
                <span className={styles.metadataItem}>
                  [STATUS_CODE: {errorDetails.statusCode}]
                </span>
                <span className={styles.metadataItem}>[TYPE: {errorDetails.type}]</span>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={styles.errorActions}
          >
            <Link href="/projects" className={styles.primaryButton}>
              <span className={styles.buttonIcon}>←</span>
              <span>[RETURN_TO_PROJECTS]</span>
            </Link>

            {errorDetails.canRetry && onRetry && (
              <button onClick={onRetry} className={styles.secondaryButton}>
                <span className={styles.buttonIcon}>⟳</span>
                <span>[TRY_AGAIN]</span>
              </button>
            )}

            <Link href="/" className={styles.tertiaryButton}>
              <span className={styles.buttonIcon}>⌂</span>
              <span>[HOME_BASE]</span>
            </Link>
          </motion.div>

          {/* Technical Details (collapsed by default) */}
          <details className={styles.technicalDetails}>
            <summary className={styles.detailsSummary}>[VIEW_TECHNICAL_DETAILS]</summary>
            <div className={styles.detailsContent}>
              <pre className={styles.errorStack}>
                <code>{error.stack || error.message}</code>
              </pre>
            </div>
          </details>
        </motion.div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

// Glitch text component
const GlitchText = ({ children, scramble = false }: { children: string; scramble?: boolean }) => {
  const [displayText, setDisplayText] = useState(children);
  const [isHovered, setIsHovered] = useState(false);
  const originalText = React.useRef(children);

  useEffect(() => {
    if (scramble && isHovered) {
      const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEF';
      let iterations = 0;

      const interval = setInterval(() => {
        setDisplayText(
          originalText.current
            .split('')
            .map((char, index) => {
              if (index < iterations) return originalText.current[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('')
        );

        if (iterations >= originalText.current.length) {
          clearInterval(interval);
        }
        iterations += 1;
      }, 30);

      return () => clearInterval(interval);
    } else {
      setDisplayText(children);
    }
  }, [isHovered, children, scramble]);

  return (
    <span
      className={styles.glitchText}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {displayText}
    </span>
  );
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Technology {
  id: number;
  name: string;
}

interface Project {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage?: {
    url: string;
    alternativeText: string;
  };
  status: string;
  technologies: Technology[];
  liveUrl?: string;
  repoUrl?: string;
  detailedContent?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function ProjectDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorDetails | null>(null);

  // Validate project ID
  useEffect(() => {
    const id = resolvedParams.id;
    const parsed = parseProjectId(id);
    if (!id || isNaN(parsed)) {
      setError({
        type: ErrorType.INVALID_ID,
        message: `Invalid project ID: "${id}". Project ID must be a valid number or numeric string.`,
        canRetry: false,
      });
      setLoading(false);
    }
  }, [resolvedParams.id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${resolvedParams.id}`);

      if (!response.ok) {
        // If project not found (404), trigger Next.js notFound() page
        if (response.status === 404) {
          notFound();
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.project) {
        // If project data is missing, also trigger notFound()
        notFound();
      }

      setProject(data.project);
    } catch (err) {
      // Only set error for non-404 errors (404s will have already called notFound())
      console.error('Error fetching project:', err);
      const errorDetails = parseError(
        err,
        err instanceof Error && err.message.includes('404') ? 404 : undefined
      );

      // If it's a 404 error but we somehow got here, call notFound()
      if (errorDetails.type === ErrorType.NOT_FOUND) {
        notFound();
      }

      setError(errorDetails);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setAllProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error fetching all projects:', err);
      // Don't set error state for this - it's not critical
    }
  };

  useEffect(() => {
    // Only fetch if we don't have an error already (like invalid ID)
    if (!error) {
      fetchProject();
      fetchAllProjects();
    }
  }, [resolvedParams.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Get previous and next projects
  const currentIndex = allProjects.findIndex((p) => projectIdsEqual(p.id, resolvedParams.id));
  const previousProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  // Loading state with detailed skeleton
  if (loading) {
    return (
      <div className={styles.projectPage}>
        {/* Background Effects */}
        <div className={styles.cyberGrid}></div>
        <div className={styles.dataStream}></div>
        <div className={styles.crtOverlay}></div>

        {/* Navigation Bar Skeleton */}
        <nav className={styles.navigation}>
          <div className={styles.backLink} style={{ opacity: 0.3 }}>
            <span className={styles.backArrow}>←</span>
            <span>[LOADING...]</span>
          </div>
        </nav>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={styles.loadingContainer}
        >
          {/* Header Skeleton */}
          <div className={styles.projectHeader} style={{ opacity: 0.6 }}>
            <div className={styles.headerTag}>[LOADING_PROJECT...]</div>

            {/* Title Skeleton */}
            <div
              style={{
                height: '3rem',
                width: '70%',
                background:
                  'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
                marginBottom: '1rem',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            ></div>

            {/* Description Skeleton */}
            <div
              style={{
                height: '1.5rem',
                width: '90%',
                background:
                  'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
                marginBottom: '0.5rem',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            ></div>
            <div
              style={{
                height: '1.5rem',
                width: '60%',
                background:
                  'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
                border: '1px solid rgba(0, 255, 136, 0.2)',
              }}
            ></div>
          </div>

          {/* Content Grid Skeleton */}
          <div className={styles.contentGrid}>
            {/* Main Content Skeleton */}
            <div className={styles.mainContent}>
              {/* Image Skeleton */}
              <div className={styles.imageFrame}>
                <div className={styles.frameHeader}>
                  <span className={styles.frameTitle}>[LOADING_IMAGE...]</span>
                </div>
                <div
                  style={{
                    aspectRatio: '16/9',
                    background:
                      'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ color: 'rgba(0, 255, 136, 0.5)', fontFamily: 'monospace' }}>
                    [LOADING_VISUAL_DATA...]
                  </span>
                </div>
              </div>

              {/* Content Blocks Skeleton */}
              <div className={styles.detailedContent} style={{ opacity: 0.6 }}>
                <div className={styles.contentHeader}>
                  <span className={styles.contentTag}>[LOADING_DOCUMENTATION...]</span>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ marginBottom: '1rem' }}>
                    <div
                      style={{
                        height: '1.2rem',
                        width: '100%',
                        background:
                          'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite',
                        marginBottom: '0.5rem',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                    <div
                      style={{
                        height: '1.2rem',
                        width: '95%',
                        background:
                          'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite',
                        marginBottom: '0.5rem',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        animationDelay: `${i * 0.1 + 0.05}s`,
                      }}
                    ></div>
                    <div
                      style={{
                        height: '1.2rem',
                        width: '80%',
                        background:
                          'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s infinite',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        animationDelay: `${i * 0.1 + 0.1}s`,
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className={styles.sidebar}>
              {/* Tech Stack Panel Skeleton */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelTitle}>[LOADING_TECH_STACK...]</span>
                </div>
                <div className={styles.panelContent}>
                  <div className={styles.techGrid}>
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: '2rem',
                          background:
                            'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite',
                          border: '1px solid rgba(0, 255, 136, 0.2)',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata Panel Skeleton */}
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <span className={styles.panelTitle}>[LOADING_METADATA...]</span>
                </div>
                <div className={styles.panelContent}>
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={styles.infoItem} style={{ marginBottom: '0.75rem' }}>
                      <div
                        style={{
                          height: '1rem',
                          width: '100%',
                          background:
                            'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 2s infinite',
                          border: '1px solid rgba(0, 255, 136, 0.2)',
                          animationDelay: `${i * 0.1}s`,
                        }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Loading message */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '2rem',
              fontFamily: 'monospace',
              color: 'rgba(0, 255, 136, 0.7)',
              fontSize: '0.875rem',
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              [ACCESSING_PROJECT_DATABASE]
            </motion.span>
          </div>
        </motion.div>

        <style jsx global>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <CyberpunkErrorFallback
        error={new Error(error?.message || 'Project not found')}
        errorDetails={error || parseError(new Error('Project not found'), 404)}
        onRetry={error?.canRetry ? fetchProject : undefined}
      />
    );
  }

  const getStatusClass = (status: string) => {
    const variant = getStatusVariant(status);
    switch (variant) {
      case 'deployed':
        return styles.statusDeployed;
      case 'active':
        return styles.statusActive;
      case 'in-dev':
        return styles.statusInDev;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={styles.projectPage}>
      {/* Background Effects */}
      <div className={styles.cyberGrid}></div>
      <div className={styles.dataStream}></div>
      <div className={styles.crtOverlay}></div>

      {/* Navigation Bar */}
      <nav className={styles.navigation}>
        <Link href="/projects" className={styles.backLink}>
          <span className={styles.backArrow}>←</span>
          <span>[PROJECTS_ARCHIVE]</span>
        </Link>
        <Link href="/" className={styles.homeLink}>
          <span>[HOME_BASE]</span>
        </Link>
      </nav>

      {/* Project Header */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={styles.projectHeader}
      >
        <div className={styles.headerTag}>[PROJECT_FILE_{String(project.id).padStart(3, '0')}]</div>

        <h1 className={styles.projectTitle}>
          <GlitchText scramble>{project.title}</GlitchText>
        </h1>

        <p className={styles.projectDescription}>{project.description}</p>

        <div className={styles.projectMeta}>
          <div className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
            <span className={styles.statusDot}></span>
            <span>[STATUS: {project.status.toUpperCase()}]</span>
          </div>

          <div className={styles.actionButtons}>
            {project.liveUrl && (
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionButton}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={styles.buttonIcon}>🚀</span>
                <span>[VIEW_LIVE]</span>
              </motion.a>
            )}

            {project.repoUrl && (
              <motion.a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.actionButton} ${styles.repoButton}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className={styles.buttonIcon}>📁</span>
                <span>[VIEW_CODE]</span>
              </motion.a>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column - Project Details */}
        <motion.main
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={styles.mainContent}
        >
          {/* Project Image */}
          {project.coverImage && (
            <div className={styles.imageFrame}>
              <div className={styles.frameHeader}>
                <span className={styles.frameTitle}>[VISUAL_OUTPUT]</span>
                <div className={styles.frameControls}>
                  <span className={styles.controlDot}></span>
                  <span className={styles.controlDot}></span>
                  <span className={styles.controlDot}></span>
                </div>
              </div>
              <div className={styles.imageContainer}>
                <Image
                  src={project.coverImage.url}
                  alt={project.coverImage.alternativeText || project.title}
                  width={1200}
                  height={675}
                  className={styles.projectImage}
                  priority
                />
                <div className={styles.scanlines}></div>
              </div>
            </div>
          )}

          {/* Detailed Content */}
          {project.detailedContent && (
            <div className={styles.detailedContent}>
              <div className={styles.contentHeader}>
                <span className={styles.contentTag}>[PROJECT_DOCUMENTATION]</span>
              </div>
              <div
                className={styles.richContent}
                dangerouslySetInnerHTML={{ __html: project.detailedContent }}
              />
            </div>
          )}
        </motion.main>

        {/* Right Column - Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={styles.sidebar}
        >
          {/* Tech Stack Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>[TECHNOLOGY_STACK]</span>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.techGrid}>
                {project.technologies.map((tech) => (
                  <div key={tech.id} className={styles.techItem}>
                    <span className={styles.techIcon}>▲</span>
                    <span className={styles.techName}>{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Info Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>[PROJECT_METADATA]</span>
            </div>
            <div className={styles.panelContent}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>[CREATED]</span>
                <span className={styles.infoValue}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>[UPDATED]</span>
                <span className={styles.infoValue}>
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>[PROJECT_ID]</span>
                <span className={styles.infoValue}>#{String(project.id).padStart(3, '0')}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <span className={styles.panelTitle}>[QUICK_ACTIONS]</span>
            </div>
            <div className={styles.panelContent}>
              <Link href="/projects" className={styles.quickAction}>
                <span>◈</span>
                <span>Browse All Projects</span>
              </Link>
              <Link href="/#contact" className={styles.quickAction}>
                <span>▲</span>
                <span>Get In Touch</span>
              </Link>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Project Navigation */}
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className={styles.projectNavigation}
      >
        <div className={styles.navGrid}>
          {previousProject ? (
            <Link
              href={`/projects/${normalizeProjectId(previousProject.id)}`}
              className={styles.navCard}
            >
              <span className={styles.navArrow}>←</span>
              <div className={styles.navContent}>
                <span className={styles.navLabel}>[PREVIOUS_PROJECT]</span>
                <span className={styles.navTitle}>{previousProject.title}</span>
              </div>
            </Link>
          ) : (
            <div className={styles.navPlaceholder}></div>
          )}

          <Link href="/projects" className={styles.navCenter}>
            <span className={styles.centerIcon}>◈</span>
            <span>[ALL_PROJECTS]</span>
          </Link>

          {nextProject ? (
            <Link
              href={`/projects/${normalizeProjectId(nextProject.id)}`}
              className={styles.navCard}
            >
              <div className={styles.navContent}>
                <span className={styles.navLabel}>[NEXT_PROJECT]</span>
                <span className={styles.navTitle}>{nextProject.title}</span>
              </div>
              <span className={styles.navArrow}>→</span>
            </Link>
          ) : (
            <div className={styles.navPlaceholder}></div>
          )}
        </div>
      </motion.footer>
    </div>
  );
}

// ============================================================================
// EXPORTED COMPONENT WITH ERROR BOUNDARY
// ============================================================================

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProjectErrorBoundary>
      <ProjectDetailContent params={params} />
    </ProjectErrorBoundary>
  );
}
