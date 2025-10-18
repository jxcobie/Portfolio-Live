import { PortfolioData } from '@/lib/types';

/**
 * Mock portfolio database - In production, this would be replaced with actual database queries
 *
 * @description Contains all portfolio data including personal info, skills, projects, and testimonials
 * @version 1.0.0
 * @author Jacob Jaballah
 */
export const portfolioData: PortfolioData = {
  personal: {
    name: 'Jacob Jaballah',
    title: 'FULL-STACK DEVELOPER • N8N AUTOMATION EXPERT',
    tagline: 'TRANSFORMING IDEAS INTO DIGITAL MAGIC',
    about: `I'm a passionate full-stack developer and n8n automation specialist who loves turning complex problems into elegant digital solutions. With expertise spanning modern web technologies and workflow automation, I create applications that not only look great but work intelligently.

My journey in tech has been driven by curiosity and a desire to build meaningful experiences. Whether it's crafting responsive web applications or designing automated workflows that save businesses time and resources, I approach every project with creativity and precision.

When I'm not coding, you'll find me exploring new technologies, optimizing workflows, or working on personal projects that push the boundaries of what's possible with code and automation.`,
    email: 'hello@jxcobcreations.com',
    linkedin: 'https://linkedin.com/in/jacob-jaballah',
    github: 'https://github.com/jxcobie',
    location: 'Available Remotely',
    experience: '3+ Years',
    avatar: '/images/avatar.jpg',
    resume: '/documents/jacob-jaballah-resume.pdf',
  },

  skills: [
    {
      id: 1,
      category: 'Frontend Development',
      skills: [
        'React',
        'Next.js',
        'TypeScript',
        'JavaScript',
        'HTML5',
        'CSS3',
        'Tailwind CSS',
        'Framer Motion',
      ],
      icon: 'frontend',
      level: 'Advanced',
    },
    {
      id: 2,
      category: 'Backend Development',
      skills: [
        'Node.js',
        'Express.js',
        'Python',
        'PostgreSQL',
        'MongoDB',
        'REST APIs',
        'GraphQL',
        'Authentication',
      ],
      icon: 'backend',
      level: 'Advanced',
    },
    {
      id: 3,
      category: 'Automation & Integration',
      skills: [
        'n8n Workflows',
        'API Integration',
        'Webhook Automation',
        'Data Processing',
        'Third-party Integrations',
        'Workflow Optimization',
      ],
      icon: 'automation',
      level: 'Expert',
    },
    {
      id: 4,
      category: 'Tools & Technologies',
      skills: ['Git', 'Docker', 'VS Code', 'Figma', 'Postman', 'AWS', 'Vercel', 'Database Design'],
      icon: 'tools',
      level: 'Advanced',
    },
  ],

  projects: [
    {
      id: 1,
      title: 'E-Commerce Automation Suite',
      description:
        'Full-stack e-commerce platform with automated inventory management, order processing, and customer communication workflows using n8n.',
      tech: ['Next.js', 'PostgreSQL', 'n8n', 'Stripe API', 'Email Automation'],
      status: 'Featured Project',
      link: '#',
      image: '/images/projects/ecommerce-suite.jpg',
      featured: true,
      completedDate: '2024-01-15',
      clientType: 'Enterprise',
      githubUrl: 'https://github.com/jxcobie/ecommerce-suite',
      liveUrl: 'https://ecommerce-demo.jxcobcreations.com',
      category: 'E-Commerce',
      duration: '3 months',
      teamSize: 2,
      challenges: [
        'Real-time inventory synchronization',
        'Complex order workflow automation',
        'Multi-channel integration',
      ],
      outcomes: [
        '300% increase in order processing efficiency',
        '95% reduction in manual data entry',
        'Seamless customer experience across channels',
      ],
    },
    {
      id: 2,
      title: 'CRM Integration Platform',
      description:
        'Custom CRM solution with automated lead scoring, follow-up sequences, and multi-platform data synchronization.',
      tech: ['React', 'Node.js', 'n8n', 'HubSpot API', 'MongoDB'],
      status: 'Client Work',
      link: '#',
      image: '/images/projects/crm-platform.jpg',
      featured: true,
      completedDate: '2024-01-10',
      clientType: 'SMB',
      githubUrl: 'https://github.com/jxcobie/crm-integration',
      category: 'CRM',
      duration: '2 months',
      teamSize: 1,
      challenges: [
        'API rate limiting management',
        'Data consistency across platforms',
        'Real-time lead scoring algorithms',
      ],
      outcomes: [
        '250% improvement in lead conversion',
        'Automated 80% of manual follow-up tasks',
        'Unified customer data across all touchpoints',
      ],
    },
    {
      id: 3,
      title: 'Social Media Automation Dashboard',
      description:
        'Comprehensive dashboard for managing multiple social media accounts with automated posting, analytics, and engagement tracking.',
      tech: ['React', 'Express.js', 'n8n', 'Social Media APIs', 'Chart.js'],
      status: 'Portfolio Project',
      link: '#',
      image: '/images/projects/social-dashboard.jpg',
      featured: false,
      completedDate: '2023-12-20',
      clientType: 'Personal',
      githubUrl: 'https://github.com/jxcobie/social-automation',
      liveUrl: 'https://social-demo.jxcobcreations.com',
      category: 'Social Media',
      duration: '1 month',
      teamSize: 1,
      challenges: [
        'Multiple API integrations',
        'Content scheduling optimization',
        'Real-time analytics processing',
      ],
      outcomes: [
        'Manages 50+ social accounts simultaneously',
        '70% time reduction in social media management',
        'Comprehensive analytics dashboard',
      ],
    },
  ],

  testimonials: [
    {
      id: 1,
      name: 'John Smith',
      company: 'TechCorp Inc.',
      position: 'CTO',
      text: 'Jacob delivered an exceptional automation solution that transformed our workflow efficiency by 300%. His expertise in n8n and full-stack development is unmatched.',
      rating: 5,
      date: '2024-01-20',
      avatar: '/images/testimonials/john-smith.jpg',
      projectId: 1,
      verified: true,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      company: 'StartupXYZ',
      position: 'Founder',
      text: 'Working with Jacob was a game-changer for our business. He built a complete e-commerce platform with automation that handles everything seamlessly.',
      rating: 5,
      date: '2024-01-10',
      avatar: '/images/testimonials/sarah-johnson.jpg',
      projectId: 1,
      verified: true,
    },
    {
      id: 3,
      name: 'Michael Chen',
      company: 'Digital Solutions LLC',
      position: 'Project Manager',
      text: "Jacob's ability to understand complex requirements and deliver robust solutions is impressive. The CRM integration he built exceeded our expectations.",
      rating: 5,
      date: '2024-01-05',
      avatar: '/images/testimonials/michael-chen.jpg',
      projectId: 2,
      verified: true,
    },
  ],
};

/**
 * Get a deep copy of portfolio data to prevent mutations
 *
 * @returns {PortfolioData} Deep copy of portfolio data
 */
export function getPortfolioData(): PortfolioData {
  return JSON.parse(JSON.stringify(portfolioData));
}

/**
 * Get specific section of portfolio data
 *
 * @param section - The section to retrieve
 * @returns The requested section data
 */
export function getPortfolioSection<K extends keyof PortfolioData>(section: K): PortfolioData[K] {
  return JSON.parse(JSON.stringify(portfolioData[section]));
}

/**
 * Update portfolio data section
 *
 * @param section - The section to update
 * @param data - The new data for the section
 * @returns Updated portfolio data
 */
export function updatePortfolioSection<K extends keyof PortfolioData>(
  section: K,
  data: PortfolioData[K]
): PortfolioData {
  (portfolioData as any)[section] = JSON.parse(JSON.stringify(data));
  return getPortfolioData();
}

/**
 * Add new item to a portfolio array section
 *
 * @param section - The array section to add to
 * @param item - The item to add
 * @returns Updated portfolio data
 */
export function addPortfolioItem<K extends 'skills' | 'projects' | 'testimonials'>(
  section: K,
  item: PortfolioData[K] extends Array<infer T> ? Omit<T, 'id'> : never
): PortfolioData {
  const newId = Math.max(...(portfolioData[section] as any[]).map((i: any) => i.id || 0)) + 1;
  const newItem = { ...item, id: newId };
  (portfolioData[section] as any[]).push(newItem);
  return getPortfolioData();
}

/**
 * Remove item from portfolio array section
 *
 * @param section - The array section to remove from
 * @param id - The ID of the item to remove
 * @returns Updated portfolio data
 */
export function removePortfolioItem<K extends 'skills' | 'projects' | 'testimonials'>(
  section: K,
  id: number
): PortfolioData {
  (portfolioData[section] as any[]) = (portfolioData[section] as any[]).filter(
    (item: any) => item.id !== id
  );
  return getPortfolioData();
}
