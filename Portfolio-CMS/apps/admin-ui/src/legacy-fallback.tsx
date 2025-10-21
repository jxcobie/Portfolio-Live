import { useEffect, useState } from 'react';

interface LegacyInfo {
  redirectUrl: string;
}

export function LegacyFallback() {
  const [legacy, setLegacy] = useState<LegacyInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/legacy-admin')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load legacy admin redirect (${response.status})`);
        }
        return response.json() as Promise<LegacyInfo>;
      })
      .then(setLegacy)
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unknown error');
      });
  }, []);

  if (error) {
    return (
      <div className="mx-auto flex h-screen max-w-xl flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-3xl font-semibold">Legacy admin unavailable</h1>
        <p className="text-muted-foreground">{error}</p>
        <p className="text-muted-foreground">
          Please contact the engineering team if the issue persists.
        </p>
      </div>
    );
  }

  if (!legacy) {
    return (
      <div className="mx-auto flex h-screen max-w-xl flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl font-semibold">Loading admin experience…</h1>
        <p className="text-muted-foreground">Fetching legacy admin URL.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen max-w-xl flex-col items-center justify-center gap-6 text-center">
      <h1 className="text-4xl font-semibold">Redirect to legacy admin</h1>
      <p className="text-muted-foreground">
        The modern admin interface is not enabled yet. Use the existing admin panel while migration
        is in progress.
      </p>
      <a
        href={legacy.redirectUrl}
        className="rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground shadow"
      >
        Open legacy admin
      </a>
    </div>
  );
}
