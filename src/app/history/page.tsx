import Link from "next/link";
import { getBriefingHistory } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const briefings = await getBriefingHistory(50);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Content */}
      <div className="max-w-2xl mx-auto mobile-container">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Histórico</h1>
          <p className="text-sm sm:text-base text-slate-500">Seus briefings anteriores</p>
        </div>

        {briefings.length === 0 ? (
          <div className="card-premium p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Nenhum histórico ainda
            </h2>
            <p className="text-slate-500 text-lg mb-4">
              Seus briefings aparecerão aqui após a geração.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Gerar primeiro briefing
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {briefings.map((briefing) => {
              const reportDate = new Date(briefing.reportDate);
              const formattedDate = reportDate.toLocaleDateString("pt-BR", {
                timeZone: 'America/Sao_Paulo',
                weekday: "long",
                day: "numeric",
                month: "long",
              });
              const year = reportDate.getFullYear();

              // Extract summary from content
              const lines = briefing.content.split("\n");
              const summaryLine = lines.find(line =>
                line.includes("margem") ||
                line.includes("Margem") ||
                line.includes("mercado")
              );
              const preview = summaryLine
                ? summaryLine.replace(/[#*_]/g, "").trim().slice(0, 100)
                : briefing.summary || "";

              return (
                <Link key={briefing.id} href={`/history/${briefing.id}`}>
                  <div className="card-premium p-3 sm:p-4 active:bg-slate-50 cursor-pointer group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-slate-900 capitalize">
                          {formattedDate}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400 mb-1">{year}</p>
                        {preview && (
                          <p className="text-slate-500 text-xs sm:text-sm line-clamp-2">
                            {preview}...
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
