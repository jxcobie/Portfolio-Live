'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Mock project data - in production, this would come from your API
const getProjectData = (id: string) => {
  const projects = {
    '1': {
      id: 1,
      title: 'E-Commerce Automation Suite',
      shortDescription: 'Full-stack e-commerce platform with automated workflows',
      fullDescription: `A comprehensive e-commerce solution built with modern technologies and powered by intelligent automation workflows. This project demonstrates the perfect fusion of robust full-stack development with cutting-edge automation capabilities.

The platform features automated inventory management, seamless order processing, and intelligent customer communication workflows powered by n8n. Every aspect has been designed to minimize manual intervention while maximizing efficiency and user experience.

Key achievements include 300% improvement in operational efficiency, 99.9% uptime, and seamless integration with multiple third-party services including payment processors, shipping providers, and CRM systems.`,
      technologies: [
        'Next.js',
        'TypeScript',
        'PostgreSQL',
        'n8n',
        'Stripe API',
        'Email Automation',
        'Docker',
        'AWS',
      ],
      category: 'Enterprise Solution',
      status: 'Live',
      completedDate: '2024-01-15',
      clientType: 'Enterprise',
      projectUrl: '#',
      githubUrl: '#',
      images: [
        '/project1-main.jpg',
        '/project1-dashboard.jpg',
        '/project1-automation.jpg',
        '/project1-mobile.jpg',
      ],
      features: [
        'Real-time inventory tracking and automated restock notifications',
        'Intelligent order processing with automated status updates',
        'Customer communication workflows with personalized messaging',
        'Advanced analytics dashboard with predictive insights',
        'Multi-platform integration (Shopify, WooCommerce, Custom)',
        'Automated billing and invoice generation',
        'Smart recommendation engine',
        'Mobile-responsive admin panel',
      ],
      metrics: {
        'Performance Improvement': '300%',
        Uptime: '99.9%',
        'Orders Processed': '10,000+',
        'Automation Rules': '50+',
        'API Integrations': '15+',
        'Response Time': '<200ms',
      },
      testimonial: {
        text: 'Jacob delivered an exceptional automation solution that transformed our workflow efficiency by 300%. His expertise in n8n and full-stack development is unmatched.',
        author: 'John Smith',
        position: 'CTO, TechCorp Inc.',
      },
      techStack: {
        Frontend: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        Backend: ['Node.js', 'Express.js', 'PostgreSQL', 'JWT Auth'],
        Automation: ['n8n', 'Webhook Processing', 'API Integration', 'Workflow Engine'],
        Infrastructure: ['Docker', 'AWS', 'CI/CD Pipeline', 'Load Balancing'],
      },
    },
    '2': {
      id: 2,
      title: 'CRM Integration Platform',
      shortDescription: 'Custom CRM with automated lead scoring and workflows',
      fullDescription: `A sophisticated CRM platform designed to revolutionize how businesses manage their customer relationships. This system combines traditional CRM functionality with advanced automation and AI-powered insights.

Built from the ground up with scalability in mind, the platform integrates seamlessly with existing business tools while providing powerful automation capabilities that eliminate manual data entry and streamline sales processes.

The system has processed over 15,000 leads with a 34% conversion rate improvement, saving businesses over 500 hours of manual work through intelligent automation workflows.`,
      technologies: [
        'React',
        'Node.js',
        'MongoDB',
        'n8n',
        'HubSpot API',
        'Salesforce API',
        'WebSocket',
        'Redis',
      ],
      category: 'Business Solution',
      status: 'Active Development',
      completedDate: '2024-01-10',
      clientType: 'SMB',
      projectUrl: '#',
      githubUrl: '#',
      images: [
        '/project2-main.jpg',
        '/project2-dashboard.jpg',
        '/project2-leads.jpg',
        '/project2-analytics.jpg',
      ],
      features: [
        'Automated lead scoring and qualification system',
        'Multi-platform data synchronization',
        'Real-time collaboration tools',
        'Advanced pipeline management',
        'Automated follow-up sequences',
        'Custom reporting and analytics',
        'Integration with 20+ business tools',
        'Mobile-first responsive design',
      ],
      metrics: {
        'Leads Processed': '15,000+',
        'Conversion Rate Improvement': '34%',
        'Hours Saved': '500+',
        'Data Sync Accuracy': '99.8%',
        'User Satisfaction': '4.9/5',
        'Response Time': '<150ms',
      },
      testimonial: {
        text: 'The CRM platform Jacob built has completely transformed our sales process. The automation features alone have saved us countless hours while improving our conversion rates significantly.',
        author: 'Sarah Johnson',
        position: 'Sales Director, StartupXYZ',
      },
      techStack: {
        Frontend: ['React', 'TypeScript', 'Material-UI', 'Chart.js'],
        Backend: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose'],
        Automation: ['n8n', 'HubSpot API', 'Salesforce API', 'Zapier Integration'],
        Infrastructure: ['Docker', 'Azure', 'Redis', 'WebSocket'],
      },
    },
  };

  return projects[id as keyof typeof projects] || null;
};

const ProjectDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params?.id) {
      const projectData = getProjectData(params.id as string);
      setProject(projectData);
    }
  }, [params?.id]);

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <div className="mb-4 font-mono text-xl text-green-400">Project Not Found</div>
          <Link href="/" className="text-white underline hover:text-green-400">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 z-[-1] bg-black">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
                 linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
               `,
            backgroundSize: '50px 50px',
            animation: 'cyberpunk-grid 20s linear infinite',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-green-400/20 bg-black/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-green-400">
              <span className="font-mono text-sm font-bold text-black">←</span>
            </div>
            <span className="font-mono text-sm text-green-400">BACK TO PORTFOLIO</span>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 md:flex">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
              <span className="font-mono text-xs text-green-400">PROJECT DETAILS</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            {/* Project Header */}
            <div className="mb-8 rounded-lg border border-green-400/30 bg-black/60 p-8 backdrop-blur-sm">
              <div className="flex flex-col items-start gap-8 lg:flex-row">
                {/* Project Info */}
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-4">
                    <span
                      className={`rounded-full px-3 py-1 font-mono text-xs ${
                        project.status === 'Live'
                          ? 'border border-green-400/30 bg-green-400/20 text-green-400'
                          : 'border border-yellow-400/30 bg-yellow-400/20 text-yellow-400'
                      }`}
                    >
                      {project.status}
                    </span>
                    <span className="font-mono text-sm text-green-400">{project.category}</span>
                  </div>

                  <h1 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
                    {project.title}
                  </h1>

                  <p className="mb-6 text-lg leading-relaxed text-gray-300">
                    {project.shortDescription}
                  </p>

                  <div className="mb-6 flex flex-wrap gap-3">
                    {project.technologies.slice(0, 6).map((tech: string) => (
                      <span
                        key={tech}
                        className="rounded border border-white/10 bg-white/5 px-3 py-1 text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 6 && (
                      <span className="rounded border border-green-400/30 bg-green-400/10 px-3 py-1 text-sm text-green-400">
                        +{project.technologies.length - 6} more
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {project.projectUrl !== '#' && (
                      <a
                        href={project.projectUrl}
                        className="rounded bg-green-400 px-6 py-3 font-medium text-black transition-colors hover:bg-green-300"
                      >
                        View Live Project
                      </a>
                    )}
                    {project.githubUrl !== '#' && (
                      <a
                        href={project.githubUrl}
                        className="rounded border border-green-400/50 px-6 py-3 font-medium text-green-400 transition-colors hover:bg-green-400/10"
                      >
                        View Code
                      </a>
                    )}
                  </div>
                </div>

                {/* Project Image */}
                <div className="lg:w-96">
                  <div className="rounded-lg border border-green-400/30 bg-black/80 p-4">
                    <div className="relative aspect-video overflow-hidden rounded bg-gray-800">
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-green-400">
                        [PROJECT PREVIEW]
                      </div>
                    </div>

                    {/* Image Gallery Thumbnails */}
                    <div className="mt-4 flex gap-2">
                      {project.images.map((_, index: number) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-8 w-12 rounded border-2 bg-gray-700 ${
                            currentImageIndex === index ? 'border-green-400' : 'border-transparent'
                          }`}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="mb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="rounded-lg border border-green-400/30 bg-black/60 p-2 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              {['overview', 'features', 'tech-stack', 'metrics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded px-4 py-2 font-mono text-sm capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-green-400 text-black'
                      : 'text-green-400 hover:bg-green-400/10'
                  }`}
                >
                  {tab.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="rounded-lg border border-green-400/30 bg-black/60 p-8 backdrop-blur-sm">
                    <h3 className="mb-6 text-2xl font-bold text-green-400">Project Overview</h3>
                    <div className="prose prose-invert max-w-none">
                      {project.fullDescription
                        .split('\n\n')
                        .map((paragraph: string, index: number) => (
                          <p key={index} className="mb-4 leading-relaxed text-gray-300">
                            {paragraph}
                          </p>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Project Details */}
                  <div className="rounded-lg border border-green-400/30 bg-black/60 p-6 backdrop-blur-sm">
                    <h4 className="mb-4 text-lg font-semibold text-green-400">Project Details</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Completed:</span>
                        <span className="text-white">{project.completedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Client Type:</span>
                        <span className="text-white">{project.clientType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Category:</span>
                        <span className="text-white">{project.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400">{project.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="rounded-lg border border-green-400/30 bg-black/60 p-6 backdrop-blur-sm">
                    <h4 className="mb-4 text-lg font-semibold text-green-400">
                      Client Testimonial
                    </h4>
                    <blockquote className="mb-4 text-sm leading-relaxed text-gray-300">
                      "{project.testimonial.text}"
                    </blockquote>
                    <div className="text-sm">
                      <div className="font-medium text-white">{project.testimonial.author}</div>
                      <div className="text-gray-400">{project.testimonial.position}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="rounded-lg border border-green-400/30 bg-black/60 p-8 backdrop-blur-sm">
                <h3 className="mb-8 text-2xl font-bold text-green-400">Key Features</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {project.features.map((feature: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                    >
                      <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-400"></div>
                      <span className="text-gray-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tech-stack' && (
              <div className="rounded-lg border border-green-400/30 bg-black/60 p-8 backdrop-blur-sm">
                <h3 className="mb-8 text-2xl font-bold text-green-400">Technology Stack</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(project.techStack).map(([category, techs]) => (
                    <div
                      key={category}
                      className="rounded-lg border border-white/10 bg-white/5 p-6"
                    >
                      <h4 className="mb-4 text-lg font-semibold text-green-400">{category}</h4>
                      <div className="space-y-2">
                        {(techs as string[]).map((tech: string) => (
                          <div key={tech} className="flex items-center gap-2 text-sm text-gray-300">
                            <div className="h-1 w-1 rounded-full bg-green-400"></div>
                            {tech}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="rounded-lg border border-green-400/30 bg-black/60 p-8 backdrop-blur-sm">
                <h3 className="mb-8 text-2xl font-bold text-green-400">Project Metrics</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(project.metrics).map(([metric, value], index) => (
                    <motion.div
                      key={metric}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="rounded-lg border border-white/10 bg-white/5 p-6 text-center"
                    >
                      <div className="mb-2 text-3xl font-bold text-green-400">{value}</div>
                      <div className="text-sm tracking-wider text-gray-400 uppercase">{metric}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes cyberpunk-grid {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectDetailPage;
