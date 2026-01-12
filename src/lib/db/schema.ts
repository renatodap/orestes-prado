import { pgTable, serial, text, timestamp, real, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';

// Settings (single row for single user)
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  costBasis: real('cost_basis'),                    // R$/saca - REQUIRED
  logisticsCost: real('logistics_cost').default(80),
  taxRate: real('tax_rate').default(0.05),
  isConfigured: boolean('is_configured').default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Briefings history
export const briefings = pgTable('briefings', {
  id: serial('id').primaryKey(),

  // Content
  title: text('title').notNull(),
  content: text('content').notNull(),           // Full markdown content
  summary: text('summary'),                      // Short summary

  // Structured sections (for rendering)
  topTakeaways: jsonb('top_takeaways'),          // Array of insights
  actionableSignals: jsonb('actionable_signals'), // Trade recommendations
  farmMetrics: jsonb('farm_metrics'),            // Margin calculations

  // Metadata
  reportDate: timestamp('report_date', { mode: 'date' }).notNull(),

  // AI generation info
  modelId: text('model_id').notNull(),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_briefings_date').on(table.reportDate.desc()),
]);

// Types
export type Settings = typeof settings.$inferSelect;
export type Briefing = typeof briefings.$inferSelect;
export type NewBriefing = typeof briefings.$inferInsert;
