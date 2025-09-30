import {
  pgTable,
  bigserial,
  text,
  timestamp,
  bigserial as big,
  uuid,
  PgArray,
  bigint,
} from "drizzle-orm/pg-core";
import { place } from "../place";
import { profiles } from "../profiles";
import { sql } from "drizzle-orm";

export const event = pgTable("event", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  start: timestamp("start", { withTimezone: true }).notNull(),
  end: timestamp("end", { withTimezone: true }).notNull(),
  placeId: bigint("place_id", { mode: "number" }).references(() => place.id, {
    onDelete: "set null",
  }),
  address: text("address"),
  link: text("link"),
  organizer: text("organizer"),
  rrule: text("rrule"),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  status: text("status").notNull().default("published"),
  createdBy: uuid("created_by")
    .references(() => profiles.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
