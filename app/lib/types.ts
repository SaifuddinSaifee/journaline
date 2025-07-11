import { ObjectId } from 'mongodb';

export interface Event {
  _id?: ObjectId; // MongoDB ObjectId (for new events)
  id: string; // UUID (for existing events) or string representation of ObjectId
  title: string;
  description: string;
  date: string; // ISO date string
  addToTimeline: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  addToTimeline: boolean;
}

// MongoDB document interface (what gets stored in the database)
export interface EventDocument {
  _id: ObjectId;
  title: string;
  description: string;
  date: string;
  addToTimeline: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response interface (what gets returned from API)
export interface EventResponse {
  id: string;
  title: string;
  description: string;
  date: string;
  addToTimeline: boolean;
  createdAt: string;
  updatedAt: string;
} 