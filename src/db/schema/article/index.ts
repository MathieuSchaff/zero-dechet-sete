import {
  pgTable,
  bigserial,
  text,
  jsonb,
  uuid,
  timestamp,
  varchar,
  json,
  integer,
  bigint,
} from "drizzle-orm/pg-core";
import { articleStatusEnum } from "../enums";
import { profiles } from "../profiles";
import { sql } from "drizzle-orm";

export const article = pgTable("article", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary"),
  contentJson: jsonb("content_json"), // Tiptap JSON
  contentHtml: text("content_html"), // SEO/SSR (optionnel)
  authorId: uuid("author_id").references(() => profiles.id, {
    onDelete: "set null",
  }),
  status: articleStatusEnum("status").notNull().default("draft"),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const articleRevision = pgTable("article_revision", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  articleId: bigint("article_id", { mode: "number" })
    .references(() => article.id, { onDelete: "cascade" })
    .notNull(),
  snapshot: jsonb("snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by")
    .references(() => profiles.id)
    .notNull(),
});
