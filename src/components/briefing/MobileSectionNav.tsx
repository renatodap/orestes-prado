"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export interface Section {
  id: string;
  title: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

interface MobileSectionNavProps {
  sections: Section[];
}

export function MobileSectionNav({ sections }: MobileSectionNavProps) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Track scroll position to show/hide the nav
  useEffect(() => {
    const handleScroll = () => {
      // Show nav after scrolling past 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set up intersection observer to track current section
  useEffect(() => {
    if (sections.length === 0) return;

    // Disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the most visible section
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);

      if (visibleEntries.length > 0) {
        // Get the one closest to the top
        const topEntry = visibleEntries.reduce((closest, entry) => {
          const closestTop = closest.boundingClientRect.top;
          const entryTop = entry.boundingClientRect.top;
          return Math.abs(entryTop) < Math.abs(closestTop) ? entry : closest;
        });

        setActiveSection(topEntry.target.id);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    // Observe all sections
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  // Close sheet when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setIsOpen(false);
    }
  }, []);

  const currentSection = sections.find((s) => s.id === activeSection);
  const currentIndex = sections.findIndex((s) => s.id === activeSection);
  const progress = sections.length > 0 ? ((currentIndex + 1) / sections.length) * 100 : 0;

  // Don't render on desktop or if no sections
  if (sections.length === 0) return null;

  return (
    <>
      {/* Floating pill button - mobile only */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "sm:hidden fixed z-40 right-4 transition-all duration-300 ease-out",
          "bg-slate-900/95 backdrop-blur-lg text-white rounded-full",
          "shadow-lg shadow-slate-900/30 border border-white/10",
          "flex items-center gap-2 px-3 py-2",
          "active:scale-95 touch-manipulation",
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{
          /* Position above BottomNav: nav height (56px) + safe area + margin (12px) */
          bottom: "calc(56px + env(safe-area-inset-bottom, 0px) + 12px)",
        }}
        aria-label="Navigate to section"
      >
        {currentSection && (
          <>
            <span className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-sm",
              currentSection.bgColor
            )}>
              {currentSection.icon}
            </span>
            <span className="text-xs font-medium max-w-[100px] truncate">
              {currentSection.title}
            </span>
          </>
        )}
        {!currentSection && (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs font-medium">Navegar</span>
          </>
        )}
        {/* Progress indicator */}
        <div className="w-px h-4 bg-white/20 mx-1" />
        <span className="text-[10px] text-slate-400 font-medium tabular-nums">
          {currentIndex + 1}/{sections.length}
        </span>
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          "sm:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        ref={sheetRef}
        className={cn(
          "sm:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl",
          "transform transition-transform duration-300 ease-out",
          "max-h-[70vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        role="dialog"
        aria-modal="true"
        aria-label="Section navigation"
      >
        {/* Handle bar */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Navegar para</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Fechar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Section list */}
        <div className="flex-1 overflow-y-auto overscroll-contain py-2">
          <div className="px-3">
            {sections.map((section, index) => {
              const isActive = section.id === activeSection;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150",
                    "text-left touch-manipulation active:scale-[0.98]",
                    isActive
                      ? "bg-slate-100"
                      : "hover:bg-slate-50 active:bg-slate-100"
                  )}
                >
                  <span className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0",
                    section.bgColor
                  )}>
                    {section.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className={cn(
                      "block text-sm font-medium truncate",
                      isActive ? "text-slate-900" : "text-slate-700"
                    )}>
                      {section.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {index + 1} de {sections.length}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-slate-900 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick actions footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex gap-2">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
              setIsOpen(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 active:bg-slate-200 transition-colors touch-manipulation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Topo
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
              setIsOpen(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 rounded-xl text-sm font-medium text-slate-700 active:bg-slate-200 transition-colors touch-manipulation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            Fontes
          </button>
        </div>
      </div>
    </>
  );
}
