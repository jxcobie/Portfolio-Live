import { NextRequest, NextResponse } from 'next/server';
import { buildCmsUrl } from '@/lib/env';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const response = await fetch(buildCmsUrl(`/api/projects/public?page=${page}&limit=${limit}`), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CMS responded with ${response.status}`);
    }

    const data = await response.json();
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const total = data.total ?? projects.length;
    const totalPages = data.pagination?.totalPages ?? Math.max(Math.ceil(total / limit), 1);

    return NextResponse.json(
      {
        projects,
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
        error: 'Failed to fetch projects from CMS',
      },
      { status: 502 }
    );
  }
}
