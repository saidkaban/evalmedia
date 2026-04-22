import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * A comparison session captures a single side-by-side run: one prompt,
 * N model outputs, optional votes. The schema is media-type aware from
 * day one so video and audio sessions can share the same table later.
 */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  mediaType: text("media_type", { enum: ["image", "video", "audio"] })
    .notNull()
    .default("image"),
  prompt: text("prompt").notNull(),
  seed: integer("seed"),
  createdAt: text("created_at").notNull(),
});

export const outputs = sqliteTable("outputs", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull(),
  modelId: text("model_id").notNull(),
  status: text("status", { enum: ["pending", "success", "error"] }).notNull(),
  url: text("url"),
  width: integer("width"),
  height: integer("height"),
  seed: integer("seed"),
  latencyMs: integer("latency_ms"),
  error: text("error"),
  createdAt: text("created_at").notNull(),
});

export const votes = sqliteTable("votes", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  winnerOutputId: text("winner_output_id")
    .notNull()
    .references(() => outputs.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
});

export type SessionInsert = typeof sessions.$inferInsert;
export type OutputInsert = typeof outputs.$inferInsert;
export type VoteInsert = typeof votes.$inferInsert;
export type SessionSelect = typeof sessions.$inferSelect;
export type OutputSelect = typeof outputs.$inferSelect;
export type VoteSelect = typeof votes.$inferSelect;
