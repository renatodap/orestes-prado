"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [costBasis, setCostBasis] = useState("");
  const [logisticsCost, setLogisticsCost] = useState("80");
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState("");

  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.settings) {
          if (data.settings.costBasis) {
            setCostBasis(data.settings.costBasis.toString());
          }
          if (data.settings.logisticsCost) {
            setLogisticsCost(data.settings.logisticsCost.toString());
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoadingSettings(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!costBasis || parseFloat(costBasis) <= 0) {
      setError("Informe um custo de produção válido");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          costBasis: parseFloat(costBasis),
          logisticsCost: parseFloat(logisticsCost || "80"),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const totalCost = (parseFloat(costBasis || "0") + parseFloat(logisticsCost || "0"));

  if (loadingSettings) {
    return (
      <main className="min-h-screen bg-background">
        <header className="bg-slate-900 text-white py-4 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <span className="text-lg font-bold">O</span>
              </div>
              <span className="font-semibold tracking-tight">ORESTES PRADO</span>
            </div>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="card-premium p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full mx-auto" />
            <p className="mt-4 text-slate-500">Carregando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-lg font-bold">O</span>
            </div>
            <span className="font-semibold tracking-tight">ORESTES PRADO</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
          <p className="text-slate-500">Configure sua fazenda para análises personalizadas</p>
        </div>

        <div className="card-premium p-6 space-y-6">
          {/* Cost Basis */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Custo de Produção
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
              <input
                type="number"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                placeholder="1.520,00"
                min="0"
                step="0.01"
                className="w-full pl-12 pr-20 py-4 text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">/saca</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Seu custo total para produzir uma saca de 60kg
            </p>
          </div>

          {/* Logistics Cost */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">
              Custo Logístico
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
              <input
                type="number"
                value={logisticsCost}
                onChange={(e) => setLogisticsCost(e.target.value)}
                placeholder="80,00"
                min="0"
                step="0.01"
                className="w-full pl-12 pr-20 py-4 text-lg font-medium bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">/saca</span>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Frete da fazenda até o porto/armazém
            </p>
          </div>

          {/* Total Cost Display */}
          {costBasis && (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm uppercase tracking-wide">Custo Total</p>
                  <p className="text-2xl font-bold">
                    R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">por saca de 60kg</p>
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading || !costBasis}
            className="w-full btn-accessible btn-generate disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Salvando...
              </span>
            ) : (
              "Salvar Configurações"
            )}
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">Como usamos esses dados?</p>
              <p className="text-sm text-blue-700 mt-1">
                Calculamos sua margem de lucro comparando seu custo total com o preço de mercado CEPEA/ESALQ,
                para recomendar se é um bom momento para vender.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
