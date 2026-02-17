import { NextResponse } from 'next/server';
import { runAllImports } from '@/lib/importers';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const { workspaceRoot } = await request.json();
    const root = workspaceRoot || join(process.cwd(), '..', '..');
    
    const results = await runAllImports(root);
    
    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error('Error running imports:', error);
    return NextResponse.json(
      { error: 'Failed to run imports' },
      { status: 500 }
    );
  }
}
