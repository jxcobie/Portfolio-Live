'use client';

import React, { useState, useCallback, memo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ContactFormData, ContactSubmissionResult } from '@/app/types';
import SectionHeader from '../shared/SectionHeader';

// Zod validation schema - matches ContactFormData type
const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  subject: z.string().max(200, 'Subject must be less than 200 characters').optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  honeypot: z.string().optional(),
});

// Form Field Component
interface FormFieldProps {
  label: string;
  name: keyof ContactFormData;
  type?: 'text' | 'email' | 'textarea';
  required?: boolean;
  register: any;
  error?: string;
  className?: string;
  rows?: number;
}

const FormField = memo<FormFieldProps>(
  ({ label, name, type = 'text', required = false, register, error, className = '', rows = 6 }) => {
    const fieldId = `contact-${name}`;

    return (
      <div className={`form-field ${className}`}>
        <label htmlFor={fieldId} className={required ? 'required' : ''}>
          [{label}] {required && '*'}
        </label>
        {type === 'textarea' ? (
          <textarea
            id={fieldId}
            rows={rows}
            {...register(name)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={error ? 'error' : ''}
          />
        ) : (
          <input
            id={fieldId}
            type={type}
            {...register(name)}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={error ? 'error' : ''}
          />
        )}
        {error && (
          <span id={`${fieldId}-error`} className="error-message" role="alert" aria-live="polite">
            {error}
          </span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

// Submit Status Component
interface SubmitStatusProps {
  status: ContactSubmissionResult | null;
}

const SubmitStatus = memo<SubmitStatusProps>(({ status }) => {
  if (!status) return null;

  return (
    <div
      className={`submit-status ${status.success ? 'success' : 'error'}`}
      role="alert"
      aria-live="polite"
    >
      {status.success ? '✅ ' : '❌ '}
      {status.message}
    </div>
  );
});

SubmitStatus.displayName = 'SubmitStatus';

// Contact Form Component
interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<ContactSubmissionResult>;
  isLoading: boolean;
}

const ContactForm = memo<ContactFormProps>(({ onSubmit, isLoading }) => {
  const [submitStatus, setSubmitStatus] = useState<ContactSubmissionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
  });

  const handleFormSubmit = useCallback(
    async (data: ContactFormData) => {
      try {
        setSubmitStatus(null);
        const result = await onSubmit(data);
        setSubmitStatus(result);

        if (result.success) {
          reset();
        }
      } catch (error) {
        setSubmitStatus({
          success: false,
          message: 'Network error. Please check your connection and try again.',
        });
      }
    },
    [onSubmit, reset]
  );

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="contact-form"
      noValidate
      aria-label="Contact form"
    >
      <div className="form-grid">
        <FormField
          label="NAME"
          name="name"
          required
          register={register}
          error={errors.name?.message}
        />
        <FormField
          label="EMAIL"
          name="email"
          type="email"
          required
          register={register}
          error={errors.email?.message}
        />
      </div>

      <FormField
        label="SUBJECT"
        name="subject"
        register={register}
        error={errors.subject?.message}
      />

      <FormField
        label="MESSAGE"
        name="message"
        type="textarea"
        required
        register={register}
        error={errors.message?.message}
        rows={6}
      />

      <SubmitStatus status={submitStatus} />

      <button
        type="submit"
        className="submit-btn"
        disabled={isLoading}
        aria-describedby="submit-button-description"
      >
        <span>{isLoading ? 'TRANSMITTING...' : 'TRANSMIT MESSAGE'}</span>
      </button>

      <div id="submit-button-description" className="sr-only">
        {isLoading ? 'Please wait while your message is being sent' : 'Click to send your message'}
      </div>
    </form>
  );
});

ContactForm.displayName = 'ContactForm';

// Main Contact Section Component
const ContactSection = memo(() => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (data: ContactFormData): Promise<ContactSubmissionResult> => {
      setIsSubmitting(true);

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          return {
            success: true,
            message: result.message || 'Message sent successfully!',
            messageId: result.messageId,
          };
        } else {
          return {
            success: false,
            message: result.error || 'Failed to send message. Please try again.',
          };
        }
      } catch (error) {
        console.error('Submit error:', error);
        return {
          success: false,
          message: 'Network error. Please check your connection and try again.',
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  return (
    <section
      id="contact"
      className="content-section"
      role="region"
      aria-labelledby="contact-heading"
    >
      <SectionHeader tag="COMMUNICATION_CHANNEL" title="GET IN TOUCH" />

      <div className="contact-container">
        <ContactForm onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;
