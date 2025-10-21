import { useQuery } from '@tanstack/react-query';

import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface MessagesResponse {
  data: Array<{
    id: number;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    is_read: boolean | null;
    created_at: string | null;
  }>;
}

async function fetchMessages(): Promise<MessagesResponse> {
  const response = await fetch('/api/v2/messages?page=1&pageSize=20', {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Failed to load messages (${response.status})`);
  }
  return response.json();
}

export default function MessagesRoute() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['messages', 'list'],
    queryFn: fetchMessages,
    staleTime: 1000 * 60 // 1 minute
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">Recent contact form submissions awaiting review.</p>
      </div>
      <Card className="bg-slate-900/80">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
          <CardDescription>
            {isLoading && 'Loading messages…'}
            {error instanceof Error && <span className="text-rose-200">{error.message}</span>}
            {data && data.data.length === 0 && !isLoading && !error && 'Inbox is clear.'}
          </CardDescription>
          {!isLoading && !error && data && data.data.length > 0 && (
            <div className="mt-4 divide-y divide-white/10">
              {data.data.map((message) => (
                <article key={message.id} className="flex flex-col gap-2 py-4">
                  <header className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{message.subject ?? 'Untitled message'}</h3>
                      <p className="text-xs text-muted-foreground">
                        From {message.name} · {message.email}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-wide ${
                        message.is_read ? 'bg-emerald-500/10 text-emerald-300' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {message.is_read ? 'Read' : 'Unread'}
                    </span>
                  </header>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{message.message}</p>
                </article>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
