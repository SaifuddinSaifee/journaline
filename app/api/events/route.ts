import { NextRequest, NextResponse } from 'next/server';
import { EventModel } from '@/lib/models/Event';
import { EventFormData } from '@/lib/types';

// GET /api/events - Retrieve events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timelineId = searchParams.get('timelineId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let events;

    if (timelineId) {
      // Get events for a specific timeline
      events = await EventModel.findEventsByTimelineId(timelineId);
    } else if (startDate && endDate) {
      // Get events within date range
      events = await EventModel.findByDateRange(startDate, endDate);
    } else {
      // Get all events
      events = await EventModel.findAll();
    }

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch events', details: errorMessage },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, timelineIds, date, notes } = body;

    // Validate required fields
    if (!title || !description || !date) {
      return NextResponse.json(
        { error: 'Title, description, and date are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    const eventData: EventFormData & { date: string } = {
      title: title.trim(),
      description: description.trim(),
      timelineIds: timelineIds || [], // Default to an empty array if not provided
      date: parsedDate.toISOString(), // Store as ISO string to maintain consistency
      notes: notes?.trim() || "", // Add notes with default empty string
    };

    const event = await EventModel.create(eventData);
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create event', details: errorMessage },
      { status: 500 }
    );
  }
} 