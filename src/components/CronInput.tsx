"use client";

import { useState, useEffect } from "react";
import { isValidCron, FIELD_COLORS, parseCronExpression } from "@/lib/cron-utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CronInputProps {
  expression: string;
  onChange: (expression: string) => void;
}

export default function CronInput({ expression, onChange }: CronInputProps) {
  const [localValue, setLocalValue] = useState(expression);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setLocalValue(expression);
    setIsValid(isValidCron(expression));
  }, [expression]);

  const handleChange = (val: string) => {
    setLocalValue(val);
    const valid = isValidCron(val);
    setIsValid(valid);
    if (valid) {
      onChange(val);
    }
  };

  const fields = parseCronExpression(expression);
  const fieldEntries = Object.entries(fields) as [string, string][];
  const colorMap: Record<string, string> = {
    minute: FIELD_COLORS.minute,
    hour: FIELD_COLORS.hour,
    dayOfMonth: FIELD_COLORS.dayOfMonth,
    month: FIELD_COLORS.month,
    dayOfWeek: FIELD_COLORS.dayOfWeek,
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="* * * * *"
          spellCheck={false}
          className={`w-full rounded-lg bg-input-bg border px-4 py-3 font-mono text-2xl tracking-widest text-foreground outline-none transition-colors ${
            isValid
              ? "border-input-border focus:border-accent-blue"
              : "border-red-500/50 focus:border-red-500"
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isValid ? (
            <CheckCircle2 className="h-5 w-5 text-accent-green" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Color-coded field labels */}
      <div className="flex justify-between px-1">
        {fieldEntries.map(([key, val]) => (
          <div key={key} className="text-center">
            <span className={`font-mono text-xs font-bold ${colorMap[key]}`}>
              {val}
            </span>
            <div className={`text-[10px] ${colorMap[key]} opacity-60`}>
              {key === "dayOfMonth"
                ? "day"
                : key === "dayOfWeek"
                  ? "wday"
                  : key}
            </div>
          </div>
        ))}
      </div>

      {!isValid && localValue.trim() !== "" && (
        <p className="text-xs text-red-400">
          Invalid cron expression. Use format: minute hour day month weekday
        </p>
      )}
    </div>
  );
}
