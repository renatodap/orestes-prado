import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText, generateText } from 'ai';

// Initialize OpenRouter client
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Model: GPT-5.2 with native web search (400K context, OpenAI native search)
const MODEL_ID = 'openai/gpt-5.2';

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
    temperature: 0.7,
    maxOutputTokens: 16384, // Limit output to ~12K words max, reduces credit reservation
    providerOptions: {
      openrouter: {
        plugins: [
          {
            id: 'web',
            max_results: 10,
            engine: 'native', // OpenAI supports native web search
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
    temperature: 0.7,
    maxOutputTokens: 16384, // Limit output to ~12K words max, reduces credit reservation
    providerOptions: {
      openrouter: {
        plugins: [
          {
            id: 'web',
            max_results: 10,
            engine: 'native', // OpenAI supports native web search
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
