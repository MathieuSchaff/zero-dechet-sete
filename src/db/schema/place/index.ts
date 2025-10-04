import {
  pgTable,
  bigserial,
  text,
  jsonb,
  timestamp,
  check,
  uuid,
} from "drizzle-orm/pg-core";
import { placeTypeEnum } from "../enums";
import { customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { profiles } from "../profiles";
const geography = customType<{ data: unknown; driverData: unknown }>({
  dataType() {
    // pas de parenthèses ici → Drizzle ne cassera pas le SQL
    return "geography";
  },
});

export const place = pgTable(
  "place",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: text("name").notNull(),
    type: placeTypeEnum("type").notNull(),
    description: text("description"),
    address: text("address"),
    city: text("city"),
    quartier: text("quartier"),
    geo: geography("geo"),
    openingHours: jsonb("opening_hours"),
    accepted: text("accepted").array(),
    refused: text("refused").array(),
    conditions: text("conditions").array(),
    accessibility: text("accessibility").array(),
    contact: jsonb("contact"),
    submittedBy: uuid("submitted_by").references(() => profiles.id),
    requiredCards: text("required_cards").array(),
    photos: jsonb("photos"),
    source: text("source"),
    status: text("status").notNull().default("published"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // impose Point + SRID 4326
    check(
      "geo_is_point_4326",
      sql`
    ST_GeometryType(${t.geo}::geometry) = 'ST_Point'
    AND ST_SRID(${t.geo}::geometry) = 4326
  `
    ),
    // index GIST sur geography
    sql`CREATE INDEX IF NOT EXISTS place_geo_gist ON "place" USING GIST ("geo");`,
  ]
);
