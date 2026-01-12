"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * TEMPORARY ADMIN BUTTON
 * Delete this file and references after use!
 */
export function AdminResetButton() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Tem certeza? Isso vai deletar os briefings dos últimos 3 dias.")) {
      return;
    }

    setIsDeleting(true);
    setResult(null);

    try {
      const response = await fetch("/api/briefing/delete", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setResult(`Deletados: ${data.deleted} briefing(s). Recarregando...`);
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setResult(`Erro: ${data.error}`);
      }
    } catch (error) {
      setResult("Erro ao deletar");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-red-600 font-bold text-sm">ADMIN TEMPORÁRIO</span>
      </div>
      <p className="text-red-700 text-sm mb-3">
        Clique para deletar briefings recentes (10 e 11 de janeiro) e poder regenerar.
      </p>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isDeleting ? "Deletando..." : "Deletar Briefings Recentes"}
      </button>
      {result && (
        <p className="mt-2 text-sm text-red-800">{result}</p>
      )}
    </div>
  );
}
