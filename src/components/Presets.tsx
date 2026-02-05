"use client";

import { PRESETS } from "@/lib/cron-utils";
import { Zap } from "lucide-react";

interface PresetsProps {
  currentExpression: string;
  onSelect: (expression: string) => void;
}

export default function Presets({ currentExpression, onSelect }: PresetsProps) {
  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <h2 className="mb-3 text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
        <Zap className="h-4 w-4" />
        Common Presets
      </h2>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const isActive = currentExpression === preset.expression;
          return (
            <button
              key={preset.expression}
              onClick={() => onSelect(preset.expression)}
              title={`${preset.expression} — ${preset.description}`}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-accent-blue/50 bg-accent-blue/10 text-accent-blue"
                  : "border-card-border bg-card-bg text-muted hover:border-input-border hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
