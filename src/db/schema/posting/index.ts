import {
  pgTable,
  bigserial,
  text,
  jsonb,
  uuid,
  timestamp,
  bigint,
} from "drizzle-orm/pg-core";
import { postTypeEnum } from "../enums";
import { profiles } from "../profiles";

export const post = pgTable("post", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  type: postTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  condition: text("condition"),
  images: jsonb("images"), // [{path,...}]
  locationHint: text("location_hint"),
  authorId: uuid("author_id").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  status: text("status").notNull().default("active"), // 'active','given','removed'
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const message = pgTable("message", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  postId: bigint("post_id", { mode: "number" }).references(() => post.id, {
    onDelete: "cascade",
  }),
  fromUser: uuid("from_user").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  toUser: uuid("to_user").references(() => profiles.id, {
    onDelete: "cascade",
  }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

export const report = pgTable("report", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: bigint("entity_id", { mode: "number" }).notNull(),
  reason: text("reason").notNull(),
  reporterId: uuid("reporter_id").references(() => profiles.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  resolvedBy: uuid("resolved_by").references(() => profiles.id),
  resolution: text("resolution"),
});
