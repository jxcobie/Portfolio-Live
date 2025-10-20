import { NextResponse } from 'next/server';
import { fetchFromCms, MissingCmsApiKeyError } from '@/lib/cms-client';

export async function GET() {
  try {
    const response = await fetchFromCms('/api/projects/featured', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch featured projects from CMS');
    }

    const data = await response.json();

    return NextResponse.json({
      projects: data.projects || [],
      total: data.total || 0,
    });
  } catch (error) {
    if (error instanceof MissingCmsApiKeyError) {
      console.error('CMS API key missing while fetching featured projects');
    } else {
      console.error('Error fetching featured projects:', error);
    }

    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json({
      projects: [],
      total: 0,
      error: 'Failed to fetch featured projects',
    });
  }
}
