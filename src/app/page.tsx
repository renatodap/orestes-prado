import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefingCard } from "@/components/briefing/BriefingCard";
import { GenerateButton } from "@/components/briefing/GenerateButton";
import { getLatestBriefing, isConfigured, hasGeneratedToday } from "@/lib/db/queries";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function BriefingContent() {
  const [configured, canGenerate, latestBriefing] = await Promise.all([
    isConfigured(),
    hasGeneratedToday().then((v) => !v),
    getLatestBriefing(),
  ]);

  if (!configured) {
    redirect("/settings");
  }

  return (
    <>
      {/* Generate Button */}
      <div className="mb-8">
        <GenerateButton canGenerate={canGenerate} isConfigured={configured} />
      </div>

      {/* Latest Briefing */}
      {latestBriefing ? (
        <BriefingCard briefing={latestBriefing} />
      ) : (
        <div className="text-center py-12 bg-card rounded-xl border">
          <p className="text-xl text-muted-foreground">
            Nenhum briefing gerado ainda.
          </p>
          <p className="text-muted-foreground mt-2">
            Clique em &quot;Gerar Briefing&quot; para começar.
          </p>
        </div>
      )}
    </>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-14 w-full max-w-md mx-auto" />
      <div className="bg-card rounded-xl border p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">ORESTES PRADO</h1>
            <p className="text-white/80">Inteligência de Commodities</p>
          </div>
          <Link
            href="/settings"
            className="min-h-[48px] px-6 py-3 text-lg font-medium rounded-lg bg-white/10 hover:bg-white/20 transition-colors inline-flex items-center"
          >
            Configurar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <BriefingContent />
        </Suspense>

        {/* History Link */}
        <div className="mt-8 text-center">
          <Link
            href="/history"
            className="text-primary hover:underline text-lg"
          >
            Ver histórico de briefings →
          </Link>
        </div>
      </div>
    </main>
  );
}
