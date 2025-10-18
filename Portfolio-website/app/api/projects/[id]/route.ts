import { NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_URL || 'http://localhost:1337';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params in Next.js 15
    const { id } = await params;

    // First, try to fetch from the public endpoint
    const response = await fetch(`${CMS_URL}/api/projects/public/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      throw new Error(`Failed to fetch project from CMS: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      project: data.project,
    });
  } catch (error) {
    console.error('Error fetching project:', error);

    // Fallback: Try to fetch all projects and find the one we need
    try {
      const allProjectsResponse = await fetch(`${CMS_URL}/api/projects/public`, {
        cache: 'no-store',
      });

      if (allProjectsResponse.ok) {
        const allData = await allProjectsResponse.json();
        const project = allData.projects?.find((p: any) => p.id === parseInt(id));

        if (project) {
          // Fetch the full project details by making a direct database query
          // For now, return what we have
          return NextResponse.json({
            project: {
              ...project,
              detailedContent: `
                <h2>Project Overview</h2>
                <p>${project.description}</p>
                <h2>Technologies Used</h2>
                <p>${project.technologies?.map((t: any) => t.name).join(', ')}</p>
              `,
            },
          });
        }
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }

    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
