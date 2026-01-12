"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface GenerateButtonProps {
  canGenerate: boolean;
  isConfigured: boolean;
}

// Research phases with icons and colors - matches the 14 categories
const RESEARCH_PHASES = [
  { id: "init", icon: "🚀", label: "Iniciando agentes de pesquisa...", color: "slate" },
  { id: "coffee", icon: "☕", label: "Pesquisando mercado de café CEPEA/ESALQ...", color: "amber" },
  { id: "coffee_ice", icon: "☕", label: "Consultando ICE KC Coffee Futures...", color: "amber" },
  { id: "weather", icon: "🌤️", label: "Verificando previsão do tempo em Minas Gerais...", color: "sky" },
  { id: "brazil_econ", icon: "📊", label: "Analisando IBOVESPA e mercado brasileiro...", color: "green" },
  { id: "forex", icon: "💱", label: "Consultando câmbio BRL/USD...", color: "emerald" },
  { id: "selic", icon: "🏦", label: "Verificando Selic e curva de juros...", color: "teal" },
  { id: "brazil_pol", icon: "🏛️", label: "Pesquisando política nacional...", color: "slate" },
  { id: "global", icon: "🌍", label: "Analisando mercados globais S&P 500, Nasdaq...", color: "blue" },
  { id: "global_pol", icon: "🌐", label: "Consultando geopolítica internacional...", color: "indigo" },
  { id: "agro", icon: "🌾", label: "Verificando preços de soja e milho...", color: "lime" },
  { id: "spfc", icon: "⚽", label: "Buscando resultados do São Paulo FC...", color: "red" },
  { id: "selecao", icon: "🇧🇷", label: "Consultando calendário da Seleção...", color: "yellow" },
  { id: "tennis", icon: "🎾", label: "Verificando ranking ATP e João Fonseca...", color: "emerald" },
  { id: "f1", icon: "🏎️", label: "Consultando classificação da F1...", color: "red" },
  { id: "real_estate", icon: "🏠", label: "Analisando mercado imobiliário SP...", color: "slate" },
  { id: "tech", icon: "💻", label: "Pesquisando fintechs e startups...", color: "violet" },
  { id: "culture", icon: "🎭", label: "Verificando eventos culturais em SP...", color: "pink" },
  { id: "health", icon: "🏥", label: "Consultando notícias de saúde...", color: "teal" },
  { id: "synthesis", icon: "✨", label: "Sintetizando briefing personalizado...", color: "amber" },
  { id: "formatting", icon: "📝", label: "Formatando relatório final...", color: "slate" },
];

// Tips to show while waiting
const WAITING_TIPS = [
  "O briefing inclui 14 seções personalizadas para o Dr. Orestes",
  "Todos os dados são obtidos em tempo real via web search",
  "O sistema calcula automaticamente a margem da fazenda",
  "Preços são formatados no padrão brasileiro (R$ 1.234,56)",
  "O tom é formal, adequado a um executivo sênior",
  "Fontes são citadas para todos os dados apresentados",
];

export function GenerateButton({ canGenerate, isConfigured }: GenerateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [completedPhases, setCompletedPhases] = useState<string[]>([]);

  // Cycle through phases while loading
  useEffect(() => {
    if (!isLoading) {
      setCurrentPhase(0);
      setElapsedTime(0);
      setCompletedPhases([]);
      return;
    }

    // Phase progression - speeds up as we go
    const phaseInterval = setInterval(() => {
      setCurrentPhase((prev) => {
        const next = prev + 1;
        if (next < RESEARCH_PHASES.length) {
          setCompletedPhases((completed) => [...completed, RESEARCH_PHASES[prev].id]);
          return next;
        }
        // Loop back to synthesis phases if still loading
        return RESEARCH_PHASES.length - 2;
      });
    }, 4000); // Change phase every 4 seconds

    // Time counter
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Tip rotation
    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % WAITING_TIPS.length);
    }, 8000);

    return () => {
      clearInterval(phaseInterval);
      clearInterval(timeInterval);
      clearInterval(tipInterval);
    };
  }, [isLoading]);

  const handleGenerate = async () => {
    if (!isConfigured) {
      router.push("/settings");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPhase(0);
    setElapsedTime(0);
    setCompletedPhases([]);

    try {
      const response = await fetch("/api/briefing/generate", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar briefing");
      }

      // Refresh to show the new briefing
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  // If today's briefing exists, don't show anything here
  if (!canGenerate && isConfigured) {
    return null;
  }

  const currentPhaseData = RESEARCH_PHASES[currentPhase];
  const progress = Math.min((currentPhase / (RESEARCH_PHASES.length - 1)) * 100, 95);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full btn-accessible btn-generate disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Gerando briefing...
          </span>
        ) : !isConfigured ? (
          "Configurar Fazenda"
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Gerar Briefing de Hoje
          </span>
        )}
      </button>

      {isLoading && (
        <div className="w-full card-premium overflow-hidden">
          {/* Header with time */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-medium">Agente de Pesquisa Ativo</span>
              </div>
              <div className="text-sm text-slate-300 font-mono">
                {formatTime(elapsedTime)}
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-blue-400 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-slate-400">
              <span>Pesquisando dados</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Current activity */}
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="text-2xl animate-bounce">
                {currentPhaseData.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-800">
                  {currentPhaseData.label}
                </div>
                <div className="text-sm text-slate-500">
                  Fase {currentPhase + 1} de {RESEARCH_PHASES.length}
                </div>
              </div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>

          {/* Recent completed phases */}
          <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
              Pesquisas concluídas
            </div>
            {completedPhases.slice(-6).map((phaseId, index) => {
              const phase = RESEARCH_PHASES.find(p => p.id === phaseId);
              if (!phase) return null;
              return (
                <div
                  key={phaseId}
                  className="flex items-center gap-2 text-sm text-slate-600 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="opacity-80">{phase.icon}</span>
                  <span className="truncate">{phase.label.replace("...", "")}</span>
                </div>
              );
            })}
            {completedPhases.length === 0 && (
              <div className="text-sm text-slate-400 italic">
                Iniciando pesquisas...
              </div>
            )}
          </div>

          {/* Tip section */}
          <div className="bg-slate-50 p-4 border-t border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600">💡</span>
              </div>
              <div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Você sabia?
                </div>
                <p className="text-sm text-slate-600 transition-all duration-500">
                  {WAITING_TIPS[currentTip]}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-100 px-4 py-3 text-center">
            <p className="text-xs text-slate-500">
              ⏱️ Tempo estimado: 60-120 segundos • Todos os dados são obtidos em tempo real
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-red-600">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-lg text-red-700 font-medium">{error}</p>
              <button
                onClick={handleGenerate}
                className="mt-3 text-red-600 hover:text-red-700 font-medium underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
