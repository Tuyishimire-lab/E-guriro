/**
 * Neon Serverless Postgres — typed query helper
 * Uses POSTGRES_URL (pooled) for regular queries.
 * Uses DATABASE_URL_UNPOOLED for DDL (schema creation) that needs a direct connection.
 */
import { neon } from '@neondatabase/serverless';

// Pooled connection — use for all regular app queries
export const sql = neon(process.env.POSTGRES_URL!);

// Un-pooled — use only in /api/db/setup schema creation
export const sqlDirect = neon(process.env.DATABASE_URL_UNPOOLED ?? process.env.POSTGRES_URL!);
