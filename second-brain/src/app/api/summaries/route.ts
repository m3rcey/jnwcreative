import { NextResponse } from 'next/server';
import { getSummaries, createSummary } from '@/lib/db';
import { generateDailySummary, generateWeeklySummary } from '@/lib/summary';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'daily' | 'weekly' | 'monthly' | undefined;
    
    const summaries = getSummaries(period);
    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { period = 'daily', date = new Date().toISOString() } = await request.json();
    
    let summary;
    const targetDate = new Date(date);
    
    if (period === 'daily') {
      summary = generateDailySummary(targetDate);
    } else if (period === 'weekly') {
      summary = generateWeeklySummary(targetDate);
    } else {
      return NextResponse.json(
        { error: 'Invalid period. Use "daily" or "weekly"' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
