'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Project, StatusVariant } from '@/app/types';
import { normalizeProjectId, getStatusVariant } from '@/lib/utils';
import SectionHeader from '../shared/SectionHeader';
import GlitchText from '../shared/GlitchText';
import LoadingState from '../shared/LoadingState';

// Project Card Component
interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = memo<ProjectCardProps>(({ project, index }) => {
  const getStatusClass = useCallback((status: string): StatusVariant => {
    return getStatusVariant(status);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.21, 1.11, 0.81, 0.99],
      }}
      className="project-card-wrapper"
    >
      <Link
        href={`/projects/${normalizeProjectId(project.id)}`}
        className="project-card-link"
        aria-label={`View details for ${project.title}`}
      >
        <article className="project-card-new">
          {/* Cyber border effect */}
          <div className="card-border-effect" aria-hidden="true"></div>

          {/* Project Image */}
          <div className="project-image-container">
            <div className="placeholder-image">
              <div className="placeholder-content">
                <span className="placeholder-icon" aria-hidden="true">
                  ▲
                </span>
                <span className="placeholder-text">[NO_IMAGE]</span>
              </div>
            </div>
            <div className="image-overlay" aria-hidden="true"></div>
            <div className="scanlines" aria-hidden="true"></div>
          </div>

          {/* Content */}
          <div className="project-content-new">
            {/* Status Badge */}
            <div
              className={`status-badge status-${getStatusClass(project.status)}`}
              role="status"
              aria-label={`Project status: ${project.status}`}
            >
              <span className="status-dot" aria-hidden="true"></span>
              <span className="status-text">[{project.status.toUpperCase()}]</span>
            </div>

            <h3 className="project-title-new">
              <GlitchText>{project.title}</GlitchText>
            </h3>

            <p className="project-description-new">{project.description}</p>

            {/* Technologies */}
            <div className="tech-stack-new" role="list" aria-label="Technologies used">
              {project.technologies?.slice(0, 4).map((tech) => (
                <span key={tech.name} className="tech-chip-new" role="listitem">
                  {tech.name}
                </span>
              ))}
              {project.technologies?.length > 4 && (
                <span
                  className="tech-more"
                  aria-label={`Plus ${project.technologies.length - 4} more technologies`}
                >
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>

            {/* Action Links */}
            <div className="project-actions">
              <span className="view-more">VIEW PROJECT →</span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
});

ProjectCard.displayName = 'ProjectCard';

// Projects Grid Component
interface ProjectsGridProps {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const ProjectsGrid = memo<ProjectsGridProps>(({ projects, loading, error }) => {
  if (loading) {
    return <LoadingState text="Loading projects" />;
  }

  if (error) {
    return (
      <div className="error-state p-8 text-center">
        <div className="mb-4 font-mono text-red-400">[ERROR_LOADING_PROJECTS]</div>
        <p className="mb-4 text-gray-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-red-500/50 bg-red-500/20 px-4 py-2 font-mono text-sm text-red-300 transition-colors hover:bg-red-500/30"
        >
          [ RETRY ]
        </button>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="empty-state p-8 text-center">
        <div className="mb-4 font-mono text-cyan-400">[NO_PROJECTS_FOUND]</div>
        <p className="text-gray-300">
          Projects will be displayed here once they are added to the CMS.
        </p>
      </div>
    );
  }

  return (
    <div className="projects-grid">
      {projects.map((project, index) => (
        <ProjectCard key={normalizeProjectId(project.id)} project={project} index={index} />
      ))}
    </div>
  );
});

ProjectsGrid.displayName = 'ProjectsGrid';

// View All Projects Button
const ViewAllButton = memo(() => (
  <div className="mt-12 text-center">
    <Link href="/projects">
      <motion.button
        className="border-2 border-green-400 bg-transparent px-8 py-3 font-mono text-sm tracking-wider text-green-400 transition-all duration-300 hover:bg-green-400 hover:text-black focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="View all projects"
      >
        [ VIEW ALL PROJECTS ]
      </motion.button>
    </Link>
  </div>
));

ViewAllButton.displayName = 'ViewAllButton';

// Main Projects Section Component
const ProjectsSection = memo(() => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects/featured', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      setError(errorMessage);
      console.error('Error fetching projects:', err);

      // Fallback to hardcoded data if API fails
      setProjects([
        {
          id: 'ecommerce',
          title: 'E-Commerce Automation Suite',
          slug: 'ecommerce-automation-suite',
          description: 'Full-stack platform with automated inventory and order processing.',
          technologies: [
            { id: 1, name: 'Next.js' },
            { id: 2, name: 'PostgreSQL' },
            { id: 3, name: 'n8n' },
            { id: 4, name: 'Stripe' },
          ],
          status: 'Deployed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'crm',
          title: 'CRM Integration Platform',
          slug: 'crm-integration-platform',
          description: 'Custom CRM with automated lead scoring and multi-platform sync.',
          technologies: [
            { id: 1, name: 'React' },
            { id: 2, name: 'Node.js' },
            { id: 3, name: 'MongoDB' },
            { id: 4, name: 'HubSpot' },
          ],
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'social',
          title: 'Social Media Dashboard',
          slug: 'social-media-dashboard',
          description: 'Multi-account management with automated posting and analytics.',
          technologies: [
            { id: 1, name: 'React' },
            { id: 2, name: 'Express' },
            { id: 3, name: 'n8n' },
            { id: 4, name: 'Chart.js' },
          ],
          status: 'In Dev',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <section
      id="projects"
      className="content-section"
      role="region"
      aria-labelledby="projects-heading"
    >
      <SectionHeader tag="PROJECT_LOG" title="FEATURED PROJECTS" />

      <ProjectsGrid projects={projects} loading={loading} error={error} />

      {/* View All Projects Button - only show if we have projects */}
      {!loading && !error && projects.length > 0 && <ViewAllButton />}
    </section>
  );
});

ProjectsSection.displayName = 'ProjectsSection';

export default ProjectsSection;
