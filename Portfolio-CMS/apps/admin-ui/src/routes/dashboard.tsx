import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { StatsGrid } from '../ui/stats-grid';

export default function DashboardRoute() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Track portfolio performance, manage projects, and monitor bookings in one place.
        </p>
      </div>
      <StatsGrid />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Migration Status</CardTitle>
            <CardDescription>
              New admin interface is under active development. Legacy admin remains available while
              parity is achieved.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Connect the new API once the Prisma layer is finalized, then enable the SPA via
              feature flag.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
