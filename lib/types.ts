import { ObjectId } from 'mongodb';

// ================================================================
// Event Types
// ================================================================

export interface EventDocument {
  _id: ObjectId;

  title: string;
  description: string;
  date: Date;

  timelineIds: ObjectId[];

  tags?: string[];
  location?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  createdBy?: ObjectId;
  updatedBy?: ObjectId;
}

// Data received from the client when creating/updating an event
export interface EventFormData {
  title: string;
  description: string;
  date?: string; // ISO 8601 string – required on create, optional on update

  timelineIds: string[];

  tags?: string[];
  location?: string;
  metadata?: Record<string, unknown>;
}

// Data sent back to the client (strings for easy JSON serialisation)
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;

  timelineIds: string[];

  tags?: string[];
  location?: string;
  metadata?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  createdBy?: string;
  updatedBy?: string;
}

// Convenience alias to maintain backward-compatibility with existing UI code
export type Event = EventResponse;

// ================================================================
// Timeline Types
// ================================================================

export type SortField = 'date' | 'createdAt' | 'updatedAt';
export type SortOrder = 'asc' | 'desc';

export interface SortPreference {
  field: SortField;
  order: SortOrder;
}

export interface TimelineDocument {
  _id: ObjectId;

  name: string;
  description?: string;

  groupOrder: string[];
  sortPreference?: SortPreference;

  origin?: {
    timelineId: ObjectId;
    date: Date;
  }[];

  color?: string;
  isArchived?: boolean;
  publish: boolean;

  createdAt: Date;
  updatedAt: Date;

  createdBy?: ObjectId;
  updatedBy?: ObjectId;
}

export interface TimelineFormData {
  name?: string;
  description?: string;
  groupOrder?: string[];
  sortPreference?: SortPreference;
  color?: string;
  isArchived?: boolean;
  publish?: boolean;
}

export interface TimelineResponse {
  id: string;
  name: string;
  description?: string;

  groupOrder: string[];
  sortPreference?: SortPreference;

  origin?: {
    timelineId: string;
    date: string;
  }[];

  color?: string;
  isArchived?: boolean;
  publish?: boolean;

  createdAt: string;
  updatedAt: string;

  createdBy?: string;
  updatedBy?: string;
}

// Convenience alias used in the UI layer
export type Timeline = TimelineResponse; 