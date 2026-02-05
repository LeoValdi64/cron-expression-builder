"use client";

import { useMemo, useState } from "react";
import { getExecutionDaysInMonth, isValidCron, MONTH_NAMES } from "@/lib/cron-utils";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarViewProps {
  expression: string;
  timezone: string;
}

const WEEKDAY_HEADERS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarView({
  expression,
  timezone,
}: CalendarViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const executionDays = useMemo(() => {
    if (!isValidCron(expression)) return new Set<number>();
    return getExecutionDaysInMonth(expression, year, month, timezone);
  }, [expression, year, month, timezone]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();
  const isCurrentMonth =
    now.getFullYear() === year && now.getMonth() === month;

  const navigateMonth = (dir: -1 | 1) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const goToToday = () => {
    setMonth(now.getMonth());
    setYear(now.getFullYear());
  };

  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Calendar
        </h2>
        {!isCurrentMonth && (
          <button
            onClick={goToToday}
            className="text-xs text-accent-blue hover:underline"
          >
            Today
          </button>
        )}
      </div>

      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => navigateMonth(-1)}
          className="rounded p-1 text-muted hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={() => navigateMonth(1)}
          className="rounded p-1 text-muted hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_HEADERS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfMonth }, (_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const isExecution = executionDays.has(day);
          const isToday = isCurrentMonth && day === today;

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center text-xs font-mono rounded-sm transition-colors ${
                isExecution
                  ? "bg-accent-blue/20 text-accent-blue font-bold"
                  : "text-muted"
              } ${isToday ? "ring-1 ring-accent-green" : ""}`}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-[10px] text-muted">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-accent-blue/20" />
          <span>Execution day</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm ring-1 ring-accent-green" />
          <span>Today</span>
        </div>
        <div className="ml-auto">
          {executionDays.size}/{daysInMonth} days
        </div>
      </div>
    </div>
  );
}
