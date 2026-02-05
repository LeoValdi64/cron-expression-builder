"use client";

import { useState } from "react";
import {
  CronFields,
  FIELD_COLORS,
  FIELD_BG_COLORS,
  FIELD_LABELS,
  FIELD_RANGES,
  MONTH_NAMES,
  WEEKDAY_NAMES,
} from "@/lib/cron-utils";
import { ChevronDown, ChevronUp } from "lucide-react";

type FieldMode = "wildcard" | "specific" | "range" | "interval";

interface CronFieldColumnProps {
  field: keyof CronFields;
  value: string;
  onChange: (value: string) => void;
}

function parseFieldMode(value: string): FieldMode {
  if (value === "*") return "wildcard";
  if (value.includes("/")) return "interval";
  if (value.includes("-") && !value.includes(",")) return "range";
  return "specific";
}

function getLabel(field: keyof CronFields, num: number): string {
  if (field === "month") return MONTH_NAMES[num - 1] || String(num);
  if (field === "dayOfWeek") return WEEKDAY_NAMES[num] || String(num);
  return String(num);
}

export default function CronFieldColumn({
  field,
  value,
  onChange,
}: CronFieldColumnProps) {
  const [expanded, setExpanded] = useState(false);
  const mode = parseFieldMode(value);
  const range = FIELD_RANGES[field];
  const colorClass = FIELD_COLORS[field];
  const bgClass = FIELD_BG_COLORS[field];

  const handleModeChange = (newMode: FieldMode) => {
    switch (newMode) {
      case "wildcard":
        onChange("*");
        break;
      case "specific":
        onChange(String(range.min));
        break;
      case "range":
        onChange(`${range.min}-${range.max}`);
        break;
      case "interval":
        onChange(`*/${field === "minute" ? "5" : "1"}`);
        break;
    }
  };

  const handleSpecificToggle = (num: number) => {
    const current = mode === "specific" ? value.split(",").map(Number) : [];
    const idx = current.indexOf(num);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(num);
    }
    current.sort((a, b) => a - b);
    if (current.length === 0) {
      onChange("*");
    } else {
      onChange(current.join(","));
    }
  };

  const handleRangeChange = (part: "start" | "end", val: number) => {
    const parts = value.includes("-") ? value.split("-").map(Number) : [range.min, range.max];
    if (part === "start") {
      onChange(`${val}-${parts[1]}`);
    } else {
      onChange(`${parts[0]}-${val}`);
    }
  };

  const handleIntervalChange = (val: number) => {
    const base = value.includes("/") ? value.split("/")[0] : "*";
    onChange(`${base}/${val}`);
  };

  const rangeParts = mode === "range" ? value.split("-").map(Number) : [range.min, range.max];
  const intervalVal = mode === "interval" ? parseInt(value.split("/")[1]) || 1 : 1;
  const selectedValues =
    mode === "specific" ? new Set(value.split(",").map(Number)) : new Set<number>();

  return (
    <div className={`rounded-lg border p-3 ${bgClass}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div>
          <span className={`text-xs font-medium uppercase tracking-wider ${colorClass}`}>
            {FIELD_LABELS[field]}
          </span>
          <div className={`font-mono text-lg font-bold ${colorClass}`}>{value}</div>
        </div>
        {expanded ? (
          <ChevronUp className={`h-4 w-4 ${colorClass}`} />
        ) : (
          <ChevronDown className={`h-4 w-4 ${colorClass}`} />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Mode selector */}
          <div className="flex flex-wrap gap-1">
            {(["wildcard", "specific", "range", "interval"] as FieldMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                  mode === m
                    ? `bg-white/10 ${colorClass}`
                    : "text-muted hover:text-foreground"
                }`}
              >
                {m === "wildcard" ? "Any (*)" : m === "specific" ? "Values" : m === "range" ? "Range" : "Every /n"}
              </button>
            ))}
          </div>

          {/* Mode-specific controls */}
          {mode === "specific" && (
            <div className="grid grid-cols-5 gap-1 sm:grid-cols-6">
              {Array.from({ length: range.max - range.min + 1 }, (_, i) => {
                const num = range.min + i;
                const isSelected = selectedValues.has(num);
                return (
                  <button
                    key={num}
                    onClick={() => handleSpecificToggle(num)}
                    className={`rounded px-1 py-1 text-xs font-mono transition-colors ${
                      isSelected
                        ? `bg-white/20 ${colorClass} font-bold`
                        : "text-muted hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    {getLabel(field, num)}
                  </button>
                );
              })}
            </div>
          )}

          {mode === "range" && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted">From</label>
              <select
                value={rangeParts[0]}
                onChange={(e) => handleRangeChange("start", parseInt(e.target.value))}
                className="rounded bg-input-bg border border-input-border px-2 py-1 text-xs font-mono text-foreground"
              >
                {Array.from({ length: range.max - range.min + 1 }, (_, i) => (
                  <option key={i} value={range.min + i}>
                    {getLabel(field, range.min + i)}
                  </option>
                ))}
              </select>
              <label className="text-xs text-muted">To</label>
              <select
                value={rangeParts[1]}
                onChange={(e) => handleRangeChange("end", parseInt(e.target.value))}
                className="rounded bg-input-bg border border-input-border px-2 py-1 text-xs font-mono text-foreground"
              >
                {Array.from({ length: range.max - range.min + 1 }, (_, i) => (
                  <option key={i} value={range.min + i}>
                    {getLabel(field, range.min + i)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {mode === "interval" && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted">Every</label>
              <input
                type="number"
                min={1}
                max={range.max}
                value={intervalVal}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value) || 1)}
                className="w-16 rounded bg-input-bg border border-input-border px-2 py-1 text-xs font-mono text-foreground"
              />
              <span className="text-xs text-muted">{FIELD_LABELS[field].toLowerCase()}(s)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
