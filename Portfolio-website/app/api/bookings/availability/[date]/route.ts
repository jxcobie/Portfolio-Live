import { NextRequest, NextResponse } from 'next/server';

import { fetchFromCms, MissingCmsApiKeyError } from '@/lib/cms-client';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const parseDuration = (duration: string | null) => {
  const value = Number(duration ?? 30);
  if (!Number.isInteger(value)) {
    return null;
  }

  if (value < 15 || value > 240) {
    return null;
  }

  return value;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } },
) {
  try {
    const date = params.date.trim();
    if (!isoDateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Date must be formatted as YYYY-MM-DD' },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const normalizedDuration = parseDuration(url.searchParams.get('duration'));

    if (normalizedDuration === null) {
      return NextResponse.json(
        { error: 'Duration must be an integer between 15 and 240 minutes' },
        { status: 400 },
      );
    }

    const response = await fetchFromCms(
      `/api/bookings/availability/${encodeURIComponent(date)}?duration=${normalizedDuration}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      const payload = await response.json().catch(() => ({ error: 'Failed to fetch availability' }));
      return NextResponse.json(
        { error: payload.error || 'Failed to fetch availability from CMS' },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    if (error instanceof MissingCmsApiKeyError) {
      console.error('CMS API key missing while fetching booking availability');
      return NextResponse.json(
        { error: 'Service unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    console.error('Error fetching booking availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch booking availability' },
      { status: 500 },
    );
  }
}
