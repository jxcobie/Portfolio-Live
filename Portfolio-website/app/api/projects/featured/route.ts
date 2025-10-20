import { NextResponse } from 'next/server';
import { buildCmsUrl } from '@/lib/env';

export async function GET() {
  try {
    const response = await fetch(buildCmsUrl('/api/projects/featured'), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
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
    console.error('Error fetching featured projects:', error);

    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json({
      projects: [],
      total: 0,
      error: 'Failed to fetch featured projects',
    });
  }
}
