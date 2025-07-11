import { NextRequest, NextResponse } from 'next/server';
import { EventModel } from '@/app/lib/models/Event';
import { EventFormData } from '@/app/lib/types';

// GET /api/events - Retrieve all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeline = searchParams.get('timeline');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let events;

    if (startDate && endDate) {
      // Get events within date range
      events = await EventModel.findByDateRange(startDate, endDate);
    } else if (timeline === 'true') {
      // Get only timeline events
      events = await EventModel.findTimelineEvents();
    } else {
      // Get all events
      events = await EventModel.findAll();
    }

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, addToTimeline, date } = body;

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
      addToTimeline: Boolean(addToTimeline),
      date: parsedDate.toISOString(),
    };

    const event = await EventModel.create(eventData);
    
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
} 