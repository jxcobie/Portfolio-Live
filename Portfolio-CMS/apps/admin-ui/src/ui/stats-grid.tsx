import { useQuery } from '@tanstack/react-query';

import { Card, CardDescription, CardHeader, CardTitle } from './card';

interface StatsResponse {
  totalProjects: number;
  pendingBookings: number;
  unreadMessages: number;
}

async function fetchStats(): Promise<StatsResponse> {
  const response = await fetch('/api/v2/stats');
  if (!response.ok) {
    throw new Error('Failed to load dashboard stats');
  }
  return response.json() as Promise<StatsResponse>;
}

export function StatsGrid() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchStats,
    retry: 1,
    enabled: (import.meta.env.VITE_ENABLE_NEW_ADMIN ?? 'false') === 'true'
  });

  if (!((import.meta.env.VITE_ENABLE_NEW_ADMIN ?? 'false') === 'true')) {
    return (
      <Card className="bg-slate-900/80">
        <CardHeader>
          <CardTitle>Dashboard coming soon</CardTitle>
          <CardDescription>
            Enable the new admin UI feature flag once the API migration is complete to see live
            metrics.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-xl bg-slate-800/60" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-rose-950/40 text-rose-100">
        <CardHeader>
          <CardTitle>Unable to load stats</CardTitle>
          <CardDescription>{error instanceof Error ? error.message : 'Unknown error'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-slate-900/80">
        <CardHeader>
          <CardTitle>Total Projects</CardTitle>
          <CardDescription>{data.totalProjects}</CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-slate-900/80">
        <CardHeader>
          <CardTitle>Pending Bookings</CardTitle>
          <CardDescription>{data.pendingBookings}</CardDescription>
        </CardHeader>
      </Card>
      <Card className="bg-slate-900/80">
        <CardHeader>
          <CardTitle>Unread Messages</CardTitle>
          <CardDescription>{data.unreadMessages}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
