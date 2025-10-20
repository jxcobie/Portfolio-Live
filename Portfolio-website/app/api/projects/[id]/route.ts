import { NextResponse } from 'next/server';
import createDOMPurify from 'isomorphic-dompurify';
import { fetchFromCms, MissingCmsApiKeyError } from '@/lib/cms-client';

const DOMPurify = createDOMPurify();

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const response = await fetchFromCms(`/api/projects/public/${id}`, {
      cache: 'no-store',
    });

    if (response.status === 404) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!response.ok) {
      throw new Error(`CMS responded with ${response.status}`);
    }

    const data = await response.json();

    if (!data.project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const technologies = Array.isArray(data.project.technologies) ? data.project.technologies : [];

    const detailedContent = data.project.detailedContent
      ? DOMPurify.sanitize(data.project.detailedContent)
      : null;

    return NextResponse.json({
      project: {
        ...data.project,
        technologies,
        detailedContent,
      },
    });
  } catch (error) {
    if (error instanceof MissingCmsApiKeyError) {
      console.error('CMS API key missing while fetching project');
    } else {
      console.error(`Error fetching project ${id}:`, error);
    }
    return NextResponse.json({ error: 'Failed to fetch project from CMS' }, { status: 502 });
  }
}
