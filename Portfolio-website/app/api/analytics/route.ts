import { NextResponse } from 'next/server';
import { fetchJsonFromCms, MissingCmsApiKeyError } from '@/lib/cms-client';

const sanitizeInput = (value: unknown, maxLength = 2000) => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
};

type AnalyticsRecord = Record<string, unknown>;

const readString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const validateAnalyticsPayload = (payload: AnalyticsRecord) => {
  const eventType = sanitizeInput(
    readString(payload['event']) || readString(payload['event_type']),
    100,
  );
  const pageUrl = sanitizeInput(
    readString(payload['page']) || readString(payload['page_url']),
  );
  const referrer = sanitizeInput(
    readString(payload['referrer']) || readString(payload['referrer_url']),
  );

  if (!eventType) {
    return {
      valid: false,
      error: 'Event type is required',
    } as const;
  }

  return {
    valid: true,
    data: {
      event_type: eventType,
      event_data:
        typeof payload['data'] === 'object' && payload['data'] !== null
          ? (payload['data'] as Record<string, unknown>)
          : {},
      page_url: pageUrl,
      referrer,
    },
  } as const;
};

export async function POST(request: Request) {
  try {
    const rawBody = (await request.json()) as unknown;
    const body: AnalyticsRecord =
      typeof rawBody === 'object' && rawBody !== null
        ? { ...(rawBody as AnalyticsRecord) }
        : {};

    if (!body['referrer']) {
      body['referrer'] = request.headers.get('referer') || '';
    }

    const validation = validateAnalyticsPayload(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    const response = await fetchJsonFromCms('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      throw new Error('Failed to track analytics');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof MissingCmsApiKeyError) {
      console.error('CMS API key missing for analytics forwarding');
      return NextResponse.json({ success: true });
    }

    console.error('Analytics error:', error);
    // Don't return error to client for analytics
    return NextResponse.json({ success: true });
  }
}
