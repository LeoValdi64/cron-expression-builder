"use client";

import { useEffect, useState } from "react";
import {
  getNextExecutions,
  formatRelativeTime,
  formatDateTime,
  isValidCron,
} from "@/lib/cron-utils";
import { Clock } from "lucide-react";

interface NextExecutionsProps {
  expression: string;
  timezone: string;
}

export default function NextExecutions({
  expression,
  timezone,
}: NextExecutionsProps) {
  const [executions, setExecutions] = useState<Date[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (isValidCron(expression)) {
      setExecutions(getNextExecutions(expression, 10, timezone));
    } else {
      setExecutions([]);
    }
  }, [expression, timezone]);

  // Refresh relative times every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  if (executions.length === 0) {
    return (
      <div className="rounded-lg border border-card-border bg-card-bg p-4">
        <h2 className="mb-3 text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Next Executions
        </h2>
        <p className="text-sm text-muted">
          Enter a valid cron expression to see next execution times.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <h2 className="mb-3 text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Next 10 Executions
      </h2>
      <div className="space-y-1">
        {executions.map((date, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-muted font-mono text-xs w-5">
                {i + 1}.
              </span>
              <span className="font-mono text-foreground">
                {formatDateTime(date, timezone)}
              </span>
            </div>
            <span className="text-xs text-accent-blue whitespace-nowrap">
              {formatRelativeTime(date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
