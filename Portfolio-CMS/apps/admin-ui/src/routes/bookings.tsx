import { useQuery } from '@tanstack/react-query';

import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface BookingResponse {
  data: Array<{
    id: number;
    name: string;
    email: string;
    date: string;
    time: string;
    duration: number;
    status: string | null;
    meeting_type: string;
    notes: string | null;
  }>;
}

async function fetchBookings(): Promise<BookingResponse> {
  const response = await fetch('/api/v2/bookings?upcoming=true&page=1&pageSize=20', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Failed to load bookings (${response.status})`);
  }
  return response.json();
}

export default function BookingsRoute() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', 'upcoming'],
    queryFn: fetchBookings,
    refetchInterval: 1000 * 60 * 5
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Bookings</h2>
        <p className="text-muted-foreground">Upcoming confirmed meetings synced from the new API.</p>
      </div>
      <Card className="bg-slate-900/80">
        <CardHeader>
          <CardTitle>Upcoming schedule</CardTitle>
          <CardDescription>
            {isLoading && 'Loading bookings…'}
            {error instanceof Error && <span className="text-rose-200">{error.message}</span>}
            {data && data.data.length === 0 && !isLoading && !error && 'No upcoming bookings.'}
          </CardDescription>
          {!isLoading && !error && data && data.data.length > 0 && (
            <div className="mt-4 space-y-3">
              {data.data.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-white/5 bg-slate-900/60 px-4 py-3 transition hover:border-primary/40"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {booking.date} · {booking.time} ({booking.duration} min)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.name} · {booking.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
                      {booking.status ?? 'pending'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Meeting type: {booking.meeting_type}
                  </p>
                  {booking.notes ? (
                    <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {booking.notes}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
