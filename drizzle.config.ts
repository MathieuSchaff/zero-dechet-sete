import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });
if (!process.env.DATABASE_URL) dotenv.config();

export default defineConfig({
  // schema: "./src/db/**/index.ts",
  schema: "./src/db/schema/migrations.ts", // ⬅️ important
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
});
