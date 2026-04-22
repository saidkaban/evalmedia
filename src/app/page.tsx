"use client";

import { useEffect } from "react";
import { ModelPicker } from "@/components/model-picker";
import { PromptPanel } from "@/components/prompt-panel";
import { ComparisonView } from "@/components/comparison-view";
import { usePlaygroundStore } from "@/store/playground";
import type { ModelInfo } from "@/providers/types";

export default function HomePage() {
  const setModels = usePlaygroundStore((s) => s.setModels);
  const setLoadingModels = usePlaygroundStore((s) => s.setLoadingModels);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingModels(true);
      try {
        const res = await fetch("/api/models?mediaType=image");
        const data = (await res.json()) as { models: ModelInfo[] };
        if (!cancelled) setModels(data.models);
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setModels, setLoadingModels]);

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-[1600px]">
      <aside className="hidden w-80 flex-shrink-0 flex-col border-r border-border md:flex">
        <div className="flex-shrink-0 border-b border-border px-4 py-3">
          <PromptPanel />
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 py-3">
          <ModelPicker />
        </div>
      </aside>
      <section className="min-w-0 flex-1">
        <ComparisonView />
      </section>
    </div>
  );
}
