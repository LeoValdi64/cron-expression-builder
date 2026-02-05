"use client";

import { useState, useEffect } from "react";
import {
  getRecentExpressions,
  clearRecentExpressions,
  toHumanReadable,
} from "@/lib/cron-utils";
import { History, Trash2 } from "lucide-react";

interface RecentExpressionsProps {
  onSelect: (expression: string) => void;
  refreshKey: number;
}

export default function RecentExpressions({
  onSelect,
  refreshKey,
}: RecentExpressionsProps) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    setRecent(getRecentExpressions());
  }, [refreshKey]);

  const handleClear = () => {
    clearRecentExpressions();
    setRecent([]);
  };

  if (recent.length === 0) return null;

  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
          <History className="h-4 w-4" />
          Recent
        </h2>
        <button
          onClick={handleClear}
          className="text-xs text-muted hover:text-red-400 transition-colors flex items-center gap-1"
          title="Clear recent expressions"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>
      <div className="space-y-1">
        {recent.map((expr, i) => (
          <button
            key={`${expr}-${i}`}
            onClick={() => onSelect(expr)}
            className="flex w-full items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-white/5 transition-colors group"
          >
            <span className="font-mono text-foreground">{expr}</span>
            <span className="text-xs text-muted group-hover:text-foreground truncate ml-3 max-w-[200px]">
              {toHumanReadable(expr)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
