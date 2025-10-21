import { useQuery } from '@tanstack/react-query';

import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ProjectResponse {
  data: Array<{
    id: number;
    title: string;
    slug: string;
    status: string | null;
    short_description: string | null;
    created_at: string | null;
  }>;
  meta: {
    total: number;
  };
}

async function fetchProjects(): Promise<ProjectResponse> {
  const response = await fetch('/api/v2/projects?page=1&pageSize=20', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Failed to load projects (${response.status})`);
  }
  return response.json();
}

export default function ProjectsRoute() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects', 'list'],
    queryFn: fetchProjects
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Overview of published and in-progress portfolio work.</p>
        </div>
      </div>
      <Card className="bg-slate-900/80">
        <CardHeader>
          <CardTitle>Project inventory</CardTitle>
          <CardDescription>
            {isLoading && 'Loading projects…'}
            {error instanceof Error && <span className="text-rose-200">{error.message}</span>}
            {data && !isLoading && !error && `${data.meta.total} total projects`}
          </CardDescription>
          {!isLoading && !error && data && (
            <div className="mt-4 space-y-2">
              {data.data.map((project) => (
                <div
                  key={project.id}
                  className="rounded-lg border border-white/5 bg-slate-900/60 px-4 py-3 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-xs text-muted-foreground">{project.slug}</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
                      {project.status ?? 'draft'}
                    </span>
                  </div>
                  {project.short_description ? (
                    <p className="mt-2 text-sm text-muted-foreground">{project.short_description}</p>
                  ) : null}
                </div>
              ))}
              {data.data.length === 0 && <p className="text-sm text-muted-foreground">No projects found.</p>}
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
