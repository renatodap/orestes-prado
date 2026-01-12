import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BriefingWithChat } from "@/components/briefing/BriefingWithChat";
import { GenerateButton } from "@/components/briefing/GenerateButton";
import { ClearBriefingsButton } from "@/components/briefing/ClearBriefingsButton";
import { getLatestBriefing, isConfigured, hasGeneratedToday } from "@/lib/db/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getTodayBrazil(): string {
  return new Date().toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

async function BriefingContent() {
  const [configured, canGenerate, latestBriefing] = await Promise.all([
    isConfigured(),
    hasGeneratedToday().then((v) => !v),
    getLatestBriefing(),
  ]);

  if (!configured) {
    redirect("/settings");
  }

  const todayFormatted = getTodayBrazil();

  return (
    <>
      {/* Hero Greeting */}
      <div className="greeting-card mb-6">
        <p className="text-slate-400 text-sm uppercase tracking-wider mb-1">
          {todayFormatted}
        </p>
        <h1 className="text-2xl font-bold mb-2">
          Bom dia, Orestes
        </h1>
        {latestBriefing ? (
          <p className="text-slate-300 text-lg">
            Seu briefing de mercado está pronto.
          </p>
        ) : (
          <p className="text-slate-300 text-lg">
            Pronto para gerar sua análise?
          </p>
        )}
      </div>

      {/* Generate Button - only shows if can generate */}
      <div className="mb-6">
        <GenerateButton canGenerate={canGenerate} isConfigured={configured} />
      </div>

      {/* Latest Briefing with AI Chat */}
      {/* TEMP: Clear briefings button */}
      <div className="mb-6">
        <ClearBriefingsButton />
      </div>

      {/* Latest Briefing */}
      {latestBriefing ? (
        <BriefingWithChat briefing={latestBriefing} />
      ) : (
        <div className="card-premium p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Seu primeiro briefing
          </h2>
          <p className="text-slate-500 text-lg">
            Clique no botão acima para gerar sua análise personalizada de mercado.
          </p>
        </div>
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="greeting-card">
        <div className="skeleton h-4 w-32 mb-2 bg-white/10" />
        <div className="skeleton h-8 w-48 mb-2 bg-white/20" />
        <div className="skeleton h-5 w-64 bg-white/10" />
      </div>

      {/* Card skeleton */}
      <div className="card-premium p-6 space-y-4">
        <div className="skeleton h-6 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-5/6" />
        <div className="skeleton h-4 w-4/5" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="bg-slate-900 text-white py-3 px-4 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-base font-bold">O</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">ORESTES PRADO</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto mobile-container">
        <Suspense fallback={<LoadingSkeleton />}>
          <BriefingContent />
        </Suspense>
      </div>
    </main>
  );
}
