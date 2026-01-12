"use client";

import type { Briefing } from "@/lib/db/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface BriefingCardProps {
  briefing: Briefing;
  onAskAboutSection?: (sectionTitle: string) => void;
}

/**
 * Get dynamic greeting based on current time in São Paulo
 */
function getGreeting(): string {
  const spTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Sao_Paulo",
  });
  const hour = new Date(spTime).getHours();

  if (hour >= 5 && hour < 12) return "BOM DIA";
  if (hour >= 12 && hour < 18) return "BOA TARDE";
  return "BOA NOITE";
}

/**
 * Section configuration with icons and colors
 */
const SECTION_CONFIG: Record<
  string,
  { icon: string; bgColor: string; textColor: string }
> = {
  // Coffee market
  CAFÉ: { icon: "☕", bgColor: "bg-amber-100", textColor: "text-amber-600" },
  "MERCADO DE CAFÉ": { icon: "☕", bgColor: "bg-amber-100", textColor: "text-amber-600" },

  // Brazil sections
  BRASIL: { icon: "🇧🇷", bgColor: "bg-green-100", textColor: "text-green-600" },
  "BRASIL HOJE": { icon: "🇧🇷", bgColor: "bg-green-100", textColor: "text-green-600" },

  // Global
  GLOBAL: { icon: "🌍", bgColor: "bg-blue-100", textColor: "text-blue-600" },
  "CENÁRIO GLOBAL": { icon: "🌍", bgColor: "bg-blue-100", textColor: "text-blue-600" },

  // Agribusiness
  AGRONEGÓCIO: { icon: "🌾", bgColor: "bg-lime-100", textColor: "text-lime-600" },

  // Sports
  ESPORTES: { icon: "🏆", bgColor: "bg-red-100", textColor: "text-red-600" },
  "SÃO PAULO FC": { icon: "⚽", bgColor: "bg-red-100", textColor: "text-red-600" },
  SELEÇÃO: { icon: "🇧🇷", bgColor: "bg-yellow-100", textColor: "text-yellow-600" },
  "SELEÇÃO BRASILEIRA": { icon: "🇧🇷", bgColor: "bg-yellow-100", textColor: "text-yellow-600" },
  TÊNIS: { icon: "🎾", bgColor: "bg-emerald-100", textColor: "text-emerald-600" },
  "FÓRMULA 1": { icon: "🏎️", bgColor: "bg-red-100", textColor: "text-red-500" },
  F1: { icon: "🏎️", bgColor: "bg-red-100", textColor: "text-red-500" },

  // Lifestyle
  "MERCADO IMOBILIÁRIO": { icon: "🏠", bgColor: "bg-slate-100", textColor: "text-slate-600" },
  IMOBILIÁRIO: { icon: "🏠", bgColor: "bg-slate-100", textColor: "text-slate-600" },
  TECNOLOGIA: { icon: "💻", bgColor: "bg-violet-100", textColor: "text-violet-600" },
  "TECNOLOGIA E STARTUPS": { icon: "💻", bgColor: "bg-violet-100", textColor: "text-violet-600" },
  CULTURA: { icon: "🎭", bgColor: "bg-pink-100", textColor: "text-pink-600" },
  "CULTURA E ARTE": { icon: "🎭", bgColor: "bg-pink-100", textColor: "text-pink-600" },
  SAÚDE: { icon: "🏥", bgColor: "bg-teal-100", textColor: "text-teal-600" },
  "SAÚDE E BEM-ESTAR": { icon: "🏥", bgColor: "bg-teal-100", textColor: "text-teal-600" },

  // Schedule
  AGENDA: { icon: "📅", bgColor: "bg-indigo-100", textColor: "text-indigo-600" },
  "AGENDA DA SEMANA": { icon: "📅", bgColor: "bg-indigo-100", textColor: "text-indigo-600" },

  // Sources
  FONTES: { icon: "📚", bgColor: "bg-gray-100", textColor: "text-gray-500" },

  // Legacy sections (for backwards compatibility)
  "SUA MARGEM": { icon: "💰", bgColor: "bg-emerald-100", textColor: "text-emerald-600" },
  "SUA MARGEM HOJE": { icon: "💰", bgColor: "bg-emerald-100", textColor: "text-emerald-600" },
  "TRÊS FATOS": { icon: "📊", bgColor: "bg-blue-100", textColor: "text-blue-600" },
  "O QUE FAZER": { icon: "✅", bgColor: "bg-amber-100", textColor: "text-amber-600" },
  RADAR: { icon: "📡", bgColor: "bg-purple-100", textColor: "text-purple-600" },
  "RADAR DA SEMANA": { icon: "📡", bgColor: "bg-purple-100", textColor: "text-purple-600" },

  // Opening section
  "ABERTURA PERSONALIZADA": { icon: "📋", bgColor: "bg-slate-100", textColor: "text-slate-700" },
};

/**
 * Get section configuration by matching the section title
 */
function getSectionConfig(text: string): { icon: string; bgColor: string; textColor: string } | null {
  // Direct match
  if (SECTION_CONFIG[text]) {
    return SECTION_CONFIG[text];
  }

  // Partial match
  for (const [key, config] of Object.entries(SECTION_CONFIG)) {
    if (text.toUpperCase().includes(key)) {
      return config;
    }
  }

  return null;
}

/**
 * Small "Ask AI" button component for section headers
 */
function AskAIButton({
  onClick,
  className
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        "bg-slate-100 hover:bg-slate-200 active:bg-slate-300",
        "text-slate-500 hover:text-slate-700",
        "transition-all duration-150 active:scale-95",
        "flex-shrink-0 no-print",
        className
      )}
      aria-label="Perguntar à IA sobre esta seção"
      title="Perguntar à IA"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  );
}

export function BriefingCard({ briefing, onAskAboutSection }: BriefingCardProps) {
  const reportDate = new Date(briefing.reportDate);
  const formattedDate = reportDate.toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Memoize greeting to avoid unnecessary recalculations
  const greeting = useMemo(() => getGreeting(), []);

  return (
    <article className="card-premium overflow-hidden">
      {/* Dynamic Greeting Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {greeting}, DR. ORESTES
            </h1>
            <p className="text-slate-400 capitalize text-sm sm:text-base">
              {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>AI</span>
          </div>
        </div>
      </div>

      {/* Content - Mobile optimized */}
      <div className="p-4 sm:p-6">
        <div className="prose max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Section headers with dynamic icons and Ask AI button
              h2: ({ children }) => {
                const text = String(children).toUpperCase();
                const originalText = String(children);
                const config = getSectionConfig(text);

                // Special case: FONTES section (smaller styling, no AI button)
                if (text.includes("FONTES")) {
                  return (
                    <h2 className="text-xs sm:text-sm font-bold text-slate-400 mt-8 sm:mt-10 mb-2 sm:mb-3 uppercase tracking-wider">
                      {config?.icon && <span className="mr-2">{config.icon}</span>}
                      {children}
                    </h2>
                  );
                }

                // Special case: ABERTURA (opening - no icon header, just clean text)
                if (text.includes("ABERTURA")) {
                  return (
                    <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-slate-900 mt-0 mb-3 pb-3 border-b border-slate-100">
                      <span>{children}</span>
                      {onAskAboutSection && (
                        <AskAIButton onClick={() => onAskAboutSection(originalText)} />
                      )}
                    </h2>
                  );
                }

                // Default section with icon and Ask AI button
                if (config) {
                  return (
                    <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 mt-8 sm:mt-10 mb-3 pb-2 sm:pb-3 border-b border-slate-100">
                      <span
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${config.bgColor} flex items-center justify-center flex-shrink-0 text-lg`}
                      >
                        {config.icon}
                      </span>
                      <span className="truncate flex-1">{children}</span>
                      {onAskAboutSection && (
                        <AskAIButton onClick={() => onAskAboutSection(originalText)} />
                      )}
                    </h2>
                  );
                }

                // Fallback for unknown sections
                return (
                  <h2 className="flex items-center justify-between text-lg sm:text-xl font-bold text-slate-900 mt-8 sm:mt-10 mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-100">
                    <span>{children}</span>
                    {onAskAboutSection && (
                      <AskAIButton onClick={() => onAskAboutSection(originalText)} />
                    )}
                  </h2>
                );
              },

              // Subsection headers
              h3: ({ children }) => {
                const text = String(children);
                // Check if it's a numbered fact (1. 2. 3.)
                if (/^\d+\./.test(text)) {
                  return (
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 mt-4 sm:mt-5 mb-1.5 sm:mb-2">
                      {children}
                    </h3>
                  );
                }

                // Sports subsections
                const sportsConfig = getSectionConfig(text.toUpperCase());
                if (sportsConfig) {
                  return (
                    <h3 className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-800 mt-5 sm:mt-6 mb-2 sm:mb-3">
                      <span className="text-base">{sportsConfig.icon}</span>
                      <span>{children}</span>
                    </h3>
                  );
                }

                return (
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800 mt-5 sm:mt-6 mb-2 sm:mb-3">
                    {children}
                  </h3>
                );
              },

              // Bold text and signal badges
              strong: ({ children }) => {
                const text = String(children);

                // Signal badges for recommendations
                if (text === "VENDER" || text.includes("VENDER")) {
                  return (
                    <span className="signal-badge signal-sell">{children}</span>
                  );
                }
                if (text === "COMPRAR" || text.includes("COMPRAR")) {
                  return (
                    <span className="signal-badge signal-buy">{children}</span>
                  );
                }
                if (text === "AGUARDAR" || text.includes("AGUARDAR")) {
                  return (
                    <span className="signal-badge signal-hold">{children}</span>
                  );
                }
                if (text === "HEDGE" || text.includes("HEDGE")) {
                  return (
                    <span className="signal-badge signal-hedge">{children}</span>
                  );
                }
                if (text === "FAZER") {
                  return (
                    <span className="signal-badge signal-buy">{children}</span>
                  );
                }
                if (text === "NÃO FAZER") {
                  return (
                    <span className="signal-badge signal-sell">{children}</span>
                  );
                }
                if (text === "FAVORÁVEL") {
                  return (
                    <span className="signal-badge signal-buy">{children}</span>
                  );
                }
                if (text === "DESFAVORÁVEL") {
                  return (
                    <span className="signal-badge signal-sell">{children}</span>
                  );
                }

                // Margin percentage styling
                if (text.includes("%")) {
                  const num = parseFloat(text.replace(",", "."));
                  if (!isNaN(num)) {
                    const colorClass =
                      num > 30
                        ? "text-emerald-600"
                        : num > 15
                          ? "text-amber-600"
                          : "text-red-600";
                    return (
                      <strong className={`font-bold ${colorClass}`}>
                        {children}
                      </strong>
                    );
                  }
                }

                // Sports result styling
                if (text.includes("VITÓRIA") || text.includes("VENCEU")) {
                  return (
                    <strong className="font-bold text-emerald-600">
                      {children}
                    </strong>
                  );
                }
                if (text.includes("DERROTA") || text.includes("PERDEU")) {
                  return (
                    <strong className="font-bold text-red-600">{children}</strong>
                  );
                }
                if (text.includes("EMPATE") || text.includes("EMPATOU")) {
                  return (
                    <strong className="font-bold text-amber-600">
                      {children}
                    </strong>
                  );
                }

                return (
                  <strong className="font-semibold text-slate-900">
                    {children}
                  </strong>
                );
              },

              // Tables
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 sm:my-4 -mx-1 sm:-mx-2">
                  <table className="w-full text-sm sm:text-base border-collapse bg-slate-50/50 rounded-lg sm:rounded-xl overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-slate-100">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="p-2 sm:p-3 text-left font-semibold text-slate-700 text-xs sm:text-sm uppercase tracking-wide first:rounded-tl-lg last:rounded-tr-lg">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="p-2 sm:p-3 border-t border-slate-100 text-slate-600 text-sm sm:text-base">
                  {children}
                </td>
              ),

              // Lists
              ul: ({ children }) => (
                <ul className="space-y-1.5 sm:space-y-2 my-3 sm:my-4">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="flex items-start gap-2 text-slate-600 text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 sm:mt-2.5 flex-shrink-0" />
                  <span>{children}</span>
                </li>
              ),

              // Paragraphs
              p: ({ children }) => (
                <p className="text-base sm:text-lg leading-relaxed my-2.5 sm:my-3 text-slate-600">
                  {children}
                </p>
              ),

              // Horizontal rules
              hr: () => <hr className="my-6 sm:my-8 border-slate-200" />,

              // Links
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {briefing.content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500">
          <span>
            Gerado às{" "}
            {new Date(briefing.createdAt).toLocaleTimeString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1 hover:text-slate-700 active:text-slate-900 transition-colors no-print min-h-[44px] min-w-[44px] justify-center"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>
    </article>
  );
}
