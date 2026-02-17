import { NextResponse } from 'next/server';
import { getAllTags, getSources, getStats } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'tags') {
      const tags = getAllTags();
      return NextResponse.json({ tags });
    }

    if (type === 'sources') {
      const sources = getSources();
      return NextResponse.json({ sources });
    }

    if (type === 'stats') {
      const stats = getStats();
      return NextResponse.json(stats);
    }

    // Return all metadata
    const [tags, sources, stats] = await Promise.all([
      getAllTags(),
      getSources(),
      getStats(),
    ]);

    return NextResponse.json({
      tags,
      sources,
      stats,
    });
  } catch (error) {
    console.error('Error in metadata API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
