import { ObjectId } from 'mongodb';

export interface Event {
  _id?: ObjectId; // MongoDB ObjectId (for new events)
  id: string; // UUID (for existing events) or string representation of ObjectId
  title: string;
  description: string;
  date: string; // ISO date string
  timelineIds: string[]; // Replaces addToTimeline
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date?: string; // Optional for updates, required for creation
  timelineIds: string[]; // Replaces addToTimeline
}

// MongoDB document interface (what gets stored in the database)
export interface EventDocument {
  _id: ObjectId;
  title: string;
  description: string;
  date: string;
  timelineIds: ObjectId[]; // Replaces addToTimeline
  createdAt: string;
  updatedAt: string;
}

// API response interface (what gets returned from API)
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  timelineIds: string[]; // Replaces addToTimeline
  createdAt: string;
  updatedAt: string;
}

// =================================================================
// Timeline Types
// =================================================================

export interface Timeline {
  id: string;
  name: string;
  description?: string;
  groupPositions: Record<string, number>;
  groupOrder: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineFormData {
  name: string;
  description?: string;
  groupPositions?: Record<string, number>;
  groupOrder?: string[];
}

export interface TimelineDocument {
  _id: ObjectId;
  name: string;
  description?: string;
  groupPositions: Record<string, number>;
  groupOrder: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TimelineResponse {
  id: string;
  name: string;
  description?: string;
  groupPositions: Record<string, number>;
  groupOrder: string[];
  createdAt: string;
  updatedAt: string;
} 