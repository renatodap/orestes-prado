"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

interface UseChatOptions {
  api: string;
  body?: Record<string, unknown>;
  onFinish?: () => void;
}

interface UseChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  append: (message: { role: "user" | "assistant"; content: string }) => void;
  setMessages: (messages: ChatMessage[]) => void;
}

/**
 * Simple chat hook that handles streaming text responses
 */
export function useSimpleChat({
  api,
  body = {},
  onFinish,
}: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const append = useCallback(
    async (message: { role: "user" | "assistant"; content: string }) => {
      const newMessage: ChatMessage = {
        id: generateId(),
        role: message.role,
        content: message.content,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);

      if (message.role === "user") {
        // Send to API and stream response
        setIsLoading(true);

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: "",
          createdAt: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        try {
          abortControllerRef.current = new AbortController();

          const allMessages = [...messages, newMessage];

          const response = await fetch(api, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: allMessages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              ...body,
            }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            throw new Error("Failed to send message");
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulatedContent = "";

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // toTextStreamResponse returns plain text chunks
              const chunk = decoder.decode(value, { stream: true });
              accumulatedContent += chunk;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: accumulatedContent }
                    : m
                )
              );
            }
          }

          onFinish?.();
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            console.error("Chat error:", error);
            // Remove the empty assistant message on error
            setMessages((prev) =>
              prev.filter((m) => m.id !== assistantMessage.id)
            );
          }
        } finally {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    },
    [api, body, messages, onFinish]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      append({ role: "user", content: input.trim() });
      setInput("");
    },
    [input, isLoading, append]
  );

  return {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    setMessages,
  };
}
