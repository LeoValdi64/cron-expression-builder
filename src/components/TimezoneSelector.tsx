"use client";

import { TIMEZONES } from "@/lib/cron-utils";
import { Globe } from "lucide-react";

interface TimezoneSelectorProps {
  value: string;
  onChange: (tz: string) => void;
}

export default function TimezoneSelector({
  value,
  onChange,
}: TimezoneSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-input-bg border border-input-border px-3 py-2 text-sm font-mono text-foreground outline-none transition-colors focus:border-accent-blue cursor-pointer max-w-[200px] sm:max-w-none"
      >
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  );
}
