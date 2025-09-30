import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL!;
export const client = postgres(connectionString, {
  ssl: "require",
  // Supabase Transaction Pooler => pas de prepared statements
  prepare: false,
});
export const db = drizzle({ client });
