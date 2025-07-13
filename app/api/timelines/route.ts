import { NextResponse } from 'next/server';
import { TimelineModel } from '@/lib/models/Timeline';

export async function GET() {
  try {
    const timelines = await TimelineModel.findAll();
    return NextResponse.json(timelines);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to fetch timelines:', errorMessage);
    return NextResponse.json({ message: 'Failed to fetch timelines', error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ message: 'Timeline name is required and must be a non-empty string' }, { status: 400 });
    }

    const newTimeline = await TimelineModel.create({ name, description });
    return NextResponse.json(newTimeline, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Failed to create timeline:', errorMessage);
    return NextResponse.json({ message: 'Failed to create timeline', error: errorMessage }, { status: 500 });
  }
} 