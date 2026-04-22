"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Check, Loader2, ZoomIn } from "lucide-react";
import { usePlaygroundStore } from "@/store/playground";
import { Button } from "@/components/ui/button";
import { SyncPane, SyncViewportProvider, useSyncViewport } from "@/components/sync-viewport";
import type { OutputItem, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ComparisonView() {
  const session = usePlaygroundStore((s) => s.session);
  const generating = usePlaygroundStore((s) => s.generating);
  const blindMode = usePlaygroundStore((s) => s.blindMode);

  if (!session && !generating) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted">
        <div className="mx-auto max-w-md space-y-2">
          <p className="text-foreground">Pick two or more models, enter a prompt, and generate.</p>
          <p>
            Results appear side by side. Zoom or pan on any image and the others follow,
            so you can compare detail at full resolution.
          </p>
        </div>
      </div>
    );
  }

  if (generating && !session) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted">
        <Loader2 size={16} className="mr-2 animate-spin" />
        Running models in parallel...
      </div>
    );
  }

  return (
    <SyncViewportProvider>
      <ComparisonBody session={session!} blindMode={blindMode} />
    </SyncViewportProvider>
  );
}

function ComparisonBody({
  session,
  blindMode,
}: {
  session: SessionRow;
  blindMode: boolean;
}) {
  const { reset } = useSyncViewport();
  const setSession = usePlaygroundStore((s) => s.setSession);
  const [voting, setVoting] = useState(false);
  const [revealed, setRevealed] = useState(!blindMode);

  useMemo(() => {
    setRevealed(!blindMode);
  }, [blindMode, session.id]);

  async function vote(winnerOutputId: string) {
    setVoting(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, winnerOutputId }),
      });
      const data = (await res.json()) as { session?: SessionRow };
      if (data.session) setSession(data.session);
      setRevealed(true);
    } finally {
      setVoting(false);
    }
  }

  const hasVoted = session.votes.length > 0;
  const myWinner = session.votes[session.votes.length - 1]?.winnerOutputId;
  const count = session.outputs.length;
  const gridClass =
    count <= 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-1 md:grid-cols-2"
        : count === 3
          ? "grid-cols-1 md:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-sm md:px-6">
        <div className="min-w-0 flex-1">
          <div className="truncate">{session.prompt}</div>
          <div className="text-xs text-muted">
            {blindMode && !revealed ? "blind mode" : `${count} models`}
            {session.seed != null && ` · seed ${session.seed}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={reset} title="Reset zoom">
            <ZoomIn size={14} />
            Reset view
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-2 md:p-4">
        <div className={cn("grid h-full gap-2 md:gap-3", gridClass)}>
          {session.outputs.map((output, i) => (
            <OutputPane
              key={output.id}
              output={output}
              index={i}
              blind={blindMode && !revealed}
              canVote={blindMode && !hasVoted}
              isWinner={output.id === myWinner}
              voting={voting}
              onVote={() => vote(output.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const BLIND_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function OutputPane({
  output,
  index,
  blind,
  canVote,
  isWinner,
  voting,
  onVote,
}: {
  output: OutputItem;
  index: number;
  blind: boolean;
  canVote: boolean;
  isWinner: boolean;
  voting: boolean;
  onVote: () => void;
}) {
  const label = blind ? BLIND_LABELS[index] ?? `#${index + 1}` : null;
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5 text-xs">
        <div className="min-w-0 flex-1 truncate">
          {blind ? (
            <span className="font-mono text-sm font-semibold">{label}</span>
          ) : (
            <span title={output.modelId}>{prettyModelName(output.modelId)}</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted">
          {output.latencyMs != null && !blind && (
            <span>{(output.latencyMs / 1000).toFixed(1)}s</span>
          )}
          {isWinner && <Check size={14} className="text-accent" />}
        </div>
      </div>

      <div className="relative flex-1">
        {output.status === "pending" && (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            <Loader2 size={16} className="mr-2 animate-spin" />
            generating
          </div>
        )}
        {output.status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center text-xs text-danger">
            <AlertCircle size={16} />
            <div className="break-words">{output.error ?? "Failed."}</div>
          </div>
        )}
        {output.status === "success" && output.url && (
          <SyncPane src={output.url} alt={blind ? label ?? "" : output.modelId} />
        )}
      </div>

      {canVote && output.status === "success" && (
        <div className="border-t border-border px-3 py-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onVote}
            disabled={voting}
            className="w-full"
          >
            Pick {label}
          </Button>
        </div>
      )}
    </div>
  );
}

function prettyModelName(id: string): string {
  const parts = id.split("/");
  return parts[parts.length - 1].replace(/-/g, " ");
}
