import { NextRequest, NextResponse } from 'next/server';
import { TimelineModel } from '@/app/lib/models/Timeline';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const timeline = await TimelineModel.findById(id);

    if (!timeline) {
      return NextResponse.json({ message: 'Timeline not found' }, { status: 404 });
    }

    return NextResponse.json(timeline);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(`Failed to fetch timeline:`, errorMessage);
    return NextResponse.json({ message: `Failed to fetch timeline`, error: errorMessage }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedTimeline = await TimelineModel.update(id, body);

    if (!updatedTimeline) {
      return NextResponse.json({ message: 'Timeline not found or failed to update' }, { status: 404 });
    }

    return NextResponse.json(updatedTimeline);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to update timeline:', errorMessage);
    return NextResponse.json({ message: 'Failed to update timeline', error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Per the plan, we are only deleting the timeline object itself.
    // A more robust implementation would also remove the timeline's ID from any event that references it.
    
    const success = await TimelineModel.delete(id);

    if (!success) {
      return NextResponse.json({ message: 'Timeline not found or failed to delete' }, { status: 404 });
    }

    return new Response(null, { status: 204 }); // No Content
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to delete timeline:', errorMessage);
    return NextResponse.json({ message: 'Failed to delete timeline', error: errorMessage }, { status: 500 });
  }
} 