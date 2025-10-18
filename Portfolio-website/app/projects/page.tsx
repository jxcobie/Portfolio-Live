'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { normalizeProjectId, getStatusVariant } from '@/lib/utils';
import styles from './projects.module.css';

interface Technology {
  id: number;
  name: string;
}

interface Project {
  id: string | number;
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
  createdAt: string;
  updatedAt: string;
}

// Glitch text component matching home page style
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

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
      className={styles.projectCardWrapper}
    >
      <Link href={`/projects/${normalizeProjectId(project.id)}`} className={styles.projectCardLink}>
        <article className={styles.projectCard}>
          {/* Cyber border effect */}
          <div className={styles.cardBorderEffect}></div>

          {/* Project Image */}
          <div className={styles.projectImageContainer}>
            {project.coverImage ? (
              <Image
                src={project.coverImage.url}
                alt={project.coverImage.alternativeText || project.title}
                fill
                className={styles.projectImage}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className={styles.placeholderImage}>
                <div className={styles.placeholderContent}>
                  <span className={styles.placeholderIcon}>▲</span>
                  <span className={styles.placeholderText}>[NO_IMAGE]</span>
                </div>
              </div>
            )}
            <div className={styles.imageOverlay}></div>
            <div className={styles.scanlines}></div>
          </div>

          {/* Content */}
          <div className={styles.projectContent}>
            {/* Status Badge */}
            <div className={`${styles.statusBadge} ${getStatusClass(project.status)}`}>
              <span className={styles.statusDot}></span>
              <span className={styles.statusText}>[{project.status.toUpperCase()}]</span>
            </div>

            <h3 className={styles.projectTitle}>
              <GlitchText>{project.title}</GlitchText>
            </h3>

            <p className={styles.projectDescription}>{project.description}</p>

            {/* Technologies */}
            <div className={styles.techStack}>
              {project.technologies.slice(0, 4).map((tech) => (
                <span key={tech.id} className={styles.techChip}>
                  {tech.name}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className={styles.techMore}>+{project.technologies.length - 4}</span>
              )}
            </div>

            {/* Action Links */}
            <div className={styles.projectActions}>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionIcon}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="View live site"
                >
                  <span>🔗</span>
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionIcon}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="View repository"
                >
                  <span>📁</span>
                </a>
              )}
              <span className={styles.viewMore}>VIEW PROJECT →</span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

const FilterButton = ({
  label,
  isActive,
  onClick,
  count,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}) => (
  <button
    onClick={onClick}
    className={`${styles.filterButton} ${isActive ? styles.filterActive : ''}`}
  >
    <span className={styles.filterLabel}>{label}</span>
    <span className={styles.filterCount}>{count}</span>
  </button>
);

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects =
    filter === 'all'
      ? projects
      : projects.filter((project) => project.status.toLowerCase() === filter.toLowerCase());

  const getFilterCounts = () => {
    const counts = {
      all: projects.length,
      deployed: projects.filter((p) => p.status.toLowerCase() === 'deployed').length,
      active: projects.filter((p) => p.status.toLowerCase() === 'active').length,
      'in dev': projects.filter((p) => p.status.toLowerCase() === 'in dev').length,
    };
    return counts;
  };

  const filterCounts = getFilterCounts();

  // Skeleton Card Component
  const SkeletonCard = ({ index }: { index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
      className={styles.projectCardWrapper}
    >
      <div className={styles.projectCard} style={{ opacity: 0.6 }}>
        {/* Cyber border effect */}
        <div className={styles.cardBorderEffect}></div>

        {/* Image Skeleton */}
        <div className={styles.projectImageContainer} style={{
          background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animationDelay: `${index * 0.1}s`
        }}>
          <span style={{ color: 'rgba(0, 255, 136, 0.4)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
            [LOADING_IMAGE...]
          </span>
        </div>

        {/* Content Skeleton */}
        <div className={styles.projectContent}>
          {/* Status Badge Skeleton */}
          <div style={{
            height: '1.5rem',
            width: '7rem',
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
            marginBottom: '0.75rem',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            animationDelay: `${index * 0.1 + 0.1}s`
          }}></div>

          {/* Title Skeleton */}
          <div style={{
            height: '1.75rem',
            width: '80%',
            background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
            marginBottom: '0.75rem',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            animationDelay: `${index * 0.1 + 0.2}s`
          }}></div>

          {/* Description Skeleton */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              height: '1rem',
              width: '100%',
              background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              marginBottom: '0.5rem',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              animationDelay: `${index * 0.1 + 0.3}s`
            }}></div>
            <div style={{
              height: '1rem',
              width: '90%',
              background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              marginBottom: '0.5rem',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              animationDelay: `${index * 0.1 + 0.4}s`
            }}></div>
            <div style={{
              height: '1rem',
              width: '70%',
              background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              animationDelay: `${index * 0.1 + 0.5}s`
            }}></div>
          </div>

          {/* Tech Stack Skeleton */}
          <div className={styles.techStack}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: '1.5rem',
                width: '4rem',
                background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                animationDelay: `${index * 0.1 + 0.6 + i * 0.05}s`
              }}></div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className={styles.projectsPage}>
        {/* Background Effects */}
        <div className={styles.cyberGrid}></div>
        <div className={styles.dataStream}></div>
        <div className={styles.crtOverlay}></div>

        {/* Navigation */}
        <nav className={styles.navigation}>
          <div className={styles.backLink} style={{ opacity: 0.3 }}>
            <span className={styles.backArrow}>←</span>
            <span>[LOADING...]</span>
          </div>
        </nav>

        {/* Header */}
        <header className={styles.pageHeader}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={styles.headerContent}
            style={{ opacity: 0.6 }}
          >
            <div className={styles.headerTag}>[PROJECT_ARCHIVE]</div>
            <div style={{
              height: '3rem',
              width: '60%',
              background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              marginBottom: '1rem',
              border: '1px solid rgba(0, 255, 136, 0.2)'
            }}></div>
            <div className={styles.headerLine}></div>
            <div style={{
              height: '1.5rem',
              width: '80%',
              background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s infinite',
              border: '1px solid rgba(0, 255, 136, 0.2)'
            }}></div>
          </motion.div>
        </header>

        {/* Filters Skeleton */}
        <section className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{
                height: '2.5rem',
                width: '8rem',
                background: 'linear-gradient(90deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.2) 50%, rgba(0, 255, 136, 0.1) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s infinite',
                border: '1px solid rgba(0, 255, 136, 0.2)',
                animationDelay: `${i * 0.1}s`
              }}></div>
            ))}
          </div>
        </section>

        {/* Skeleton Cards */}
        <main className={styles.projectsContainer}>
          <div className={styles.projectsGrid}>
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} index={index} />
            ))}
          </div>
        </main>

        {/* Loading Message */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          fontFamily: 'monospace',
          color: 'rgba(0, 255, 136, 0.7)',
          fontSize: '0.875rem'
        }}>
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            [LOADING_PROJECT_DATABASE...]
          </motion.span>
        </div>

        <style jsx>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.projectsPage}>
        <div className={styles.cyberGrid}></div>
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2 className={styles.errorTitle}>[ERROR: CONNECTION_FAILED]</h2>
            <p className={styles.errorMessage}>{error}</p>
            <Link href="/" className={styles.returnButton}>
              ← RETURN TO BASE
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.projectsPage}>
      {/* Background Effects */}
      <div className={styles.cyberGrid}></div>
      <div className={styles.dataStream}></div>
      <div className={styles.crtOverlay}></div>

      {/* Navigation */}
      <nav className={styles.navigation}>
        <Link href="/" className={styles.backLink}>
          <span className={styles.backArrow}>←</span>
          <span>[RETURN_TO_PORTFOLIO]</span>
        </Link>
      </nav>

      {/* Header */}
      <header className={styles.pageHeader}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.headerContent}
        >
          <div className={styles.headerTag}>[PROJECT_ARCHIVE]</div>
          <h1 className={styles.pageTitle}>
            <GlitchText scramble>ALL PROJECTS</GlitchText>
          </h1>
          <div className={styles.headerLine}></div>
          <p className={styles.pageSubtitle}>
            Complete collection of development work // Full-stack applications & automation
            workflows
          </p>
        </motion.div>
      </header>

      {/* Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          {['all', 'deployed', 'active', 'in dev'].map((filterOption) => (
            <FilterButton
              key={filterOption}
              label={filterOption.toUpperCase()}
              count={filterCounts[filterOption as keyof typeof filterCounts]}
              isActive={filter === filterOption}
              onClick={() => setFilter(filterOption)}
            />
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <main className={styles.projectsContainer}>
        <AnimatePresence mode="wait">
          {filteredProjects.length > 0 ? (
            <motion.div
              key={filter}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={styles.projectsGrid}
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard key={normalizeProjectId(project.id)} project={project} index={index} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.emptyState}
            >
              <div className={styles.emptyIcon}>◈</div>
              <h3 className={styles.emptyTitle}>[NO_PROJECTS_FOUND]</h3>
              <p className={styles.emptyMessage}>No projects match the current filter parameters</p>
              <button onClick={() => setFilter('all')} className={styles.resetButton}>
                [RESET_FILTERS]
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer CTA */}
      <footer className={styles.pageFooter}>
        <div className={styles.footerContent}>
          <h2 className={styles.footerTitle}>READY TO BUILD SOMETHING AMAZING?</h2>
          <p className={styles.footerText}>Let&apos;s transform your ideas into digital reality</p>
          <div className={styles.footerActions}>
            <Link href="/#contact" className={styles.ctaButton}>
              [INITIATE_CONTACT]
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
