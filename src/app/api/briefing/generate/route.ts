import { NextRequest, NextResponse } from 'next/server';
import { generateBriefing } from '@/lib/openrouter';
import { BRIEFING_SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts';
import { hasGeneratedToday, getSettings, saveBriefing } from '@/lib/db/queries';
import { getTodayBrazil } from '@/lib/utils';

export const maxDuration = 60; // Allow up to 60 seconds

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const alreadyGenerated = await hasGeneratedToday();
    if (alreadyGenerated) {
      return NextResponse.json(
        { error: 'Você já gerou o briefing de hoje. Volte amanhã!' },
        { status: 429 }
      );
    }

    // Check if configured
    const settings = await getSettings();
    if (!settings?.isConfigured || !settings.costBasis) {
      return NextResponse.json(
        { error: 'Configure o custo base da fazenda primeiro.' },
        { status: 400 }
      );
    }

    // Generate briefing
    const userPrompt = buildUserPrompt(settings.costBasis, settings.logisticsCost || 80);
    const result = await generateBriefing(BRIEFING_SYSTEM_PROMPT, userPrompt);

    // Get today's date in Brazil timezone
    const today = getTodayBrazil();

    // Save to database
    // AI SDK uses inputTokens/outputTokens
    const usage = result.usage as { inputTokens?: number; outputTokens?: number } | undefined;
    const savedBriefing = await saveBriefing({
      title: `Briefing Diário - ${today}`,
      content: result.text,
      summary: result.text.slice(0, 300),
      reportDate: new Date(today),
      modelId: result.modelId,
      inputTokens: usage?.inputTokens,
      outputTokens: usage?.outputTokens,
    });

    return NextResponse.json({
      success: true,
      briefing: savedBriefing,
    });
  } catch (error) {
    console.error('Error generating briefing:', error);

    // Return a user-friendly error
    const message = error instanceof Error ? error.message : 'Erro ao gerar briefing';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
