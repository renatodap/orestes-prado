"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface GenerateButtonProps {
  canGenerate: boolean;
  isConfigured: boolean;
}

export function GenerateButton({ canGenerate, isConfigured }: GenerateButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!isConfigured) {
      router.push("/settings");
      return;
    }

    setIsLoading(true);
    setError(null);

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

  // If today's briefing exists, don't show anything here - the briefing speaks for itself
  if (!canGenerate && isConfigured) {
    return null;
  }

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
            Gerando seu briefing...
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
        <div className="w-full card-premium p-6 space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pesquisando preços CEPEA/ESALQ...</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: "0.2s" }} />
            <span>Consultando ICE KC Futures...</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" style={{ animationDelay: "0.4s" }} />
            <span>Verificando câmbio BRL/USD...</span>
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: "0.6s" }} />
            <span>Analisando notícias recentes...</span>
          </div>
          <p className="text-sm text-slate-400 pt-2 border-t border-slate-100">
            Isso pode levar até 60 segundos. Estamos buscando dados em tempo real.
          </p>
        </div>
      )}

      {error && (
        <div className="w-full p-4 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-lg text-red-700 font-medium">{error}</p>
          <button
            onClick={handleGenerate}
            className="mt-3 text-red-600 hover:text-red-700 font-medium underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
