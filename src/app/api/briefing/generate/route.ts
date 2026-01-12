import { NextRequest, NextResponse } from 'next/server';
import { generateBriefing } from '@/lib/openrouter';
import { BRIEFING_SYSTEM_PROMPT, buildUserPrompt } from '@/lib/prompts';
import { hasGeneratedToday, getSettings, saveBriefing } from '@/lib/db/queries';
import { getTodayBrazil } from '@/lib/utils';
import { orchestrateBriefing } from '@/lib/agents/orchestrator';
import { quickPreFetch } from '@/lib/data-sources/jina';
import {
  validateBriefingData,
  applyCorrections,
  generateValidationReport,
} from '@/lib/data-sources/validators';

export const maxDuration = 120; // Allow up to 120 seconds for comprehensive briefing

// Feature flags for the agentic flow
const ENABLE_JINA_PREFETCH = true; // Pre-fetch critical data sources via Jina (FREE)
const ENABLE_VALIDATION = true; // Validate output for hallucinations
const ENABLE_AUTO_CORRECTION = true; // Auto-correct obvious errors like future dates

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

    // PHASE 1: Pre-fetch critical data sources (FREE via Jina)
    let preFetchedData: Record<string, string> | undefined;
    if (ENABLE_JINA_PREFETCH) {
      console.log('📡 Pre-fetching critical data sources via Jina...');
      try {
        preFetchedData = await quickPreFetch();
        const sourceCount = Object.keys(preFetchedData).length;
        console.log(`✅ Pre-fetched ${sourceCount} sources successfully`);
      } catch (error) {
        // Don't fail the request if pre-fetch fails - it's optional
        console.warn('⚠️ Jina pre-fetch failed, continuing without pre-fetched data:', error);
      }
    }

    // Orchestrate briefing - get prioritized categories and context
    const orchestration = orchestrateBriefing(new Date(), {
      costBasis: settings.costBasis,
      logisticsCost: settings.logisticsCost || 80,
    });

    // PHASE 2: Build enhanced prompt with pre-fetched data and orchestration context
    const baseUserPrompt = buildUserPrompt(
      settings.costBasis,
      settings.logisticsCost || 80,
      preFetchedData // Pass pre-fetched data to be included in prompt
    );
    const enhancedUserPrompt = `${baseUserPrompt}\n\n${orchestration.searchContext}`;

    console.log('🤖 Generating briefing with Gemini + Google Search grounding...');

    // Generate briefing with enhanced context
    const result = await generateBriefing(BRIEFING_SYSTEM_PROMPT, enhancedUserPrompt);

    // PHASE 3: Validate the generated briefing
    let finalContent = result.text;
    let validationReport: string | undefined;

    if (ENABLE_VALIDATION) {
      console.log('🔍 Validating briefing for hallucinations...');
      const validation = validateBriefingData(result.text);
      validationReport = generateValidationReport(validation);

      // Log validation results
      console.log(validationReport);

      if (!validation.valid && ENABLE_AUTO_CORRECTION) {
        console.log('🔧 Applying auto-corrections for detected errors...');
        finalContent = applyCorrections(result.text, validation.corrections);
        console.log(`✅ Applied ${Object.keys(validation.corrections).length} corrections`);
      }

      // Log warnings for manual review
      if (validation.warnings.length > 0) {
        console.warn(`⚠️ ${validation.warnings.length} warnings detected - review recommended`);
      }
    }

    // Get today's date in Brazil timezone
    const today = getTodayBrazil();

    // Save to database
    // AI SDK uses inputTokens/outputTokens
    const usage = result.usage as { inputTokens?: number; outputTokens?: number } | undefined;
    const savedBriefing = await saveBriefing({
      title: `Briefing Diário - ${today}`,
      content: finalContent,
      summary: finalContent.slice(0, 300),
      reportDate: new Date(today),
      modelId: result.modelId,
      inputTokens: usage?.inputTokens,
      outputTokens: usage?.outputTokens,
    });

    return NextResponse.json({
      success: true,
      briefing: savedBriefing,
      metadata: {
        preFetchedSources: preFetchedData ? Object.keys(preFetchedData) : [],
        validationApplied: ENABLE_VALIDATION,
        correctionsApplied: ENABLE_AUTO_CORRECTION,
      },
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
