// src/db/schema/profiles/index.ts (version pour MIGRATIONS)
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(), // ⬅️ PAS de .references() ici
  displayName: text("display_name"),
  role: text("role").notNull().default("contributor"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
