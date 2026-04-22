"use client";

import { useEffect } from "react";
import { Loader2, Play, RefreshCw } from "lucide-react";
import { usePlaygroundStore, modelKey } from "@/store/playground";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { SessionRow } from "@/lib/types";
import type { ModelInfo } from "@/providers/types";

export function PromptPanel() {
  const prompt = usePlaygroundStore((s) => s.prompt);
  const setPrompt = usePlaygroundStore((s) => s.setPrompt);
  const seed = usePlaygroundStore((s) => s.seed);
  const setSeed = usePlaygroundStore((s) => s.setSeed);
  const blindMode = usePlaygroundStore((s) => s.blindMode);
  const setBlindMode = usePlaygroundStore((s) => s.setBlindMode);
  const generating = usePlaygroundStore((s) => s.generating);
  const setGenerating = usePlaygroundStore((s) => s.setGenerating);
  const setSession = usePlaygroundStore((s) => s.setSession);
  const selectedKeys = usePlaygroundStore((s) => s.selectedKeys);
  const models = usePlaygroundStore((s) => s.models);
  const error = usePlaygroundStore((s) => s.error);
  const setError = usePlaygroundStore((s) => s.setError);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(t);
  }, [error, setError]);

  const selections = selectedKeys
    .map((k): ModelInfo | undefined =>
      models.find((m) => modelKey(m) === k),
    )
    .filter((m): m is ModelInfo => Boolean(m));

  async function runGeneration(nextSeed?: number) {
    if (!prompt.trim()) {
      setError("Enter a prompt first.");
      return;
    }
    if (selections.length < 2) {
      setError("Pick at least two models to compare.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          seed: nextSeed ?? seed ?? undefined,
          selections: selections.map((m) => ({
            providerId: m.providerId,
            modelId: m.id,
          })),
        }),
      });
      const data = (await res.json()) as {
        session?: SessionRow;
        error?: string;
      };
      if (!res.ok || !data.session) {
        throw new Error(data.error ?? "Generation failed.");
      }
      setSession(data.session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  function rerollSeed() {
    const next = Math.floor(Math.random() * 1_000_000_000);
    setSeed(next);
    runGeneration(next);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate..."
          rows={4}
          className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-muted">
            Seed
          </label>
          <input
            type="number"
            value={seed ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              setSeed(v === "" ? null : Number(v));
            }}
            placeholder="random"
            className="h-9 w-full rounded-md border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          />
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={rerollSeed}
          disabled={generating}
          className="mt-5"
          title="Re-run with a random seed"
        >
          <RefreshCw size={14} />
          Reroll
        </Button>
      </div>

      <Toggle
        checked={blindMode}
        onChange={setBlindMode}
        label="Blind A/B mode"
        hint="Hide model names. Vote first, reveal after."
      />

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted">
          {selections.length} of {models.length} selected
        </span>
        <Button
          onClick={() => runGeneration()}
          disabled={generating || selections.length < 2 || !prompt.trim()}
        >
          {generating ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
          {generating ? "Generating" : "Generate"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      )}
    </div>
  );
}
