"use client";

import { useMemo } from "react";
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
