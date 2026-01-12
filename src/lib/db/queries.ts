import { db } from './index';
import { settings, briefings, type Settings, type Briefing, type NewBriefing } from './schema';
import { eq, desc, sql } from 'drizzle-orm';

// Check if configured
export async function isConfigured(): Promise<boolean> {
  const [row] = await db.select().from(settings).limit(1);
  return row?.isConfigured ?? false;
}

// Check if generated today (using Brazil timezone)
export async function hasGeneratedToday(): Promise<boolean> {
  try {
    // Get today's date string in Brazil timezone (YYYY-MM-DD)
    // Brazil is UTC-3, so subtract 3 hours from UTC
    const now = new Date();
    const brazilTime = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const todayBrazil = brazilTime.toISOString().split('T')[0];

    // Check recent briefings and compare date strings
    const recentBriefings = await db
      .select()
      .from(briefings)
      .orderBy(desc(briefings.reportDate))
      .limit(5);

    for (const briefing of recentBriefings) {
      const briefingDate = new Date(briefing.reportDate);
      const briefingDateStr = briefingDate.toISOString().split('T')[0];
      if (briefingDateStr === todayBrazil) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Error checking if generated today:', error);
    // On error, allow generation (fail open)
    return false;
  }
}

// Get latest briefing
export async function getLatestBriefing(): Promise<Briefing | null> {
  const [briefing] = await db
    .select()
    .from(briefings)
    .orderBy(desc(briefings.reportDate))
    .limit(1);
  return briefing || null;
}

// Get briefing history
export async function getBriefingHistory(limit = 30): Promise<Briefing[]> {
  return db
    .select()
    .from(briefings)
    .orderBy(desc(briefings.reportDate))
    .limit(limit);
}

// Get briefing by ID
export async function getBriefingById(id: number): Promise<Briefing | null> {
  const [briefing] = await db
    .select()
    .from(briefings)
    .where(eq(briefings.id, id))
    .limit(1);
  return briefing || null;
}

// Save briefing
export async function saveBriefing(data: NewBriefing): Promise<Briefing> {
  const [briefing] = await db.insert(briefings).values(data).returning();
  return briefing;
}

// Get settings
export async function getSettings(): Promise<Settings | null> {
  const [row] = await db.select().from(settings).limit(1);
  return row || null;
}

// Save settings (upsert)
export async function saveSettings(data: Partial<Settings>): Promise<Settings> {
  const existing = await getSettings();

  if (existing) {
    const [updated] = await db
      .update(settings)
      .set({
        ...data,
        updatedAt: new Date(),
        isConfigured: data.costBasis ? true : existing.isConfigured,
      })
      .where(eq(settings.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db.insert(settings).values({
    ...data,
    isConfigured: !!data.costBasis,
  }).returning();
  return created;
}
