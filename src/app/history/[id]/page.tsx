import Link from "next/link";
import { notFound } from "next/navigation";
import { BriefingCard } from "@/components/briefing/BriefingCard";
import { getBriefingById } from "@/lib/db/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BriefingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const briefingId = parseInt(id, 10);

  if (isNaN(briefingId)) {
    notFound();
  }

  const briefing = await getBriefingById(briefingId);

  if (!briefing) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/history" className="text-white/80 hover:text-white text-lg">
            ← Voltar ao Histórico
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <BriefingCard briefing={briefing} />
      </div>
    </main>
  );
}
