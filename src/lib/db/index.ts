import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Create database connection (lazy initialization for build time)
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  return url;
};

// Lazy initialization to avoid errors during build
let _db: ReturnType<typeof drizzle> | null = null;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!_db) {
      const sql = neon(getDatabaseUrl());
      _db = drizzle(sql, { schema });
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
