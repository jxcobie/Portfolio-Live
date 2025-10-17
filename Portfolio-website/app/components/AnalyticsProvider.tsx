'use client';

import { useAnalytics, useScrollTracking, useTimeTracking } from '../hooks/useAnalytics';

export default function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics tracking
  useAnalytics();
  useScrollTracking();
  useTimeTracking();

  return <>{children}</>;
}
