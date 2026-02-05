import { Suspense } from "react";
import CronBuilder from "@/components/CronBuilder";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-muted font-mono text-sm">Loading...</div>
        </div>
      }
    >
      <CronBuilder />
    </Suspense>
  );
}
