export interface Event {
  id: string;
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