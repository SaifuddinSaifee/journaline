import { NextRequest, NextResponse } from 'next/server';
import { EventModel } from '@/app/lib/models/Event';
import { EventFormData } from '@/app/lib/types';

// GET /api/events/[id] - Retrieve a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const event = await EventModel.findById(id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update a specific event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Extract only the fields that can be updated
    const updateData: Partial<EventFormData> = {};
    
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || !body.title.trim()) {
        return NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || !body.description.trim()) {
        return NextResponse.json(
          { error: 'Description must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.description = body.description.trim();
    }

    if (body.timelineIds !== undefined) {
      if (!Array.isArray(body.timelineIds) || !body.timelineIds.every((id: unknown) => typeof id === 'string' && id.trim().length > 0)) {
        return NextResponse.json(
          { error: 'timelineIds must be an array of non-empty strings' },
          { status: 400 }
        );
      }
      updateData.timelineIds = body.timelineIds;
    }

    if (body.date !== undefined) {
      if (typeof body.date !== 'string' || !body.date.trim()) {
        return NextResponse.json(
          { error: 'Date must be a non-empty string' },
          { status: 400 }
        );
      }
      // Validate date format (ISO string)
      const dateObj = new Date(body.date);
      if (isNaN(dateObj.getTime())) {
        return NextResponse.json(
          { error: 'Date must be a valid ISO date string' },
          { status: 400 }
        );
      }
      updateData.date = body.date;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const event = await EventModel.update(id, updateData);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete a specific event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const deleted = await EventModel.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
} 