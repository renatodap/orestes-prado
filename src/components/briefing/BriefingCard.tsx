"use client";

import type { Briefing } from "@/lib/db/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BriefingCardProps {
  briefing: Briefing;
}

export function BriefingCard({ briefing }: BriefingCardProps) {
  const reportDate = new Date(briefing.reportDate);
  const formattedDate = reportDate.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="card-premium overflow-hidden">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
              Briefing Diário
            </p>
            <p className="text-white/90 capitalize">
              {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>AI Research</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Personal greeting styling
              h2: ({ children }) => {
                const text = String(children);
                if (text.includes("BOM DIA")) {
                  return (
                    <h2 className="text-2xl font-bold text-slate-900 mt-0 mb-4 pb-0 border-b-0">
                      {children}
                    </h2>
                  );
                }
                if (text.includes("SUA MARGEM")) {
                  return (
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mt-8 mb-4 pb-3 border-b border-slate-100">
                      <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      {children}
                    </h2>
                  );
                }
                if (text.includes("TRÊS FATOS") || text.includes("FATOS")) {
                  return (
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mt-8 mb-4 pb-3 border-b border-slate-100">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      {children}
                    </h2>
                  );
                }
                if (text.includes("O QUE FAZER") || text.includes("FAZER")) {
                  return (
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mt-8 mb-4 pb-3 border-b border-slate-100">
                      <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                      </span>
                      {children}
                    </h2>
                  );
                }
                if (text.includes("RADAR")) {
                  return (
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mt-8 mb-4 pb-3 border-b border-slate-100">
                      <span className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </span>
                      {children}
                    </h2>
                  );
                }
                if (text.includes("FONTES")) {
                  return (
                    <h2 className="text-sm font-bold text-slate-400 mt-8 mb-3 uppercase tracking-wider">
                      {children}
                    </h2>
                  );
                }
                return (
                  <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4 pb-3 border-b border-slate-100">
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => {
                const text = String(children);
                // Check if it's a numbered fact (1. 2. 3.)
                if (/^\d+\./.test(text)) {
                  return (
                    <h3 className="text-base font-bold text-slate-800 mt-5 mb-2">
                      {children}
                    </h3>
                  );
                }
                return (
                  <h3 className="text-lg font-semibold text-slate-800 mt-6 mb-3">
                    {children}
                  </h3>
                );
              },
              strong: ({ children }) => {
                const text = String(children);
                // Signal badges
                if (text === "VENDER" || text.includes("VENDER")) {
                  return <span className="signal-badge signal-sell">{children}</span>;
                }
                if (text === "COMPRAR" || text.includes("COMPRAR")) {
                  return <span className="signal-badge signal-buy">{children}</span>;
                }
                if (text === "AGUARDAR" || text.includes("AGUARDAR")) {
                  return <span className="signal-badge signal-hold">{children}</span>;
                }
                if (text === "HEDGE" || text.includes("HEDGE")) {
                  return <span className="signal-badge signal-hedge">{children}</span>;
                }
                if (text === "FAZER") {
                  return <span className="signal-badge signal-buy">{children}</span>;
                }
                if (text === "NÃO FAZER") {
                  return <span className="signal-badge signal-sell">{children}</span>;
                }
                if (text === "FAVORÁVEL") {
                  return <span className="signal-badge signal-buy">{children}</span>;
                }
                if (text === "DESFAVORÁVEL") {
                  return <span className="signal-badge signal-sell">{children}</span>;
                }
                // Margin percentage styling
                if (text.includes("%")) {
                  const num = parseFloat(text);
                  if (!isNaN(num)) {
                    const colorClass = num > 30 ? "text-emerald-600" : num > 15 ? "text-amber-600" : "text-red-600";
                    return <strong className={`font-bold ${colorClass}`}>{children}</strong>;
                  }
                }
                return <strong className="font-semibold text-slate-900">{children}</strong>;
              },
              table: ({ children }) => (
                <div className="overflow-x-auto my-4 -mx-2">
                  <table className="w-full text-base border-collapse bg-slate-50/50 rounded-xl overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-slate-100">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="p-3 text-left font-semibold text-slate-700 text-sm uppercase tracking-wide first:rounded-tl-lg last:rounded-tr-lg">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="p-3 border-t border-slate-100 text-slate-600">
                  {children}
                </td>
              ),
              ul: ({ children }) => (
                <ul className="space-y-2 my-4">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2.5 flex-shrink-0" />
                  <span>{children}</span>
                </li>
              ),
              p: ({ children }) => (
                <p className="text-lg leading-relaxed my-3 text-slate-600">{children}</p>
              ),
              hr: () => <hr className="my-6 border-slate-100" />,
            }}
          >
            {briefing.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Gerado às {new Date(briefing.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors no-print"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>
    </article>
  );
}
