"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { isValidCron, addRecentExpression } from "@/lib/cron-utils";
import CronInput from "./CronInput";
import VisualBuilder from "./VisualBuilder";
import HumanReadable from "./HumanReadable";
import NextExecutions from "./NextExecutions";
import TimezoneSelector from "./TimezoneSelector";
import CalendarView from "./CalendarView";
import Presets from "./Presets";
import CopyButton from "./CopyButton";
import RecentExpressions from "./RecentExpressions";
import { Share2, Terminal } from "lucide-react";

const DEFAULT_EXPRESSION = "*/5 * * * *";

export default function CronBuilder() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [expression, setExpression] = useState(() => {
    const fromUrl = searchParams.get("expr");
    if (fromUrl && isValidCron(decodeURIComponent(fromUrl))) {
      return decodeURIComponent(fromUrl);
    }
    return DEFAULT_EXPRESSION;
  });
  const [timezone, setTimezone] = useState("UTC");
  const [recentKey, setRecentKey] = useState(0);
  const [shareMsg, setShareMsg] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  // Save to recent with debounce
  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    if (isValidCron(expression)) {
      saveTimeout.current = setTimeout(() => {
        addRecentExpression(expression);
        setRecentKey((k) => k + 1);
      }, 1500);
    }
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [expression]);

  const handleExpressionChange = useCallback(
    (newExpr: string) => {
      setExpression(newExpr);
      // Update URL without full navigation
      const url = new URL(window.location.href);
      url.searchParams.set("expr", newExpr);
      router.replace(url.pathname + url.search, { scroll: false });
    },
    [router]
  );

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?expr=${encodeURIComponent(expression)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    } catch {
      // fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setShareMsg(true);
      setTimeout(() => setShareMsg(false), 2000);
    }
  }, [expression]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Terminal className="h-7 w-7 text-accent-blue" />
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Cron Expression Builder
            </h1>
          </div>
          <p className="text-sm text-muted">
            Build, validate, and understand cron schedules visually.
          </p>
        </header>

        {/* Main expression input + controls */}
        <section className="mb-6 rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <CronInput
                expression={expression}
                onChange={handleExpressionChange}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <CopyButton text={expression} />
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  shareMsg
                    ? "border-accent-green/50 bg-accent-green/10 text-accent-green"
                    : "border-input-border bg-input-bg text-muted hover:text-foreground hover:border-accent-blue"
                }`}
                title="Copy shareable URL"
              >
                <Share2 className="h-4 w-4" />
                {shareMsg ? "URL Copied!" : "Share"}
              </button>
            </div>
          </div>

          {/* Timezone */}
          <div className="mt-4 flex items-center justify-between border-t border-card-border pt-4">
            <TimezoneSelector value={timezone} onChange={setTimezone} />
            <HumanReadable expression={expression} />
          </div>
        </section>

        {/* Visual Builder */}
        <section className="mb-6 rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
          <VisualBuilder
            expression={expression}
            onChange={handleExpressionChange}
          />
        </section>

        {/* Presets */}
        <section className="mb-6">
          <Presets
            currentExpression={expression}
            onSelect={handleExpressionChange}
          />
        </section>

        {/* Two column layout: Executions + Calendar */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <NextExecutions expression={expression} timezone={timezone} />
          <CalendarView expression={expression} timezone={timezone} />
        </div>

        {/* Recent expressions */}
        <section className="mb-8">
          <RecentExpressions
            onSelect={handleExpressionChange}
            refreshKey={recentKey}
          />
        </section>

        {/* Footer */}
        <footer className="border-t border-card-border pt-6 text-center text-xs text-muted">
          <p>
            Cron Expression Builder — A developer tool for building and
            understanding cron schedules.
          </p>
          <p className="mt-1">
            Format: <code className="font-mono text-foreground">minute hour day month weekday</code>
          </p>
        </footer>
      </div>
    </div>
  );
}
