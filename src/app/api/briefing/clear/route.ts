import { NextResponse } from 'next/server';
import { deleteAllBriefings } from '@/lib/db/queries';

export async function POST() {
  try {
    const count = await deleteAllBriefings();
    return NextResponse.json({ success: true, deleted: count });
  } catch (error) {
    console.error('Error clearing briefings:', error);
    return NextResponse.json(
      { error: 'Failed to clear briefings' },
      { status: 500 }
    );
  }
}
