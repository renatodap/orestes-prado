import { NextRequest, NextResponse } from 'next/server';
import { hasGeneratedToday, getLatestBriefing, isConfigured } from '@/lib/db/queries';

export async function GET(req: NextRequest) {
  try {
    const [canGenerate, configured, latest] = await Promise.all([
      hasGeneratedToday().then(v => !v),
      isConfigured(),
      getLatestBriefing(),
    ]);

    return NextResponse.json({
      canGenerate,
      isConfigured: configured,
      latestBriefing: latest,
    });
  } catch (error) {
    console.error('Error checking status:', error);
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    );
  }
}
