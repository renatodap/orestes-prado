"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card className="shadow-lg overflow-hidden">
      <CardHeader className="bg-primary text-white rounded-t-xl">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-white">Briefing Diário</CardTitle>
            <p className="text-white/80 mt-1 capitalize">{formattedDate}</p>
          </div>
          <Badge variant="secondary" className="text-sm bg-white/20 text-white border-0">
            {briefing.modelId.split("/").pop()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="prose prose-lg max-w-none prose-headings:text-primary prose-headings:font-bold prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4 prose-table:text-base prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border prose-strong:text-primary">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-xl font-bold text-primary mt-6 mb-4 pb-2 border-b border-border">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-primary mt-4 mb-2">
                  {children}
                </h3>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-primary">{children}</strong>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border-collapse border border-border text-base">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="bg-muted p-3 text-left font-semibold border border-border">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="p-3 border border-border">{children}</td>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 space-y-2 my-4">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-6 space-y-2 my-4">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="text-lg leading-relaxed">{children}</li>
              ),
              p: ({ children }) => (
                <p className="text-lg leading-relaxed my-3">{children}</p>
              ),
              hr: () => <hr className="my-6 border-border" />,
            }}
          >
            {briefing.content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
