import { NextResponse } from 'next/server';

const CMS_URL = process.env.CMS_URL || 'http://localhost:1337';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('Received contact form submission:', body);

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, email, and message are required',
        },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please provide a valid email address',
        },
        { status: 400 }
      );
    }

    // Send to CMS
    console.log('Forwarding to CMS:', `${CMS_URL}/api/messages`);

    const response = await fetch(`${CMS_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: body.name.trim(),
        email: body.email.trim(),
        subject: body.subject?.trim() || 'Contact Form Submission',
        message: body.message.trim(),
      }),
    });

    console.log('CMS Response Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CMS Error:', errorText);

      throw new Error(`Failed to send message to CMS: ${response.status}`);
    }

    const data = await response.json();
    console.log('CMS Response:', data);

    // Track analytics (optional, don't block on this)
    fetch(`${CMS_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'contact_form_submission',
        event_data: {
          name: body.name,
          email: body.email,
          subject: body.subject,
        },
        page_url: '/contact',
        referrer: request.headers.get('referer') || '',
      }),
    }).catch((err) => console.log('Analytics tracking failed (non-blocking):', err));

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
      messageId: data.messageId,
    });
  } catch (error) {
    console.error('Error in contact API:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method for testing
export async function GET() {
  return NextResponse.json({
    message: 'Contact API is working. Use POST to submit a message.',
    requiredFields: ['name', 'email', 'message'],
    optionalFields: ['subject'],
  });
}
