export type EntityId = string;

export interface AuditTimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface Project extends AuditTimestamps {
  id: EntityId;
  title: string;
  slug: string;
  summary: string;
  body: string;
  thumbnailUrl?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ContactMessage extends AuditTimestamps {
  id: EntityId;
  name: string;
  email: string;
  subject: string;
  body: string;
  readAt?: Date;
}

export interface Booking extends AuditTimestamps {
  id: EntityId;
  clientName: string;
  clientEmail: string;
  scheduledFor: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export interface AnalyticsEvent extends AuditTimestamps {
  id: EntityId;
  eventType: string;
  payload: Record<string, unknown>;
}
