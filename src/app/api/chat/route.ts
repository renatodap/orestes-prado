import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export const runtime = 'edge';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Use a fast model for chat - Gemini 2.0 Flash for speed
const CHAT_MODEL = 'google/gemini-2.0-flash-001';

interface SimpleMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * System prompt for the AI assistant that helps Dr. Orestes
 * understand and explore his briefing content
 */
function buildChatSystemPrompt(briefingContent: string, sectionContext?: string): string {
  const contextSection = sectionContext
    ? `\n\nCONTEXTO DA SEÇÃO SELECIONADA:\nO usuário está perguntando especificamente sobre esta seção do briefing:\n\n${sectionContext}\n\n`
    : '';

  return `Você é um assistente de inteligência de mercado para o Dr. Orestes Prado, um executivo sênior brasileiro de 80 anos com vasta experiência no mercado financeiro.

PERFIL DO DR. ORESTES:
- Senior Advisor em Reestruturação de Dívidas na Virtus BR
- Ex-Diretor Executivo do Citigroup Brasil
- Ex-Diretor do ABN Amro Brasil
- Proprietário de fazenda de café em Guaxupé, MG
- Torcedor do São Paulo FC
- Interesse em tênis, Fórmula 1 e Seleção Brasileira

SEU PAPEL:
Você ajuda o Dr. Orestes a entender melhor o briefing diário, responde perguntas sobre os temas abordados, e oferece análises adicionais quando solicitado.

BRIEFING DE HOJE:
${briefingContent}
${contextSection}
DIRETRIZES DE COMUNICAÇÃO:

1. TOM E LINGUAGEM:
   - Use linguagem formal e respeitosa
   - Trate-o como "Dr. Orestes" ou "o senhor"
   - Seja conciso mas completo
   - Evite gírias ou linguagem informal

2. FORMATAÇÃO:
   - Use formato brasileiro para números: R$ 1.234,56
   - Porcentagens: 12,5%
   - Datas: 11 de janeiro de 2026

3. CONHECIMENTO:
   - Base suas respostas no conteúdo do briefing
   - Quando relevante, conecte informações ao contexto pessoal dele
   - Se não souber algo, admita e sugira onde ele pode encontrar mais informações

4. ESTILO DE RESPOSTA:
   - Respostas curtas e diretas (2-4 parágrafos máximo)
   - Use bullet points quando apropriado
   - Destaque números e dados importantes
   - Seja prático e objetivo

5. CONTEXTO PESSOAL:
   - Relacione temas de café à fazenda dele em Guaxupé
   - Conecte notícias de bancos à experiência dele no Citigroup/ABN
   - Mencione impactos para o São Paulo FC quando relevante

Responda sempre em português do Brasil.`;
}

export async function POST(request: Request) {
  try {
    const { messages, briefingContent, sectionContext } = await request.json() as {
      messages: SimpleMessage[];
      briefingContent: string;
      sectionContext?: string;
    };

    if (!briefingContent) {
      return new Response('Briefing content is required', { status: 400 });
    }

    const systemPrompt = buildChatSystemPrompt(briefingContent, sectionContext);

    // Convert simple messages to model format
    const modelMessages = messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const result = streamText({
      model: openrouter(CHAT_MODEL),
      system: systemPrompt,
      messages: modelMessages,
      maxOutputTokens: 1000,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
