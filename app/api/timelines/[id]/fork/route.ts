import { NextResponse } from 'next/server';
import { TimelineModel } from '@/lib/models/Timeline';
import type { NextRequest } from 'next/server';

// -----------------------------------------------------------------------------
// POST /api/timelines/[id]/fork
// -----------------------------------------------------------------------------
// Creates a complete copy ("fork") of an existing timeline including its events
// and returns the newly-created timeline as JSON.
// -----------------------------------------------------------------------------

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Guard: ensure a timeline id was provided
  if (!id) {
    return NextResponse.json(
      { error: 'Timeline ID is required' },
      { status: 400 }
    );
  }

  try {
    const forkedTimeline = await TimelineModel.fork(id);

    if (!forkedTimeline) {
      return NextResponse.json(
        { error: 'Timeline not found or failed to fork' },
        { status: 404 }
      );
    }

    return NextResponse.json(forkedTimeline, { status: 201 });
  } catch (error) {
    console.error('Error forking timeline:', error);
    const message =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return NextResponse.json(
      { error: `Failed to fork timeline: ${message}` },
      { status: 500 }
    );
  }
} 