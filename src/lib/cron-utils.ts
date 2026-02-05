import CronExpressionParser from "cron-parser";

export const TIMEZONES: { label: string; value: string }[] = [
  { label: "UTC", value: "UTC" },
  { label: "ET (New York)", value: "America/New_York" },
  { label: "CT (Chicago)", value: "America/Chicago" },
  { label: "MT (Denver)", value: "America/Denver" },
  { label: "PT (Los Angeles)", value: "America/Los_Angeles" },
  { label: "London", value: "Europe/London" },
  { label: "Berlin", value: "Europe/Berlin" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Shanghai", value: "Asia/Shanghai" },
];

export interface CronFields {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface Preset {
  label: string;
  expression: string;
  description: string;
}

export const PRESETS: Preset[] = [
  { label: "Every minute", expression: "* * * * *", description: "Runs every minute" },
  { label: "Every 5 minutes", expression: "*/5 * * * *", description: "Runs every 5 minutes" },
  { label: "Every 15 minutes", expression: "*/15 * * * *", description: "Runs every 15 minutes" },
  { label: "Every 30 minutes", expression: "*/30 * * * *", description: "Runs every 30 minutes" },
  { label: "Every hour", expression: "0 * * * *", description: "At minute 0 of every hour" },
  { label: "Daily at midnight", expression: "0 0 * * *", description: "Every day at 00:00" },
  { label: "Daily at noon", expression: "0 12 * * *", description: "Every day at 12:00" },
  { label: "Weekdays at 9 AM", expression: "0 9 * * 1-5", description: "Monday-Friday at 09:00" },
  { label: "1st of month", expression: "0 0 1 * *", description: "At midnight on the 1st" },
];

export const FIELD_COLORS: Record<keyof CronFields, string> = {
  minute: "text-cron-minute",
  hour: "text-cron-hour",
  dayOfMonth: "text-cron-day",
  month: "text-cron-month",
  dayOfWeek: "text-cron-weekday",
};

export const FIELD_BG_COLORS: Record<keyof CronFields, string> = {
  minute: "bg-cron-minute/10 border-cron-minute/30",
  hour: "bg-cron-hour/10 border-cron-hour/30",
  dayOfMonth: "bg-cron-day/10 border-cron-day/30",
  month: "bg-cron-month/10 border-cron-month/30",
  dayOfWeek: "bg-cron-weekday/10 border-cron-weekday/30",
};

export const FIELD_LABELS: Record<keyof CronFields, string> = {
  minute: "Minute",
  hour: "Hour",
  dayOfMonth: "Day (Month)",
  month: "Month",
  dayOfWeek: "Day (Week)",
};

export const FIELD_RANGES: Record<keyof CronFields, { min: number; max: number }> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 6 },
};

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseCronExpression(expression: string): CronFields {
  const parts = expression.trim().split(/\s+/);
  // Handle 5-field cron only
  if (parts.length !== 5) {
    return { minute: "*", hour: "*", dayOfMonth: "*", month: "*", dayOfWeek: "*" };
  }
  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}

export function fieldsToExpression(fields: CronFields): string {
  return `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`;
}

export function isValidCron(expression: string): boolean {
  try {
    // cron-parser v5 uses 6 fields (with seconds), so prepend 0 for seconds
    const parts = expression.trim().split(/\s+/);
    if (parts.length !== 5) return false;
    CronExpressionParser.parse(`0 ${expression}`);
    return true;
  } catch {
    return false;
  }
}

export function getNextExecutions(
  expression: string,
  count: number = 10,
  tz: string = "UTC"
): Date[] {
  try {
    const interval = CronExpressionParser.parse(`0 ${expression}`, { tz });
    const dates: Date[] = [];
    for (let i = 0; i < count; i++) {
      const next = interval.next();
      dates.push(next.toDate());
    }
    return dates;
  } catch {
    return [];
  }
}

export function getExecutionDaysInMonth(
  expression: string,
  year: number,
  month: number, // 0-indexed (0=Jan)
  tz: string = "UTC"
): Set<number> {
  const days = new Set<number>();
  try {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    const interval = CronExpressionParser.parse(`0 ${expression}`, {
      currentDate: startDate,
      endDate,
      tz,
    });
    // Iterate through all execution times in the month
    let safety = 0;
    while (safety < 50000) {
      try {
        const next = interval.next();
        const d = next.toDate();
        if (d > endDate) break;
        days.add(d.getDate());
        safety++;
      } catch {
        break;
      }
    }
  } catch {
    // invalid expression
  }
  return days;
}

export function toHumanReadable(expression: string): string {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression";

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const segments: string[] = [];

  // Handle minute
  if (minute === "*") {
    segments.push("Every minute");
  } else if (minute.startsWith("*/")) {
    const step = minute.slice(2);
    segments.push(`Every ${step} minutes`);
  } else if (minute.includes(",")) {
    segments.push(`At minutes ${minute}`);
  } else if (minute.includes("-")) {
    segments.push(`Minutes ${minute}`);
  } else {
    segments.push(`At minute ${minute}`);
  }

  // Handle hour
  if (hour === "*") {
    if (minute !== "*" && !minute.startsWith("*/")) {
      segments.push("of every hour");
    }
  } else if (hour.startsWith("*/")) {
    const step = hour.slice(2);
    segments.push(`every ${step} hours`);
  } else if (hour.includes(",")) {
    segments.push(`at hours ${hour}`);
  } else if (hour.includes("-")) {
    const [start, end] = hour.split("-");
    segments.push(`between ${formatHour(start)} and ${formatHour(end)}`);
  } else {
    // Specific hour - show nice time format
    if (minute !== "*" && !minute.startsWith("*/")) {
      // Replace the minute segment with a combined time
      const h = parseInt(hour);
      const m = parseInt(minute);
      if (!isNaN(h) && !isNaN(m)) {
        segments[0] = `At ${formatTime(h, m)}`;
      } else {
        segments.push(`past hour ${hour}`);
      }
    } else {
      segments.push(`past hour ${hour}`);
    }
  }

  // Handle day of month
  if (dayOfMonth !== "*") {
    if (dayOfMonth.startsWith("*/")) {
      segments.push(`every ${dayOfMonth.slice(2)} days`);
    } else if (dayOfMonth === "1") {
      segments.push("on the 1st");
    } else if (dayOfMonth === "15") {
      segments.push("on the 15th");
    } else {
      segments.push(`on day ${dayOfMonth}`);
    }
  }

  // Handle month
  if (month !== "*") {
    if (month.startsWith("*/")) {
      segments.push(`every ${month.slice(2)} months`);
    } else if (month.includes(",")) {
      const months = month.split(",").map(m => {
        const idx = parseInt(m) - 1;
        return MONTH_NAMES[idx] || m;
      });
      segments.push(`in ${months.join(", ")}`);
    } else if (month.includes("-")) {
      const [start, end] = month.split("-");
      const startName = MONTH_NAMES[parseInt(start) - 1] || start;
      const endName = MONTH_NAMES[parseInt(end) - 1] || end;
      segments.push(`from ${startName} to ${endName}`);
    } else {
      const idx = parseInt(month) - 1;
      const name = MONTH_NAMES[idx] || month;
      segments.push(`in ${name}`);
    }
  }

  // Handle day of week
  if (dayOfWeek !== "*") {
    if (dayOfWeek === "1-5") {
      segments.push("on weekdays");
    } else if (dayOfWeek === "0,6") {
      segments.push("on weekends");
    } else if (dayOfWeek.includes(",")) {
      const days = dayOfWeek.split(",").map(d => WEEKDAY_NAMES[parseInt(d)] || d);
      segments.push(`on ${days.join(", ")}`);
    } else if (dayOfWeek.includes("-")) {
      const [start, end] = dayOfWeek.split("-");
      const startName = WEEKDAY_NAMES[parseInt(start)] || start;
      const endName = WEEKDAY_NAMES[parseInt(end)] || end;
      segments.push(`${startName} through ${endName}`);
    } else {
      const name = WEEKDAY_NAMES[parseInt(dayOfWeek)] || dayOfWeek;
      segments.push(`on ${name}`);
    }
  }

  return segments.join(" ");
}

function formatHour(h: string): string {
  const num = parseInt(h);
  if (isNaN(num)) return h;
  if (num === 0) return "12 AM";
  if (num === 12) return "12 PM";
  if (num < 12) return `${num} AM`;
  return `${num - 12} PM`;
}

function formatTime(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const min = m.toString().padStart(2, "0");
  return `${hour}:${min} ${period}`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) return "past";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `in ${days}d ${hours % 24}h`;
  if (hours > 0) return `in ${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `in ${minutes}m`;
  return `in ${seconds}s`;
}

export function formatDateTime(date: Date, tz: string): string {
  try {
    return date.toLocaleString("en-US", {
      timeZone: tz,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return date.toLocaleString();
  }
}

// localStorage helpers for recent expressions
const STORAGE_KEY = "cron-builder-recent";
const MAX_RECENT = 10;

export function getRecentExpressions(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addRecentExpression(expression: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentExpressions().filter((e) => e !== expression);
    recent.unshift(expression);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // ignore
  }
}

export function clearRecentExpressions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
