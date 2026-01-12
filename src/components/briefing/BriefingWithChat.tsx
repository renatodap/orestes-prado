"use client";

import { useState, useCallback, useMemo } from "react";
import type { Briefing } from "@/lib/db/schema";
import { BriefingCard } from "./BriefingCard";
import { AIChatSheet, FloatingChatButton } from "@/components/chat";

interface BriefingWithChatProps {
  briefing: Briefing;
}

/**
 * Extract section content from briefing markdown
 * Finds the section by title and returns content until next h2
 */
function extractSectionContent(
  briefingContent: string,
  sectionTitle: string
): string {
  // Normalize section title for matching
  const normalizedTitle = sectionTitle.toUpperCase().trim();

  // Split by h2 headers (## )
  const sections = briefingContent.split(/(?=^## )/m);

  for (const section of sections) {
    // Get the section header (first line)
    const headerMatch = section.match(/^## (.+)$/m);
    if (headerMatch) {
      const headerText = headerMatch[1].toUpperCase().trim();

      // Check for match
      if (
        headerText === normalizedTitle ||
        headerText.includes(normalizedTitle) ||
        normalizedTitle.includes(headerText)
      ) {
        return section.trim();
      }
    }
  }

  // If no exact match found, return a portion around the title
  return "";
}

/**
 * Wrapper component that integrates briefing display with AI chat
 */
export function BriefingWithChat({ briefing }: BriefingWithChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasMessages, setHasMessages] = useState(false);
  const [sectionContext, setSectionContext] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // Handle opening chat from section button
  const handleAskAboutSection = useCallback(
    (sectionTitle: string) => {
      const content = extractSectionContent(briefing.content, sectionTitle);
      setSectionContext({
        title: sectionTitle,
        content: content || `Seção: ${sectionTitle}`,
      });
      setIsChatOpen(true);
    },
    [briefing.content]
  );

  // Handle opening chat from floating button
  const handleOpenChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  // Handle closing chat
  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
    // Mark that we have messages for the floating button indicator
    setHasMessages(true);
  }, []);

  // Handle clearing section context
  const handleClearSection = useCallback(() => {
    setSectionContext(null);
  }, []);

  return (
    <>
      {/* Briefing Card with Ask AI buttons */}
      <BriefingCard
        briefing={briefing}
        onAskAboutSection={handleAskAboutSection}
      />

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={handleOpenChat} hasMessages={hasMessages} />

      {/* Chat Sheet */}
      <AIChatSheet
        isOpen={isChatOpen}
        onClose={handleCloseChat}
        briefingContent={briefing.content}
        sectionContext={sectionContext}
        onClearSection={handleClearSection}
      />
    </>
  );
}
