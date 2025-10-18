import { NextRequest, NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_URL || 'http://localhost:1337';

// Mock data fallback for development
const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'E-Commerce Automation Platform',
    slug: 'ecommerce-automation-platform',
    description:
      'Full-stack e-commerce solution with automated inventory management, order processing, and customer communication workflows.',
    coverImage: {
      url: '/images/projects/ecommerce-suite.jpg',
      alternativeText: 'E-Commerce Automation Platform Dashboard',
    },
    status: 'deployed',
    technologies: [
      { id: 1, name: 'Next.js' },
      { id: 2, name: 'TypeScript' },
      { id: 3, name: 'PostgreSQL' },
      { id: 4, name: 'n8n' },
      { id: 5, name: 'Stripe' },
    ],
    liveUrl: 'https://ecommerce-demo.jxcobcreations.com',
    repoUrl: 'https://github.com/jxcobie/ecommerce-suite',
    featured: true,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-20T00:00:00.000Z',
  },
  {
    id: 2,
    title: 'CRM Integration Dashboard',
    slug: 'crm-integration-dashboard',
    description:
      'Custom CRM solution with automated lead scoring, follow-up sequences, and multi-platform data synchronization.',
    coverImage: {
      url: '/images/projects/crm-platform.jpg',
      alternativeText: 'CRM Integration Dashboard',
    },
    status: 'active',
    technologies: [
      { id: 1, name: 'React' },
      { id: 2, name: 'Node.js' },
      { id: 3, name: 'MongoDB' },
      { id: 4, name: 'n8n' },
      { id: 5, name: 'HubSpot API' },
    ],
    liveUrl: 'https://crm-demo.jxcobcreations.com',
    repoUrl: 'https://github.com/jxcobie/crm-integration',
    featured: true,
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-18T00:00:00.000Z',
  },
  {
    id: 3,
    title: 'Social Media Automation Suite',
    slug: 'social-media-automation-suite',
    description:
      'Comprehensive dashboard for managing multiple social media accounts with automated posting and analytics.',
    coverImage: {
      url: '/images/projects/social-dashboard.jpg',
      alternativeText: 'Social Media Automation Dashboard',
    },
    status: 'deployed',
    technologies: [
      { id: 1, name: 'React' },
      { id: 2, name: 'Express.js' },
      { id: 3, name: 'n8n' },
      { id: 4, name: 'Chart.js' },
    ],
    liveUrl: 'https://social-demo.jxcobcreations.com',
    repoUrl: 'https://github.com/jxcobie/social-automation',
    featured: false,
    createdAt: '2023-12-20T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z',
  },
  {
    id: 4,
    title: 'AI Content Generator',
    slug: 'ai-content-generator',
    description:
      'AI-powered content creation platform with automated workflow integration for multiple content types.',
    status: 'in dev',
    technologies: [
      { id: 1, name: 'Next.js' },
      { id: 2, name: 'OpenAI API' },
      { id: 3, name: 'Prisma' },
      { id: 4, name: 'Tailwind CSS' },
    ],
    featured: false,
    createdAt: '2024-01-25T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Try CMS first
    try {
      const response = await fetch(`${CMS_URL}/api/projects/public?page=${page}&limit=${limit}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(
          {
            projects: data.projects || [],
            pagination: data.pagination || { page, limit, total: 0, totalPages: 0 },
          },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
          }
        );
      }
    } catch (cmsError) {
      // CMS not available, fall back to mock data
    }

    // Fallback to mock data
    const total = MOCK_PROJECTS.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProjects = MOCK_PROJECTS.slice(startIndex, startIndex + limit);

    return NextResponse.json(
      {
        projects: paginatedProjects,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        projects: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
        error: 'Failed to fetch projects',
      },
      { status: 500 }
    );
  }
}
