import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBriefingHistory } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const briefings = await getBriefingHistory(50);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white text-lg">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">Histórico de Briefings</h1>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {briefings.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border">
            <p className="text-xl text-muted-foreground">
              Nenhum briefing gerado ainda.
            </p>
            <Link
              href="/"
              className="text-primary hover:underline text-lg mt-4 inline-block"
            >
              Gerar primeiro briefing →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {briefings.map((briefing) => {
              const reportDate = new Date(briefing.reportDate);
              const formattedDate = reportDate.toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              // Extract first insight from content
              const firstLine = briefing.content
                .split("\n")
                .find((line) => line.trim().startsWith("1."));
              const preview = firstLine
                ? firstLine.replace(/^1\.\s*\*\*.*?\*\*\s*/, "").slice(0, 150)
                : briefing.content.slice(0, 150);

              return (
                <Link key={briefing.id} href={`/history/${briefing.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg capitalize">
                        {formattedDate}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-base line-clamp-2">
                        {preview}...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
