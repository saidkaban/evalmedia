import "server-only";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, outputs, votes } from "@/db/schema";
import type { SessionRow, OutputItem, VoteRow } from "@/lib/types";

function mapOutput(row: typeof outputs.$inferSelect): OutputItem {
  return {
    id: row.id,
    modelId: row.modelId,
    providerId: row.providerId,
    status: row.status,
    url: row.url ?? undefined,
    width: row.width ?? undefined,
    height: row.height ?? undefined,
    seed: row.seed ?? undefined,
    latencyMs: row.latencyMs ?? undefined,
    error: row.error ?? undefined,
  };
}

export function createSession(args: {
  id: string;
  prompt: string;
  seed: number | null;
  createdAt: string;
}) {
  db.insert(sessions)
    .values({
      id: args.id,
      mediaType: "image",
      prompt: args.prompt,
      seed: args.seed,
      createdAt: args.createdAt,
    })
    .run();
}

export function insertOutput(row: typeof outputs.$inferInsert) {
  db.insert(outputs).values(row).run();
}

export function insertVote(row: typeof votes.$inferInsert) {
  db.insert(votes).values(row).run();
}

export function getSession(id: string): SessionRow | null {
  const session = db
    .select()
    .from(sessions)
    .where(eq(sessions.id, id))
    .get();
  if (!session) return null;

  const outputRows = db
    .select()
    .from(outputs)
    .where(eq(outputs.sessionId, id))
    .all();

  const voteRows = db
    .select()
    .from(votes)
    .where(eq(votes.sessionId, id))
    .all();

  return {
    id: session.id,
    mediaType: session.mediaType,
    prompt: session.prompt,
    seed: session.seed,
    createdAt: session.createdAt,
    outputs: outputRows.map(mapOutput),
    votes: voteRows.map(
      (v): VoteRow => ({
        id: v.id,
        sessionId: v.sessionId,
        winnerOutputId: v.winnerOutputId,
        createdAt: v.createdAt,
      }),
    ),
  };
}

export function listSessions(limit = 50): SessionRow[] {
  const rows = db
    .select()
    .from(sessions)
    .orderBy(desc(sessions.createdAt))
    .limit(limit)
    .all();
  return rows.map((s) => {
    const o = db.select().from(outputs).where(eq(outputs.sessionId, s.id)).all();
    const v = db.select().from(votes).where(eq(votes.sessionId, s.id)).all();
    return {
      id: s.id,
      mediaType: s.mediaType,
      prompt: s.prompt,
      seed: s.seed,
      createdAt: s.createdAt,
      outputs: o.map(mapOutput),
      votes: v.map(
        (r): VoteRow => ({
          id: r.id,
          sessionId: r.sessionId,
          winnerOutputId: r.winnerOutputId,
          createdAt: r.createdAt,
        }),
      ),
    };
  });
}

export type ModelVoteTally = {
  providerId: string;
  modelId: string;
  wins: number;
};

export function getModelVoteTallies(): ModelVoteTally[] {
  const rows = db
    .select({
      providerId: outputs.providerId,
      modelId: outputs.modelId,
      wins: sql<number>`count(${votes.id})`.as("wins"),
    })
    .from(outputs)
    .innerJoin(votes, eq(votes.winnerOutputId, outputs.id))
    .groupBy(outputs.providerId, outputs.modelId)
    .all();
  return rows.map((r) => ({
    providerId: r.providerId,
    modelId: r.modelId,
    wins: Number(r.wins),
  }));
}

export function updateOutputResult(
  id: string,
  patch: Partial<typeof outputs.$inferInsert>,
) {
  db.update(outputs).set(patch).where(eq(outputs.id, id)).run();
}
