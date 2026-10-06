"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Video = {
  id: string;
  title: string;
  caption: string;
  file_path: string;
  thumbnail_path: string | null;
  status: string;
  privacy: string;
  duration_sec: number;
  ai_labeled: number;
  platform_post_id: string | null;
};

const PRIVACY = [
  { value: "SELF_ONLY", label: "Only me" },
  { value: "MUTUAL_FOLLOW_FRIENDS", label: "Friends" },
  { value: "FOLLOWER_OF_CREATOR", label: "Followers" },
  { value: "PUBLIC_TO_EVERYONE", label: "Everyone" },
];

function mediaName(filePath: string | null | undefined) {
  if (!filePath) return null;
  return filePath.split(/[/\\]/).pop() || null;
}

export default function ReviewDetailPage() {
  const params = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("SELF_ONLY");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/videos/${params.id}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Not found");
      return;
    }
    setVideo(json.video);
    setCaption(json.video.caption);
    setPrivacy(json.video.privacy);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function setStatus(status: "approved" | "rejected") {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/videos/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, caption, privacy }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      setVideo(json.video);
      setMessage(status === "approved" ? "Approved. You can post when ready." : "Rejected. This video will not post.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function postNow() {
    if (!confirm("Post this video with the caption and privacy shown? This is your explicit approval.")) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      // Persist caption/privacy first
      await fetch(`/api/videos/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, privacy }),
      });
      const res = await fetch(`/api/videos/${params.id}/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true, privacy }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Post failed");
      setVideo(json.video);
      setMessage(json.message || (json.demo ? "Demo post recorded locally." : "Posted to TikTok."));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Post failed");
    } finally {
      setBusy(false);
    }
  }

  if (error && !video) return <p className="p-6 text-red-700">{error}</p>;
  if (!video) return <p className="p-6 text-[var(--muted)]">Loading video…</p>;

  const file = mediaName(video.file_path);
  const thumb = mediaName(video.thumbnail_path);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/studio/review" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
          ← Back to queue
        </Link>
        <span className="chip">{video.status}</span>
      </div>

      <section className="grid gap-5 lg:grid-cols-[minmax(240px,360px)_1fr]">
        <div className="surface overflow-hidden rounded-[24px]">
          {file ? (
            <video
              className="aspect-[9/16] w-full bg-black object-contain"
              controls
              playsInline
              preload="metadata"
              poster={thumb ? `/api/media/${thumb}` : undefined}
              src={`/api/media/${file}`}
            />
          ) : (
            <div className="flex aspect-[9/16] items-center justify-center text-[var(--muted)]">No file</div>
          )}
        </div>

        <div className="surface rounded-[24px] p-6 space-y-4">
          <div>
            <h1 className="display text-3xl font-extrabold">{video.title}</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {Math.round(video.duration_sec)}s · AI-labeled {video.ai_labeled ? "yes" : "no"}
              {video.platform_post_id ? ` · post id ${video.platform_post_id}` : ""}
            </p>
          </div>

          <div>
            <label className="label">Caption</label>
            <textarea className="field min-h-28" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>

          <div>
            <label className="label">Who can see this</label>
            <select className="field" value={privacy} onChange={(e) => setPrivacy(e.target.value)}>
              {PRIVACY.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--muted)]">
            Research Studio never posts on its own. Approving or pressing <strong>Post now</strong> is your
            explicit confirmation for this specific video.
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn" disabled={busy} onClick={postNow}>
              {busy ? "Working…" : "Post now"}
            </button>
            <button className="btn btn-secondary" disabled={busy} onClick={() => setStatus("approved")}>
              Approve only
            </button>
            <button className="btn btn-danger" disabled={busy} onClick={() => setStatus("rejected")}>
              Reject
            </button>
          </div>

          {message && <p className="text-sm text-[var(--accent)]">{message}</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </section>
    </div>
  );
}
