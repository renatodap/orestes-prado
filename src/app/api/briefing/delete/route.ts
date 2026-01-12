import { NextRequest, NextResponse } from 'next/server';
import { deleteRecentBriefings } from '@/lib/db/queries';

// TEMPORARY: Delete recent briefings for regeneration
// Remove this endpoint after use
export async function POST(req: NextRequest) {
  try {
    const deleted = await deleteRecentBriefings(3); // Delete last 3 days
    return NextResponse.json({
      success: true,
      deleted,
      message: `Deleted ${deleted} briefing(s)`,
    });
  } catch (error) {
    console.error('Error deleting briefings:', error);
    return NextResponse.json(
      { error: 'Failed to delete briefings' },
      { status: 500 }
    );
  }
}
