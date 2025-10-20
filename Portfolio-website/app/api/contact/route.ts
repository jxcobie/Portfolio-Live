import { NextResponse } from 'next/server';
import { contactFormWithHoneypotSchema, createValidationErrorResponse } from '@/lib/validations';
import { fetchJsonFromCms, MissingCmsApiKeyError } from '@/lib/cms-client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactFormWithHoneypotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(createValidationErrorResponse(parsed.error), {
        status: 400,
      });
    }

    const form = parsed.data;

    const response = await fetchJsonFromCms('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        subject: form.subject || 'Contact Form Submission',
        message: form.message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('CMS Error:', errorText);

      throw new Error(`Failed to send message to CMS: ${response.status}`);
    }

    const data = await response.json();

    // Track analytics (optional, don't block on this)
    fetchJsonFromCms('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({
        event_type: 'contact_form_submission',
        event_data: {
          name: form.name,
          email: form.email,
          subject: form.subject,
        },
        page_url: '/contact',
        referrer: request.headers.get('referer') || '',
      }),
    }).catch(() => {
      // Analytics tracking failed (non-blocking, silently ignore)
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for your message! I will get back to you soon.',
      messageId: data.messageId,
    });
  } catch (error) {
    if (error instanceof MissingCmsApiKeyError) {
      console.error('CMS API key missing for contact form submission');
      return NextResponse.json(
        {
          success: false,
          error: 'Service temporarily unavailable. Please try again later.',
        },
        { status: 503 }
      );
    }

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
