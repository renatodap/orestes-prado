"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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

  if (loadingSettings) {
    return (
      <main className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back link */}
        <Link
          href="/"
          className="text-primary hover:underline text-lg mb-6 inline-block"
        >
          ← Voltar
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Configuração da Fazenda
            </CardTitle>
            <CardDescription className="text-base">
              Informe os custos da sua fazenda para calcular margens nos briefings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-lg font-medium mb-2">
                Custo de Produção (R$/saca 60kg) *
              </label>
              <Input
                type="number"
                value={costBasis}
                onChange={(e) => setCostBasis(e.target.value)}
                placeholder="Ex: 1520.00"
                min="0"
                step="0.01"
              />
              <p className="text-base text-muted-foreground mt-2">
                Seu custo total para produzir uma saca de 60kg de café
              </p>
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Custo Logístico (R$/saca)
              </label>
              <Input
                type="number"
                value={logisticsCost}
                onChange={(e) => setLogisticsCost(e.target.value)}
                placeholder="Ex: 80.00"
                min="0"
                step="0.01"
              />
              <p className="text-base text-muted-foreground mt-2">
                Frete da fazenda até o porto ou armazém
              </p>
            </div>

            {/* Total cost display */}
            {costBasis && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-lg font-medium">
                  Custo Total: R${" "}
                  {(
                    parseFloat(costBasis || "0") +
                    parseFloat(logisticsCost || "0")
                  ).toFixed(2)}
                  /saca
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-lg text-red-700">{error}</p>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Salvando..." : "Salvar e Continuar"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
