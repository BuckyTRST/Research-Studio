"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Niche = { id: string; name: string };
type Script = {
  id: string;
  niche_id: string;
  research_id: string | null;
  hook: string;
  body: string;
  caption: string;
  hashtags: string;
  full_voiceover: string;
  status: string;
};

function ScriptsInner() {
  const params = useSearchParams();
  const [niches, setNiches] = useState<Niche[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [nicheId, setNicheId] = useState(params.get("niche") || "");
  const [busy, setBusy] = useState(false);
  const [renderBusy, setRenderBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const [n, s] = await Promise.all([
      fetch("/api/niches").then((r) => r.json()),
      fetch(nicheId ? `/api/scripts?nicheId=${encodeURIComponent(nicheId)}` : "/api/scripts").then((r) => r.json()),
    ]);
    setNiches(n.niches || []);
    setScripts(s.scripts || []);
    if (!nicheId && n.niches?.[0]?.id) setNicheId(n.niches[0].id);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nicheId]);

  async function draftBlank() {
    if (!nicheId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setMessage("Draft created");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveScript(script: Script) {
    const res = await fetch(`/api/scripts/${script.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(script),
    });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error || "Save failed");
      return;
    }
    setMessage("Saved");
    await load();
  }

  async function renderVideo(scriptId: string) {
    setRenderBusy(scriptId);
    setMessage(null);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Render failed");
      setMessage(`Rendered ${json.video.id} — send it to Review`);
      window.location.href = `/studio/review/${json.video.id}`;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Render failed");
    } finally {
      setRenderBusy(null);
    }
  }

  function updateLocal(id: string, patch: Partial<Script>) {
    setScripts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-7">
        <h1 className="display text-4xl font-extrabold">Scripts</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Edit hooks, body copy, captions and the spoken voiceover. When it sounds right, render a 9:16
          video into the review queue.
        </p>
        <div className="mt-5 flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <label className="label">Niche</label>
            <select className="field" value={nicheId} onChange={(e) => setNicheId(e.target.value)}>
              <option value="">All niches</option>
              {niches.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" disabled={!nicheId || busy} onClick={draftBlank}>
            {busy ? "Drafting…" : "Draft from niche"}
          </button>
        </div>
        {message && <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>}
      </section>

      <section className="space-y-4">
        {scripts.length === 0 && <div className="surface rounded-2xl p-6 text-[var(--muted)]">No scripts yet.</div>}
        {scripts.map((script) => (
          <article key={script.id} className="surface rounded-[24px] p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="chip">{script.status}</span>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-secondary" type="button" onClick={() => saveScript(script)}>
                  Save edits
                </button>
                <button className="btn" type="button" disabled={renderBusy === script.id} onClick={() => renderVideo(script.id)}>
                  {renderBusy === script.id ? "Rendering…" : "Render video"}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Hook</label>
              <input className="field" value={script.hook} onChange={(e) => updateLocal(script.id, { hook: e.target.value })} />
            </div>
            <div>
              <label className="label">Body</label>
              <textarea className="field min-h-28" value={script.body} onChange={(e) => updateLocal(script.id, { body: e.target.value })} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="label">Caption</label>
                <textarea className="field min-h-20" value={script.caption} onChange={(e) => updateLocal(script.id, { caption: e.target.value })} />
              </div>
              <div>
                <label className="label">Hashtags</label>
                <input className="field" value={script.hashtags} onChange={(e) => updateLocal(script.id, { hashtags: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Full voiceover</label>
              <textarea
                className="field min-h-28"
                value={script.full_voiceover}
                onChange={(e) => updateLocal(script.id, { full_voiceover: e.target.value })}
              />
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function ScriptsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[var(--muted)]">Loading scripts…</p>}>
      <ScriptsInner />
    </Suspense>
  );
}
