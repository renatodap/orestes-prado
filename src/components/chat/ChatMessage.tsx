"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage as ChatMessageType } from "./useSimpleChat";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 animate-fadeIn",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold",
          isUser
            ? "bg-slate-900 text-white"
            : "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700"
        )}
      >
        {isUser ? "O" : "AI"}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-slate-900 text-white rounded-tr-sm"
            : "bg-slate-100 text-slate-900 rounded-tl-sm"
        )}
      >
        {isUser ? (
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="text-base leading-relaxed mb-2 last:mb-0 text-slate-700">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">
                    {children}
                  </strong>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-1 my-2 ml-0 list-none">{children}</ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-slate-700 text-base">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>

            {/* Streaming cursor */}
            {isStreaming && (
              <span className="inline-block w-2 h-5 bg-slate-400 ml-0.5 animate-pulse rounded-sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
