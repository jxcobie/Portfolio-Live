'use client';

import React, { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import styles from './project.module.css';

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

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/projects/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error('Project not found');
        }
        const data = await response.json();
        setProject(data.project);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project');
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
      }
    };

    fetchProject();
    fetchAllProjects();
  }, [resolvedParams.id]);

  // Get previous and next projects
  const currentIndex = allProjects.findIndex((p) => p.id === parseInt(resolvedParams.id));
  const previousProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  if (loading) {
    return (
      <div className={styles.projectPage}>
        <div className={styles.cyberGrid}></div>
        <div className={styles.loadingScreen}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.loadingContainer}
          >
            <div className={styles.loadingText}>
              <span>[ACCESSING_PROJECT_DATABASE]</span>
              <div className={styles.loadingBar}>
                <div className={styles.loadingProgress}></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className={styles.projectPage}>
        <div className={styles.cyberGrid}></div>
        <div className={styles.errorScreen}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.errorContainer}
          >
            <h1 className={styles.errorTitle}>[ERROR: PROJECT_NOT_FOUND]</h1>
            <p className={styles.errorMessage}>
              {error || 'The requested project could not be located in the database.'}
            </p>
            <Link href="/projects" className={styles.returnButton}>
              ← [RETURN_TO_PROJECTS]
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deployed':
        return styles.statusDeployed;
      case 'active':
        return styles.statusActive;
      case 'in dev':
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
            <Link href={`/projects/${previousProject.id}`} className={styles.navCard}>
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
            <Link href={`/projects/${nextProject.id}`} className={styles.navCard}>
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
