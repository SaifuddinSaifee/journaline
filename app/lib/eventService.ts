import { EventFormData, EventResponse } from './types';

interface APIResponse<T> {
  data?: T;
  error?: string;
}

class EventService {
  private baseUrl = '/api/events';

  async getAllEvents(): Promise<APIResponse<EventResponse[]>> {
    try {
      const response = await fetch(this.baseUrl);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to fetch events' };
      }

      return { data: data.events };
    } catch (error) {
      console.error('Error fetching events:', error);
      return { error: 'Network error occurred' };
    }
  }

  async getEventsByTimelineId(timelineId: string): Promise<APIResponse<EventResponse[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?timelineId=${timelineId}`);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to fetch timeline events' };
      }

      return { data: data.events };
    } catch (error) {
      console.error('Error fetching timeline events:', error);
      return { error: 'Network error occurred' };
    }
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<APIResponse<EventResponse[]>> {
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      
      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to fetch events by date range' };
      }

      return { data: data.events };
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      return { error: 'Network error occurred' };
    }
  }

  async getEventById(id: string): Promise<APIResponse<EventResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to fetch event' };
      }

      return { data: data.event };
    } catch (error) {
      console.error('Error fetching event:', error);
      return { error: 'Network error occurred' };
    }
  }

  async createEvent(eventData: EventFormData & { date: string }): Promise<APIResponse<EventResponse>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to create event' };
      }

      return { data: data.event };
    } catch (error) {
      console.error('Error creating event:', error);
      return { error: 'Network error occurred' };
    }
  }

  async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<APIResponse<EventResponse>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Failed to update event' };
      }

      return { data: data.event };
    } catch (error) {
      console.error('Error updating event:', error);
      return { error: 'Network error occurred' };
    }
  }

  async deleteEvent(id: string): Promise<APIResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || 'Failed to delete event' };
      }

      return { data: undefined };
    } catch (error) {
      console.error('Error deleting event:', error);
      return { error: 'Network error occurred' };
    }
  }

  // Migration utility: Get events from localStorage
  getEventsFromLocalStorage(): EventResponse[] {
    try {
      const savedEvents = localStorage.getItem('journaline-events');
      if (savedEvents) {
        return JSON.parse(savedEvents);
      }
      return [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  // Migration utility: Clear localStorage
  clearLocalStorage(): void {
    try {
      localStorage.removeItem('journaline-events');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Migration utility: Migrate localStorage events to database
  async migrateFromLocalStorage(): Promise<APIResponse<{ migrated: number; failed: number }>> {
    try {
      const localEvents = this.getEventsFromLocalStorage();
      
      if (localEvents.length === 0) {
        return { data: { migrated: 0, failed: 0 } };
      }

      let migrated = 0;
      let failed = 0;

      for (const event of localEvents) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...eventData } = event; // Remove id for creation
        const result = await this.createEvent({
          ...eventData,
          date: event.date,
        });

        if (result.error) {
          failed++;
          console.error('Failed to migrate event:', event.title, result.error);
        } else {
          migrated++;
        }
      }

      // Clear localStorage after successful migration
      if (migrated > 0) {
        this.clearLocalStorage();
      }

      return { data: { migrated, failed } };
    } catch (error) {
      console.error('Error migrating from localStorage:', error);
      return { error: 'Migration failed' };
    }
  }
}

export const eventService = new EventService(); 