import { NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_URL || 'http://localhost:1337';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward analytics to CMS
    const response = await fetch(`${CMS_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: body.event || 'page_view',
        event_data: body.data || {},
        page_url: body.page || '',
        referrer: body.referrer || request.headers.get('referer') || '',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to track analytics');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // Don't return error to client for analytics
    return NextResponse.json({ success: true });
  }
}
