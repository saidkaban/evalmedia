"use client";

import { useMemo } from "react";
import { X } from "lucide-react";
import { usePlaygroundStore, modelKey } from "@/store/playground";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export function ModelPicker() {
  const models = usePlaygroundStore((s) => s.models);
  const loading = usePlaygroundStore((s) => s.loadingModels);
  const selectedKeys = usePlaygroundStore((s) => s.selectedKeys);
  const toggleModel = usePlaygroundStore((s) => s.toggleModel);

  const byProvider = useMemo(() => {
    const map = new Map<string, typeof models>();
    for (const m of models) {
      const list = map.get(m.providerId) ?? [];
      list.push(m);
      map.set(m.providerId, list);
    }
    return Array.from(map.entries());
  }, [models]);

  const selectedModels = useMemo(
    () =>
      selectedKeys
        .map((k) => models.find((m) => modelKey(m) === k))
        .filter((m): m is (typeof models)[number] => Boolean(m)),
    [selectedKeys, models],
  );

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-surface-hover" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedModels.length > 0 && (
        <div className="sticky -top-3 z-10 -mx-3 -mt-3 border-b border-border bg-background/95 px-3 pb-3 pt-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted">
              Selected ({selectedModels.length})
            </span>
            <button
              type="button"
              onClick={() => {
                for (const m of selectedModels) toggleModel(modelKey(m));
              }}
              className="text-xs text-muted hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {selectedModels.map((m) => {
              const key = modelKey(m);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggleModel(key)}
                    title={`Remove ${m.name}`}
                    className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-surface py-0.5 pl-2 pr-1 text-xs hover:bg-surface-hover"
                  >
                    <span className="truncate">{m.name}</span>
                    <X size={12} className="flex-shrink-0 text-muted" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {byProvider.map(([providerId, providerModels]) => (
        <div key={providerId}>
          <div className="mb-2 text-xs uppercase tracking-wide text-muted">
            {providerId}
          </div>
          <ul className="space-y-1">
            {providerModels.map((m) => {
              const key = modelKey(m);
              const checked = selectedKeys.includes(key);
              return (
                <li key={key}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-start gap-2.5 rounded-md border border-transparent px-2.5 py-2 hover:border-border hover:bg-surface-hover",
                      checked && "border-border bg-surface-hover",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={() => toggleModel(key)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{m.name}</div>
                      {m.description && (
                        <div className="text-xs text-muted truncate">
                          {m.description}
                        </div>
                      )}
                      <div className="mt-0.5 font-mono text-[10px] text-muted truncate">
                        {m.id}
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
