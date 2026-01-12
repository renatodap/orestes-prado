import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, generateText } from 'ai';

// Initialize OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Model: Gemini 3 Pro with web search (1M context, Google Search grounding)
const MODEL_ID = 'google/gemini-3-pro-preview';

export interface GenerateBriefingOptions {
  systemPrompt: string;
  userPrompt: string;
  stream?: boolean;
}

// Generate briefing with streaming
export async function generateBriefingStream(
  systemPrompt: string,
  userPrompt: string
) {
  const result = await streamText({
    model: openrouter(MODEL_ID),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 1.0, // Google recommends 1.0 for optimal grounding
    providerOptions: {
      openrouter: {
        plugins: [
          {
            id: 'web',
            max_results: 10,
            engine: 'native', // Use Google's native search for Gemini
          },
        ],
      },
    },
  });

  return result;
}

// Generate briefing without streaming (for saving to DB)
export async function generateBriefing(
  systemPrompt: string,
  userPrompt: string
) {
  const result = await generateText({
    model: openrouter(MODEL_ID),
    system: systemPrompt,
    prompt: userPrompt,
    temperature: 1.0, // Google recommends 1.0 for optimal grounding
    providerOptions: {
      openrouter: {
        plugins: [
          {
            id: 'web',
            max_results: 10,
            engine: 'native', // Use Google's native search for Gemini
          },
        ],
      },
    },
  });

  return {
    text: result.text,
    usage: result.usage,
    modelId: MODEL_ID,
  };
}
