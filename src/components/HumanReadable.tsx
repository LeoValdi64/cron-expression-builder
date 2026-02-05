"use client";

import { toHumanReadable, isValidCron } from "@/lib/cron-utils";
import { MessageSquareText } from "lucide-react";

interface HumanReadableProps {
  expression: string;
}

export default function HumanReadable({ expression }: HumanReadableProps) {
  const readable = isValidCron(expression)
    ? toHumanReadable(expression)
    : "Invalid expression";

  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <h2 className="mb-2 text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
        <MessageSquareText className="h-4 w-4" />
        Human Readable
      </h2>
      <p className="text-lg text-foreground">{readable}</p>
    </div>
  );
}
