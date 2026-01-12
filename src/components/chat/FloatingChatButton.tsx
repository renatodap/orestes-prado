"use client";

import { cn } from "@/lib/utils";

interface FloatingChatButtonProps {
  onClick: () => void;
  hasMessages?: boolean;
}

/**
 * Floating AI chat button with pulse animation
 * Positioned above the bottom nav, invites interaction
 */
export function FloatingChatButton({
  onClick,
  hasMessages,
}: FloatingChatButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed z-40 flex items-center gap-2 px-4 py-3 rounded-full",
        "bg-gradient-to-r from-slate-900 to-slate-700 text-white",
        "shadow-lg shadow-slate-900/30",
        "active:scale-95 transition-all duration-200",
        "right-4",
        // Position above bottom nav with safe area
        "bottom-[calc(72px+env(safe-area-inset-bottom,0px)+16px)]"
      )}
      aria-label="Abrir assistente de IA"
    >
      {/* Pulse animation ring */}
      <span className="absolute inset-0 rounded-full bg-slate-900 animate-ping opacity-20" />

      {/* Icon */}
      <span className="relative">
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </span>

      {/* Label */}
      <span className="text-sm font-semibold relative">
        {hasMessages ? "Continuar" : "Perguntar"}
      </span>

      {/* Active indicator dot */}
      {hasMessages && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
      )}
    </button>
  );
}
