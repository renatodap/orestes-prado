/**
 * Briefing Categories Configuration
 *
 * Defines all 14 categories for the personalized briefing system.
 * Each category includes search queries, priority, and relevance checks.
 */

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface BriefingCategory {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  priority: Priority;
  queries: string[];
  alwaysInclude: boolean;
  relevanceBoost?: (context: TodayContext) => Priority;
}

export interface TodayContext {
  date: Date;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  isMonday: boolean;
  isFriday: boolean;
  isWeekend: boolean;
  isCopomDay: boolean;
  isIPCADay: boolean;
  spfcPlayedRecently: boolean;
  selecaoMatch: boolean;
}

export const BRIEFING_CATEGORIES: BriefingCategory[] = [
  // ============================================
  // CRITICAL PRIORITY - Always lead with these
  // ============================================
  {
    id: 'coffee',
    name: 'Mercado de Café',
    nameEn: 'Coffee Market',
    icon: '☕',
    color: 'amber-600',
    priority: 'critical',
    alwaysInclude: true,
    queries: [
      'CEPEA arabica café preço hoje',
      'indicador CEPEA ESALQ café arábica saca',
      'ICE KC coffee C futures price today',
      'Porto Santos café congestionamento fila navios',
      'Minas Gerais previsão tempo próximos 7 dias',
      'safra café Brasil 2025 2026 Conab',
      'exportação café brasileiro',
    ],
  },
  {
    id: 'brazil_economy',
    name: 'Brasil Economia',
    nameEn: 'Brazil Economy',
    icon: '📊',
    color: 'green-600',
    priority: 'critical',
    alwaysInclude: true,
    queries: [
      'IBOVESPA hoje fechamento',
      'B3 bolsa brasileira principais altas baixas',
      'dólar real cotação hoje',
      'USD BRL câmbio',
      'Selic taxa COPOM decisão',
      'IPCA inflação Brasil mensal',
      'DI futuro curva juros',
      'desemprego Brasil taxa IBGE',
      'reestruturação dívida corporativa Brasil',
    ],
  },
  {
    id: 'brazil_politics',
    name: 'Política Nacional',
    nameEn: 'Brazil Politics',
    icon: '🏛️',
    color: 'slate-700',
    priority: 'critical',
    alwaysInclude: true,
    queries: [
      'Lula governo notícias hoje',
      'arcabouço fiscal Brasil',
      'eleições 2026 Brasil pesquisa',
      'Congresso Nacional votação',
      'Banco Central Brasil comunicado',
      'ministério fazenda economia',
    ],
  },

  // ============================================
  // HIGH PRIORITY - Important daily content
  // ============================================
  {
    id: 'global_markets',
    name: 'Mercados Globais',
    nameEn: 'Global Markets',
    icon: '🌍',
    color: 'blue-600',
    priority: 'high',
    alwaysInclude: true,
    queries: [
      'S&P 500 Dow Jones Nasdaq today',
      'US stock market performance',
      'Federal Reserve Fed policy interest rate',
      'China economy GDP news',
      'European markets DAX FTSE',
      'oil price Brent WTI',
      'gold price commodities',
    ],
  },
  {
    id: 'global_politics',
    name: 'Política Internacional',
    nameEn: 'Global Politics',
    icon: '🌐',
    color: 'indigo-600',
    priority: 'high',
    alwaysInclude: true,
    queries: [
      'United States politics administration',
      'China geopolitics news',
      'European Union news',
      'Ukraine war latest',
      'Middle East tensions',
      'IMF World Bank outlook',
    ],
  },
  {
    id: 'agribusiness',
    name: 'Agronegócio',
    nameEn: 'Agribusiness',
    icon: '🌾',
    color: 'lime-600',
    priority: 'high',
    alwaysInclude: true,
    queries: [
      'soja preço CEPEA hoje',
      'milho preço CEPEA',
      'safra soja milho Brasil 2025 2026',
      'exportação agronegócio Brasil China',
      'Porto Paranaguá Santos logística grãos',
    ],
  },
  {
    id: 'spfc',
    name: 'São Paulo FC',
    nameEn: 'São Paulo FC',
    icon: '⚽',
    color: 'red-600',
    priority: 'high',
    alwaysInclude: true,
    queries: [
      'São Paulo FC resultado último jogo',
      'São Paulo FC próximo jogo',
      'São Paulo FC classificação Brasileirão',
      'São Paulo FC Paulistão Copa do Brasil',
      'São Paulo FC escalação notícias',
      'SPFC Tricolor Morumbi',
    ],
    relevanceBoost: (ctx) => (ctx.isMonday || ctx.dayOfWeek === 0 ? 'critical' : 'high'),
  },

  // ============================================
  // MEDIUM PRIORITY - Regular content
  // ============================================
  {
    id: 'selecao',
    name: 'Seleção Brasileira',
    nameEn: 'Brazil National Team',
    icon: '🇧🇷',
    color: 'yellow-500',
    priority: 'medium',
    alwaysInclude: true,
    queries: [
      'Seleção Brasileira próximo jogo',
      'Brasil eliminatórias Copa do Mundo 2026',
      'Carlo Ancelotti seleção brasileira',
      'convocação seleção brasileira',
    ],
    relevanceBoost: (ctx) => (ctx.selecaoMatch ? 'critical' : 'medium'),
  },
  {
    id: 'tennis',
    name: 'Tênis',
    nameEn: 'Tennis',
    icon: '🎾',
    color: 'emerald-500',
    priority: 'medium',
    alwaysInclude: true,
    queries: [
      'ATP ranking top 10',
      'João Fonseca tênis brasileiro',
      'tênis torneio atual ATP',
      'Grand Slam calendário 2026',
    ],
  },
  {
    id: 'f1',
    name: 'Fórmula 1',
    nameEn: 'Formula 1',
    icon: '🏎️',
    color: 'red-500',
    priority: 'medium',
    alwaysInclude: true,
    queries: [
      'F1 Formula 1 championship standings 2026',
      'F1 last race results',
      'F1 next race calendar',
      'GP Brasil Interlagos 2026',
    ],
  },
  {
    id: 'real_estate',
    name: 'Mercado Imobiliário',
    nameEn: 'Real Estate',
    icon: '🏠',
    color: 'slate-600',
    priority: 'medium',
    alwaysInclude: true,
    queries: [
      'mercado imobiliário São Paulo',
      'IGPM índice imóveis',
      'construção civil Brasil',
      'lançamentos imobiliários SP',
    ],
  },

  // ============================================
  // LOW PRIORITY - Enrichment content
  // ============================================
  {
    id: 'technology',
    name: 'Tecnologia e Startups',
    nameEn: 'Technology & Startups',
    icon: '💻',
    color: 'violet-600',
    priority: 'low',
    alwaysInclude: true,
    queries: [
      'fintechs Brasil notícias',
      'startups brasileiras investimento',
      'banco digital Brasil',
      'inovação financeira',
      'venture capital Brasil',
    ],
  },
  {
    id: 'culture',
    name: 'Cultura e Arte',
    nameEn: 'Culture & Arts',
    icon: '🎭',
    color: 'pink-600',
    priority: 'low',
    alwaysInclude: true,
    queries: [
      'MASP exposição São Paulo',
      'Pinacoteca SP eventos',
      'teatro São Paulo programação',
      'eventos culturais SP',
      'música clássica São Paulo',
    ],
    relevanceBoost: (ctx) => (ctx.isFriday ? 'medium' : 'low'),
  },
  {
    id: 'health',
    name: 'Saúde e Bem-Estar',
    nameEn: 'Health & Wellness',
    icon: '🏥',
    color: 'teal-600',
    priority: 'low',
    alwaysInclude: true,
    queries: [
      'saúde idosos avanços médicos',
      'longevidade pesquisa',
      'medicina São Paulo',
      'bem-estar senior',
    ],
  },
];

/**
 * Get today's context for priority adjustments
 */
export function getTodayContext(date: Date = new Date()): TodayContext {
  const dayOfWeek = date.getDay();

  return {
    date,
    dayOfWeek,
    isMonday: dayOfWeek === 1,
    isFriday: dayOfWeek === 5,
    isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    // These would be determined by API calls in production
    isCopomDay: false,
    isIPCADay: false,
    spfcPlayedRecently: false,
    selecaoMatch: false,
  };
}

/**
 * Get categories sorted by priority with context adjustments
 */
export function getCategoriesByPriority(context: TodayContext): BriefingCategory[] {
  const priorityOrder: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return [...BRIEFING_CATEGORIES]
    .map((cat) => {
      const adjustedPriority = cat.relevanceBoost?.(context) ?? cat.priority;
      return { ...cat, priority: adjustedPriority };
    })
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Get all search queries for a given date
 */
export function getAllSearchQueries(date: Date = new Date()): string[] {
  const dateStr = date.toLocaleDateString('pt-BR');
  const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return BRIEFING_CATEGORIES.flatMap((cat) =>
    cat.queries.map((q) =>
      q.replace('{date}', dateStr).replace('{month}', monthYear)
    )
  );
}

export default BRIEFING_CATEGORIES;
