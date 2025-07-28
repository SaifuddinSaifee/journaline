import { NextResponse } from 'next/server';
import { getTimezonePreference, saveTimezonePreference } from '@/lib/timezoneService';

export async function GET() {
  try {
    const timezone = await getTimezonePreference();
    return NextResponse.json({ timezone });
  } catch (error) {
    console.error('Failed to get timezone:', error);
    return NextResponse.json(
      { error: 'Failed to get timezone preference' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { timezone } = await request.json();
    
    if (!timezone) {
      return NextResponse.json(
        { error: 'Timezone is required' },
        { status: 400 }
      );
    }

    await saveTimezonePreference(timezone);
    return NextResponse.json({ success: true, timezone });
  } catch (error) {
    console.error('Failed to save timezone:', error);
    return NextResponse.json(
      { error: 'Failed to save timezone preference' },
      { status: 500 }
    );
  }
} 