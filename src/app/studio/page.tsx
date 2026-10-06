"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StudioPayload = {
  stats: { niches: number; research: number; scripts: number; pending: number; posted: number };
  niches: Array<{ id: string; name: string; description: string; communities: string }>;
  pending: Array<{ id: string; title: string; caption: string; file_path: string; created_at: string }>;
  config: { openai: boolean; tiktok: boolean };
};

export default function StudioDashboard() {
  const [data, setData] = useState<StudioPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/studio")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setError("Could not load studio data"));
  }, []);

  if (error) return <p className="p-6 text-red-700">{error}</p>;
  if (!data) return <p className="p-6 text-[var(--muted)]">Loading studio…</p>;

  const cards = [
    { label: "Niches", value: data.stats.niches, href: "/studio/niches" },
    { label: "Research", value: data.stats.research, href: "/studio/research" },
    { label: "Scripts", value: data.stats.scripts, href: "/studio/scripts" },
    { label: "Pending review", value: data.stats.pending, href: "/studio/review" },
    { label: "Posted", value: data.stats.posted, href: "/studio/review" },
  ];

  return (
    <div className="space-y-6">
      <section className="surface overflow-hidden rounded-[28px] p-7 md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Dashboard</p>
            <h1 className="display mt-2 text-4xl font-extrabold md:text-5xl">Make the next video.</h1>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Research a niche, draft a script, render a 9:16 cut, then approve before anything reaches TikTok.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/studio/niches" className="btn">
              New niche
            </Link>
            <Link href="/studio/review" className="btn btn-secondary">
              Review queue
            </Link>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip">OpenAI {data.config.openai ? "connected" : "fallback mode"}</span>
          <span className="chip">TikTok {data.config.tiktok ? "ready" : "demo posting"}</span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="surface rounded-2xl p-5 transition hover:-translate-y-0.5">
            <p className="text-sm text-[var(--muted)]">{c.label}</p>
            <p className="display mt-2 text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="surface rounded-[24px] p-6">
          <div className="flex items-center justify-between">
            <h2 className="display text-2xl font-bold">Niches</h2>
            <Link href="/studio/niches" className="text-sm font-semibold text-[var(--accent)]">
              Manage
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {data.niches.length === 0 && <li className="text-[var(--muted)]">No niches yet. Create one to start researching.</li>}
            {data.niches.map((n) => (
              <li key={n.id} className="rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3">
                <p className="font-semibold">{n.name}</p>
                <p className="text-sm text-[var(--muted)]">{n.communities || n.description || "No communities set"}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface rounded-[24px] p-6">
          <div className="flex items-center justify-between">
            <h2 className="display text-2xl font-bold">Awaiting approval</h2>
            <Link href="/studio/review" className="text-sm font-semibold text-[var(--accent)]">
              Open queue
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {data.pending.length === 0 && <li className="text-[var(--muted)]">Nothing pending. Render a script to fill the queue.</li>}
            {data.pending.map((v) => (
              <li key={v.id}>
                <Link href={`/studio/review/${v.id}`} className="block rounded-xl border border-[var(--line)] bg-white/60 px-4 py-3 hover:border-[var(--accent)]">
                  <p className="font-semibold">{v.title}</p>
                  <p className="line-clamp-2 text-sm text-[var(--muted)]">{v.caption}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
