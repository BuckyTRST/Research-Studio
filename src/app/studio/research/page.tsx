import { Suspense } from "react";
import ResearchClient from "./ResearchClient";

export default function ResearchPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[var(--muted)]">Loading research…</p>}>
      <ResearchClient />
    </Suspense>
  );
}
