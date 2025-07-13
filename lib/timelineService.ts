import { Timeline, TimelineFormData } from "./types";

const API_BASE_URL = "/api/timelines";

async function handleResponse<T>(
  response: Response
): Promise<{ data: T | null; error: string | null }> {
  if (response.ok) {
    if (response.status === 204) {
      // No Content
      return { data: null, error: null };
    }
    const data = await response.json();
    return { data, error: null };
  } else {
    const errorData = await response
      .json()
      .catch(() => ({ message: "An unknown error occurred" }));
    return {
      data: null,
      error: errorData.message || "Failed to perform operation",
    };
  }
}

class TimelineService {
  async getAllTimelines(): Promise<{
    data: Timeline[] | null;
    error: string | null;
  }> {
    try {
      const response = await fetch(API_BASE_URL);
      return await handleResponse<Timeline[]>(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown network error occurred";
      console.error("Error fetching all timelines:", errorMessage);
      return { data: null, error: errorMessage };
    }
  }

  async getTimelineById(
    id: string
  ): Promise<{ data: Timeline | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      return await handleResponse<Timeline>(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown network error occurred";
      console.error(`Error fetching timeline ${id}:`, errorMessage);
      return { data: null, error: errorMessage };
    }
  }

  async createTimeline(timelineData: {
    name: string;
    description?: string;
  }): Promise<{ data: Timeline | null; error: string | null }> {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timelineData),
      });

      return await handleResponse<Timeline>(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown network error occurred";
      console.error("Error creating timeline:", errorMessage);
      return { data: null, error: errorMessage };
    }
  }

  async updateTimeline(
    id: string,
    formData: Partial<TimelineFormData>
  ): Promise<{ data: Timeline | null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      return await handleResponse<Timeline>(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown network error occurred";
      console.error(`Error updating timeline ${id}:`, errorMessage);
      return { data: null, error: errorMessage };
    }
  }

  async deleteTimeline(
    id: string
  ): Promise<{ data: null; error: string | null }> {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      return await handleResponse<null>(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown network error occurred";
      console.error(`Error deleting timeline ${id}:`, errorMessage);
      return { data: null, error: errorMessage };
    }
  }

  async forkTimeline(
    timelineId: string
  ): Promise<{ data?: Timeline; error?: string }> {
    try {
      const response = await fetch(`/api/timelines/${timelineId}/fork`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: errorData.error || "Failed to fork timeline" };
      }

      const data: Timeline = await response.json();
      return { data };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      return { error: message };
    }
  }
}

export const timelineService = new TimelineService();
