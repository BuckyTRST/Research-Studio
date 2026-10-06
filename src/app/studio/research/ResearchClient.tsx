"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Niche = { id: string; name: string; communities: string };
type Research = {
  id: string;
  niche_id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string | null;
  engagement: number;
};

export default function ResearchClient() {
  const params = useSearchParams();
  const [niches, setNiches] = useState<Niche[]>([]);
  const [research, setResearch] = useState<Research[]>([]);
  const [nicheId, setNicheId] = useState(params.get("niche") || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptBusy, setScriptBusy] = useState<string | null>(null);

  const selected = useMemo(() => niches.find((n) => n.id === nicheId), [niches, nicheId]);

  async function loadNiches() {
    const res = await fetch("/api/niches");
    const json = await res.json();
    setNiches(json.niches || []);
    if (!nicheId && json.niches?.[0]?.id) setNicheId(json.niches[0].id);
  }

  async function loadResearch(id: string) {
    if (!id) return;
    const res = await fetch(`/api/research?nicheId=${encodeURIComponent(id)}`);
    const json = await res.json();
    setResearch(json.research || []);
  }

  useEffect(() => {
    loadNiches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (nicheId) loadResearch(nicheId);
  }, [nicheId]);

  async function runResearch() {
    if (!nicheId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Research failed");
      setResearch((prev) => [...(json.research || []), ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setBusy(false);
    }
  }

  async function makeScript(researchId: string) {
    setScriptBusy(researchId);
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheId, researchId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Script failed");
      alert(`Script drafted: ${json.script.hook}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Script failed");
    } finally {
      setScriptBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-7">
        <h1 className="display text-4xl font-extrabold">Research</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Pull recurring questions and debates from the communities attached to a niche. With an OpenAI
          key, angles are clustered and rewritten for short-form. Without one, the studio uses live
          Reddit data when available, plus strong heuristic angles.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label className="label">Niche</label>
            <select className="field" value={nicheId} onChange={(e) => setNicheId(e.target.value)}>
              <option value="">Select a niche</option>
              {niches.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" disabled={!nicheId || busy} onClick={runResearch}>
            {busy ? "Researching…" : "Run research"}
          </button>
        </div>
        {selected?.communities && <p className="mt-3 text-sm text-[var(--muted)]">Communities: {selected.communities}</p>}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </section>

      <section className="grid gap-3">
        {research.length === 0 && (
          <div className="surface rounded-2xl p-6 text-[var(--muted)]">No research items yet for this niche.</div>
        )}
        {research.map((item) => (
          <article key={item.id} className="surface rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="chip">{item.source}</span>
                  <span className="chip">score {item.engagement}</span>
                </div>
                <h2 className="text-lg font-bold">{item.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{item.summary}</p>
                {item.source_url && (
                  <a
                    className="mt-2 inline-block text-sm font-semibold text-[var(--accent)]"
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source
                  </a>
                )}
              </div>
              <button className="btn" disabled={scriptBusy === item.id} onClick={() => makeScript(item.id)}>
                {scriptBusy === item.id ? "Drafting…" : "Draft script"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
