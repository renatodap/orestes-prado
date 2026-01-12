/**
 * Multi-Agent Orchestrator for Briefing Generation
 *
 * Implements the Plan → Parallelize → Synthesize pattern for
 * guaranteed live data fetching across all 14 briefing categories.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    ORCHESTRATOR                              │
 * │  (Plans queries, coordinates categories, synthesizes)       │
 * └─────────────────────────┬───────────────────────────────────┘
 *                           │
 *           ┌───────────────┼───────────────┐
 *           ▼               ▼               ▼
 *   [COFFEE]        [MARKETS]       [SPORTS]
 *   [POLITICS]      [LIFESTYLE]     [BRAZIL]
 *           │               │               │
 *           └───────────────┴───────────────┘
 *                           │
 *                           ▼
 *               ┌───────────────────────┐
 *               │   SYNTHESIS           │
 *               │  - Combines all data  │
 *               │  - Personalizes tone  │
 *               │  - Formats output     │
 *               └───────────────────────┘
 */

import {
  BRIEFING_CATEGORIES,
  getTodayContext,
  getCategoriesByPriority,
  type TodayContext,
  type BriefingCategory,
  type Priority,
} from './categories';

export interface FarmData {
  costBasis: number;
  logisticsCost: number;
}

export interface OrchestrationResult {
  searchContext: string;
  prioritizedCategories: BriefingCategory[];
  todayContext: TodayContext;
  dayHints: string[];
}

/**
 * Get day-specific hints for briefing personalization
 */
function getDayHints(context: TodayContext): string[] {
  const hints: string[] = [];

  if (context.isMonday) {
    hints.push('É segunda-feira - inclua resumo dos resultados esportivos do fim de semana');
    hints.push('São Paulo FC provavelmente jogou no fim de semana - destaque o resultado');
  }

  if (context.isFriday) {
    hints.push('É sexta-feira - mencione eventos culturais do fim de semana em São Paulo');
    hints.push('Sugira leituras ou exposições para o fim de semana');
  }

  if (context.isWeekend) {
    hints.push('É fim de semana - foco em análises de longo prazo e reflexões');
    hints.push('Menos foco em dados de mercado (bolsas fechadas)');
  }

  if (context.dayOfWeek === 0) {
    // Sunday
    hints.push('Domingo - o Tricolor pode estar jogando hoje');
  }

  if (context.isCopomDay) {
    hints.push('IMPORTANTE: Hoje é dia de decisão do COPOM - destaque expectativas');
  }

  if (context.isIPCADay) {
    hints.push('IMPORTANTE: Hoje sai o IPCA - analise impacto na curva de juros');
  }

  return hints;
}

/**
 * Build comprehensive search instructions for the AI model
 */
function buildSearchInstructions(
  categories: BriefingCategory[],
  context: TodayContext
): string {
  const dateStr = context.date.toLocaleDateString('pt-BR');
  const monthYear = context.date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  let instructions = `
## INSTRUÇÕES DE PESQUISA - ${dateStr}

Você DEVE realizar buscas web ATUALIZADAS para cada categoria abaixo.
Os dados devem ser de HOJE ou dos últimos 1-2 dias no máximo.

### PRIORIDADE DE CATEGORIAS:
`;

  // Group by priority
  const priorityGroups: Record<Priority, BriefingCategory[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  categories.forEach((cat) => {
    priorityGroups[cat.priority].push(cat);
  });

  // Critical
  if (priorityGroups.critical.length > 0) {
    instructions += `\n#### 🔴 CRÍTICO (Liderar o briefing com estes):\n`;
    priorityGroups.critical.forEach((cat) => {
      instructions += `\n**${cat.icon} ${cat.name}**\n`;
      instructions += `Buscas obrigatórias:\n`;
      cat.queries.forEach((q) => {
        const query = q.replace('{date}', dateStr).replace('{month}', monthYear);
        instructions += `- ${query}\n`;
      });
    });
  }

  // High
  if (priorityGroups.high.length > 0) {
    instructions += `\n#### 🟠 ALTA PRIORIDADE:\n`;
    priorityGroups.high.forEach((cat) => {
      instructions += `\n**${cat.icon} ${cat.name}**\n`;
      instructions += `Buscas:\n`;
      cat.queries.forEach((q) => {
        const query = q.replace('{date}', dateStr).replace('{month}', monthYear);
        instructions += `- ${query}\n`;
      });
    });
  }

  // Medium
  if (priorityGroups.medium.length > 0) {
    instructions += `\n#### 🟡 MÉDIA PRIORIDADE:\n`;
    priorityGroups.medium.forEach((cat) => {
      instructions += `\n**${cat.icon} ${cat.name}**\n`;
      instructions += `Buscas:\n`;
      cat.queries.forEach((q) => {
        const query = q.replace('{date}', dateStr).replace('{month}', monthYear);
        instructions += `- ${query}\n`;
      });
    });
  }

  // Low
  if (priorityGroups.low.length > 0) {
    instructions += `\n#### 🟢 MENOR PRIORIDADE (mas incluir):\n`;
    priorityGroups.low.forEach((cat) => {
      instructions += `\n**${cat.icon} ${cat.name}**\n`;
      instructions += `Buscas:\n`;
      cat.queries.forEach((q) => {
        const query = q.replace('{date}', dateStr).replace('{month}', monthYear);
        instructions += `- ${query}\n`;
      });
    });
  }

  return instructions;
}

/**
 * Build the coffee margin calculation context
 */
function buildCoffeeContext(farmData: FarmData): string {
  return `
## DADOS DA FAZENDA DO DR. ORESTES

- **Localização**: Guaxupé, Sul de Minas Gerais
- **Custo de Produção por Saca**: R$ ${farmData.costBasis.toFixed(2).replace('.', ',')}
- **Custo Logístico por Saca**: R$ ${farmData.logisticsCost.toFixed(2).replace('.', ',')}
- **Custo Total por Saca**: R$ ${(farmData.costBasis + farmData.logisticsCost).toFixed(2).replace('.', ',')}

### CÁLCULO DE MARGEM (OBRIGATÓRIO):

Ao pesquisar o preço CEPEA/ESALQ do café arábica:
1. Preço atual da saca: [buscar CEPEA]
2. Custo total: R$ ${(farmData.costBasis + farmData.logisticsCost).toFixed(2).replace('.', ',')}
3. Margem = Preço - Custo Total
4. Margem % = (Margem / Custo Total) × 100

Se margem > 30%: "FAVORÁVEL - considerar venda"
Se margem 15-30%: "MODERADA - aguardar"
Se margem < 15%: "BAIXA - não vender agora"
`;
}

/**
 * Main orchestration function
 *
 * Prepares all context for the AI model to generate a comprehensive,
 * personalized briefing with live data.
 */
export function orchestrateBriefing(
  date: Date,
  farmData: FarmData
): OrchestrationResult {
  // Phase 1: Plan - Determine what's relevant TODAY
  const todayContext = getTodayContext(date);
  const prioritizedCategories = getCategoriesByPriority(todayContext);

  // Phase 2: Build search context
  const searchInstructions = buildSearchInstructions(
    prioritizedCategories,
    todayContext
  );
  const coffeeContext = buildCoffeeContext(farmData);
  const dayHints = getDayHints(todayContext);

  // Combine all context
  const searchContext = `
${coffeeContext}

${searchInstructions}

## DICAS DO DIA (${todayContext.date.toLocaleDateString('pt-BR', { weekday: 'long' })}):
${dayHints.map((h) => `- ${h}`).join('\n')}
`;

  return {
    searchContext,
    prioritizedCategories,
    todayContext,
    dayHints,
  };
}

/**
 * Get category section order for the briefing
 */
export function getSectionOrder(): string[] {
  return [
    'coffee',
    'brazil_economy',
    'brazil_politics',
    'global_markets',
    'global_politics',
    'agribusiness',
    'spfc',
    'selecao',
    'tennis',
    'f1',
    'real_estate',
    'technology',
    'culture',
    'health',
  ];
}

/**
 * Get category display info
 */
export function getCategoryInfo(categoryId: string): BriefingCategory | undefined {
  return BRIEFING_CATEGORIES.find((cat) => cat.id === categoryId);
}

export default orchestrateBriefing;
