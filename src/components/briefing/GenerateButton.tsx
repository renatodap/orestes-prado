"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

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

  if (!canGenerate && isConfigured) {
    return (
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-lg text-muted-foreground">
          Briefing de hoje já foi gerado. Volte amanhã!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full max-w-md text-lg"
        size="lg"
      >
        {isLoading
          ? "Gerando briefing..."
          : !isConfigured
          ? "Configurar Fazenda"
          : "Gerar Briefing de Hoje"}
      </Button>

      {isLoading && (
        <div className="w-full max-w-2xl p-6 bg-card rounded-lg border space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <p className="text-base text-muted-foreground mt-4">
            Pesquisando dados de mercado e gerando análise...
          </p>
          <p className="text-sm text-muted-foreground">
            Isso pode levar até 60 segundos.
          </p>
        </div>
      )}

      {error && (
        <div className="w-full max-w-md p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-lg text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
