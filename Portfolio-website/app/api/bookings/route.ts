import { NextRequest, NextResponse } from 'next/server';

import { fetchJsonFromCms, MissingCmsApiKeyError } from '@/lib/cms-client';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

interface ValidationSuccess<T> {
  valid: true;
  data: T;
}

interface ValidationFailure {
  valid: false;
  error: string;
  details?: Array<{ field: string; message: string }>;
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

type BookingPayload = {
  name: string;
  email: string;
  phone?: string | null;
  date: string;
  time: string;
  duration: number;
  meetingType?: string | null;
  notes?: string | null;
};

const sanitizeInput = (value: unknown, { multiline = false, maxLength = 2000 } = {}) => {
  if (typeof value !== 'string') {
    return '';
  }

  const withoutTags = value.replace(/<[^>]*>/g, '');
  const normalized = multiline
    ? withoutTags.replace(/\r?\n/g, '\n').replace(/[\t\v\f\r]/g, '')
    : withoutTags.replace(/\s+/g, ' ');

  const trimmed = normalized.trim();
  return maxLength ? trimmed.slice(0, maxLength) : trimmed;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
};

const readString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const validateBookingRequest = (payload: unknown): ValidationResult<BookingPayload> => {
  const errors: Array<{ field: string; message: string }> = [];
  const record = toRecord(payload);

  const name = sanitizeInput(record['name'], { maxLength: 100 });
  if (!name || name.length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  }

  const emailRaw = readString(record['email']).trim().toLowerCase();
  if (!emailRegex.test(emailRaw)) {
    errors.push({ field: 'email', message: 'A valid email address is required' });
  }

  const date = readString(record['date']).trim();
  if (!isoDateRegex.test(date)) {
    errors.push({ field: 'date', message: 'Date must be formatted as YYYY-MM-DD' });
  }

  const time = readString(record['time']).trim();
  if (!timeRegex.test(time)) {
    errors.push({ field: 'time', message: 'Time must be formatted as HH:MM' });
  }

  const durationValue = Number(record['duration'] ?? 0);
  if (!Number.isInteger(durationValue) || durationValue < 15 || durationValue > 240) {
    errors.push({ field: 'duration', message: 'Duration must be between 15 and 240 minutes' });
  }

  const meetingType = sanitizeInput(
    readString(record['meetingType']) || readString(record['meeting_type']),
    {
      maxLength: 100,
    },
  );
  const phone = sanitizeInput(record['phone'], { maxLength: 50 });
  const notes = sanitizeInput(record['notes'], { multiline: true, maxLength: 2000 });

  if (errors.length > 0) {
    return { valid: false, error: 'Validation failed', details: errors };
  }

  return {
    valid: true,
    data: {
      name,
      email: emailRaw,
      date,
      time,
      duration: durationValue,
      meetingType: meetingType || null,
      phone: phone || null,
      notes: notes || null,
    },
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateBookingRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error, details: validation.details },
        { status: 400 },
      );
    }

    const response = await fetchJsonFromCms('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({ error: 'Unknown error' }));
      return NextResponse.json(
        {
          success: false,
          error: errorPayload.error || 'Failed to create booking',
        },
        { status: response.status },
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof MissingCmsApiKeyError) {
      console.error('CMS API key missing while creating a booking');
      return NextResponse.json(
        { success: false, error: 'Service unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking. Please try again later.' },
      { status: 500 },
    );
  }
}
