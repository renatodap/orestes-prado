"use client";

interface SuggestedQuestionsProps {
  sectionTitle?: string;
  onSelect: (question: string) => void;
}

/**
 * Contextual suggested questions based on section
 */
const SECTION_QUESTIONS: Record<string, string[]> = {
  // Coffee
  "CAFÉ": [
    "Qual é a margem atual da fazenda?",
    "É um bom momento para vender café?",
    "Como está o dólar afetando as exportações?",
  ],
  "MERCADO DE CAFÉ": [
    "Qual é a margem atual da fazenda?",
    "É um bom momento para vender café?",
    "Como está o dólar afetando as exportações?",
  ],

  // Brazil
  "BRASIL": [
    "Como está o IBOVESPA hoje?",
    "Qual a tendência do dólar?",
    "O que esperar do COPOM?",
  ],
  "BRASIL HOJE": [
    "Como está o IBOVESPA hoje?",
    "Qual a tendência do dólar?",
    "O que esperar do COPOM?",
  ],

  // Global
  "GLOBAL": [
    "Como os mercados americanos afetam o Brasil?",
    "Quais commodities estão em alta?",
    "O que está acontecendo com o Fed?",
  ],
  "CENÁRIO GLOBAL": [
    "Como os mercados americanos afetam o Brasil?",
    "Quais commodities estão em alta?",
    "O que está acontecendo com o Fed?",
  ],

  // Agribusiness
  "AGRONEGÓCIO": [
    "Como está a soja hoje?",
    "Qual a situação da safra?",
    "Como está a logística nos portos?",
  ],

  // Sports - São Paulo
  "SÃO PAULO FC": [
    "Como foi o último jogo do Tricolor?",
    "Qual a classificação atual?",
    "Quando é o próximo jogo?",
  ],
  "ESPORTES": [
    "Como foi o último jogo do São Paulo?",
    "Quando joga a Seleção?",
    "Como está João Fonseca no ranking?",
  ],

  // Tennis
  "TÊNIS": [
    "Como está João Fonseca no ranking?",
    "Quem lidera o ATP?",
    "Quando é o próximo Grand Slam?",
  ],

  // F1
  "FÓRMULA 1": [
    "Quem lidera o campeonato?",
    "Quando é a próxima corrida?",
    "Quando é o GP do Brasil?",
  ],
  "F1": [
    "Quem lidera o campeonato?",
    "Quando é a próxima corrida?",
    "Quando é o GP do Brasil?",
  ],

  // Real Estate
  "MERCADO IMOBILIÁRIO": [
    "Como está o mercado em São Paulo?",
    "Qual a tendência do IGPM?",
    "O que esperar dos preços?",
  ],
  "IMOBILIÁRIO": [
    "Como está o mercado em São Paulo?",
    "Qual a tendência do IGPM?",
    "O que esperar dos preços?",
  ],

  // Technology
  "TECNOLOGIA": [
    "Quais fintechs estão em destaque?",
    "Houve investimentos em startups?",
    "Novidades dos bancos digitais?",
  ],
  "TECNOLOGIA E STARTUPS": [
    "Quais fintechs estão em destaque?",
    "Houve investimentos em startups?",
    "Novidades dos bancos digitais?",
  ],

  // Culture
  "CULTURA": [
    "O que está em cartaz no MASP?",
    "Alguma peça recomendada?",
    "Eventos para o fim de semana?",
  ],
  "CULTURA E ARTE": [
    "O que está em cartaz no MASP?",
    "Alguma peça recomendada?",
    "Eventos para o fim de semana?",
  ],

  // Health
  "SAÚDE": [
    "Quais avanços médicos recentes?",
    "Dicas de bem-estar?",
    "Novidades em longevidade?",
  ],
  "SAÚDE E BEM-ESTAR": [
    "Quais avanços médicos recentes?",
    "Dicas de bem-estar?",
    "Novidades em longevidade?",
  ],

  // Schedule
  "AGENDA": [
    "Quais eventos econômicos esta semana?",
    "Quando são os próximos jogos?",
    "O que tem de importante na agenda?",
  ],
  "AGENDA DA SEMANA": [
    "Quais eventos econômicos esta semana?",
    "Quando são os próximos jogos?",
    "O que tem de importante na agenda?",
  ],

  // Selection
  "SELEÇÃO": [
    "Quando joga a Seleção?",
    "Como está a preparação para Copa 2026?",
    "Novidades do Ancelotti?",
  ],
  "SELEÇÃO BRASILEIRA": [
    "Quando joga a Seleção?",
    "Como está a preparação para Copa 2026?",
    "Novidades do Ancelotti?",
  ],
};

// Default questions when no section context
const DEFAULT_QUESTIONS = [
  "Qual é o resumo do briefing de hoje?",
  "Como está a margem da fazenda de café?",
  "Quais são os destaques dos mercados?",
  "Como foi o último jogo do São Paulo?",
];

export function SuggestedQuestions({
  sectionTitle,
  onSelect,
}: SuggestedQuestionsProps) {
  // Get questions based on section or use default
  let questions = DEFAULT_QUESTIONS;

  if (sectionTitle) {
    const normalizedTitle = sectionTitle.toUpperCase().trim();

    // Try exact match first
    if (SECTION_QUESTIONS[normalizedTitle]) {
      questions = SECTION_QUESTIONS[normalizedTitle];
    } else {
      // Try partial match
      for (const [key, qs] of Object.entries(SECTION_QUESTIONS)) {
        if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
          questions = qs;
          break;
        }
      }
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3">
        Sugestões
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelect(question)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-sm text-slate-700 font-medium hover:bg-slate-200 active:scale-95 transition-all duration-150 text-left"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
