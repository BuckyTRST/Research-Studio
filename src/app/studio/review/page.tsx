"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Video = {
  id: string;
  title: string;
  caption: string;
  file_path: string;
  thumbnail_path: string | null;
  status: string;
  privacy: string;
  duration_sec: number;
  created_at: string;
  platform_post_id: string | null;
};

function mediaName(filePath: string | null | undefined) {
  if (!filePath) return null;
  return filePath.split(/[/\\]/).pop() || null;
}

export default function ReviewPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [filter, setFilter] = useState("pending_review");

  async function load(status: string) {
    const q = status === "all" ? "" : `?status=${encodeURIComponent(status)}`;
    const res = await fetch(`/api/videos${q}`);
    const json = await res.json();
    setVideos(json.videos || []);
  }

  useEffect(() => {
    load(filter);
  }, [filter]);

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-7">
        <h1 className="display text-4xl font-extrabold">Review</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Nothing posts until you open a video, check the caption and privacy, and explicitly approve or
          post it.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            ["pending_review", "Pending"],
            ["approved", "Approved"],
            ["posted", "Posted"],
            ["rejected", "Rejected"],
            ["all", "All"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`btn ${filter === value ? "" : "btn-secondary"} !py-2 !px-3 text-sm`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {videos.length === 0 && <div className="surface rounded-2xl p-6 text-[var(--muted)] sm:col-span-2 xl:col-span-3">No videos in this queue.</div>}
        {videos.map((video) => {
          const thumb = mediaName(video.thumbnail_path);
          const file = mediaName(video.file_path);
          return (
            <Link key={video.id} href={`/studio/review/${video.id}`} className="surface overflow-hidden rounded-[22px] transition hover:-translate-y-0.5">
              <div className="aspect-[9/14] bg-[var(--ink)]/90">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/media/${thumb}`} alt="" className="h-full w-full object-cover opacity-95" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/70">{file}</div>
                )}
              </div>
              <div className="p-4">
                <div className="mb-2 flex gap-2">
                  <span className="chip">{video.status}</span>
                  <span className="chip">{Math.round(video.duration_sec)}s</span>
                </div>
                <p className="font-semibold line-clamp-2">{video.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">{video.caption}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
