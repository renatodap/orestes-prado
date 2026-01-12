"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./ChatMessage";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { VoiceInput } from "./VoiceInput";
import { useSimpleChat } from "./useSimpleChat";

interface AIChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  briefingContent: string;
  sectionContext?: {
    title: string;
    content: string;
  } | null;
  onClearSection?: () => void;
}

// Maximum messages to keep in context (windowing)
const MAX_MESSAGES = 20;

export function AIChatSheet({
  isOpen,
  onClose,
  briefingContent,
  sectionContext,
  onClearSection,
}: AIChatSheetProps) {
  const [sheetHeight, setSheetHeight] = useState<"peek" | "half" | "full">("half");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const currentTranslateY = useRef<number>(0);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    append,
  } = useSimpleChat({
    api: "/api/chat",
    body: {
      briefingContent,
      sectionContext: sectionContext?.content,
    },
    onFinish: () => {
      scrollToBottom();
    },
  });

  // Apply windowing to keep context manageable
  useEffect(() => {
    if (messages.length > MAX_MESSAGES) {
      const trimmedMessages = messages.slice(-MAX_MESSAGES);
      setMessages(trimmedMessages);
    }
  }, [messages, setMessages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when sheet opens
  useEffect(() => {
    if (isOpen && sheetHeight !== "peek") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, sheetHeight]);

  // Handle suggested question click
  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      append({
        role: "user",
        content: question,
      });
    },
    [append]
  );

  // Handle voice transcript
  const handleVoiceTranscript = useCallback(
    (transcript: string) => {
      append({
        role: "user",
        content: transcript,
      });
    },
    [append]
  );

  // Touch handling for drag
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - dragStartY.current;
    currentTranslateY.current = deltaY;
  };

  const handleTouchEnd = () => {
    const deltaY = currentTranslateY.current;

    if (deltaY > 100) {
      // Swipe down
      if (sheetHeight === "full") {
        setSheetHeight("half");
      } else if (sheetHeight === "half") {
        setSheetHeight("peek");
      } else {
        onClose();
      }
    } else if (deltaY < -100) {
      // Swipe up
      if (sheetHeight === "peek") {
        setSheetHeight("half");
      } else if (sheetHeight === "half") {
        setSheetHeight("full");
      }
    }

    currentTranslateY.current = 0;
  };

  // Handle form submit
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    handleSubmit(e);
    // Expand sheet if in peek mode
    if (sheetHeight === "peek") {
      setSheetHeight("half");
    }
  };

  // Handle Enter key (submit) vs Shift+Enter (newline)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  // Get height class based on sheet state
  const getHeightClass = () => {
    switch (sheetHeight) {
      case "peek":
        return "h-[180px]";
      case "half":
        return "h-[55vh]";
      case "full":
        return "h-[85vh]";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => {
          if (sheetHeight === "peek") {
            onClose();
          } else {
            setSheetHeight("peek");
          }
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 ease-out",
          getHeightClass()
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
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
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Assistente do Briefing
                </h3>
                <p className="text-xs text-slate-500">
                  Pergunte sobre qualquer seção
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Fechar chat"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Section Context Badge */}
          {sectionContext && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500">Perguntando sobre:</span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                {sectionContext.title}
                <button
                  onClick={onClearSection}
                  className="ml-1 text-slate-400 hover:text-slate-600"
                  aria-label="Limpar contexto"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Messages Area */}
        {sheetHeight !== "peek" && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ maxHeight: "calc(100% - 180px)" }}>
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-900 mb-1">
                  Como posso ajudar?
                </h4>
                <p className="text-sm text-slate-500 mb-6">
                  Pergunte sobre qualquer parte do briefing
                </p>

                {/* Suggested Questions */}
                <SuggestedQuestions
                  sectionTitle={sectionContext?.title}
                  onSelect={handleSuggestedQuestion}
                />
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={
                      isLoading &&
                      index === messages.length - 1 &&
                      message.role === "assistant"
                    }
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)" }}>
          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta..."
                className="w-full px-4 py-3 pr-12 rounded-2xl bg-slate-100 border-0 resize-none text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                rows={1}
                style={{ minHeight: "52px", maxHeight: "120px" }}
                disabled={isLoading}
              />
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                disabled={isLoading}
                className="absolute right-2 bottom-2"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "w-[52px] h-[52px] rounded-2xl flex items-center justify-center transition-all duration-200",
                input.trim() && !isLoading
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 active:scale-95"
                  : "bg-slate-200 text-slate-400"
              )}
              aria-label="Enviar mensagem"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
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
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
