"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Niche = {
  id: string;
  name: string;
  description: string;
  communities: string;
  created_at: string;
};

export default function NichesPage() {
  const [niches, setNiches] = useState<Niche[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [communities, setCommunities] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/niches");
    const json = await res.json();
    setNiches(json.niches || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/niches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, communities }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setName("");
      setDescription("");
      setCommunities("");
      setMessage(`Created ${json.niche.name}`);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this niche and its related items?")) return;
    await fetch(`/api/niches/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-7">
        <h1 className="display text-4xl font-extrabold">Niches</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Define the communities you create for. Add Reddit-style community names (for example{" "}
          <code>r/homestead</code>, <code>r/smallbusiness</code>) so research can pull live discussions.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={onCreate} className="surface rounded-[24px] p-6 space-y-4">
          <h2 className="display text-2xl font-bold">New niche</h2>
          <div>
            <label className="label">Name</label>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Homesteading beginners" required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="field min-h-24" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this niche cares about" />
          </div>
          <div>
            <label className="label">Communities</label>
            <input className="field" value={communities} onChange={(e) => setCommunities(e.target.value)} placeholder="r/homestead, r/gardening" />
          </div>
          <button className="btn" disabled={busy || !name.trim()}>
            {busy ? "Saving…" : "Create niche"}
          </button>
          {message && <p className="text-sm text-[var(--muted)]">{message}</p>}
        </form>

        <div className="surface rounded-[24px] p-6">
          <h2 className="display text-2xl font-bold">Your niches</h2>
          <ul className="mt-4 space-y-3">
            {niches.length === 0 && <li className="text-[var(--muted)]">None yet.</li>}
            {niches.map((n) => (
              <li key={n.id} className="rounded-xl border border-[var(--line)] bg-white/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{n.name}</p>
                    <p className="text-sm text-[var(--muted)]">{n.description || "No description"}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{n.communities || "No communities"}</p>
                  </div>
                  <button className="btn btn-secondary !px-3 !py-1.5 text-xs" onClick={() => onDelete(n.id)} type="button">
                    Delete
                  </button>
                </div>
                <div className="mt-3 flex gap-3 text-sm font-semibold text-[var(--accent)]">
                  <Link href={`/studio/research?niche=${n.id}`}>Research →</Link>
                  <Link href={`/studio/scripts?niche=${n.id}`}>Scripts →</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
