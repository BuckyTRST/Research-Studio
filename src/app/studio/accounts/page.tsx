"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type Account = {
  id: string;
  platform: string;
  display_name: string;
  account_id: string | null;
  scopes: string;
  connected_at: string;
};

type Payload = {
  accounts: Account[];
  config: { tiktok: boolean; openai: boolean; demoPost: boolean };
};

function AccountsInner() {
  const params = useSearchParams();
  const [data, setData] = useState<Payload | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/accounts");
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
    const connected = params.get("connected");
    const error = params.get("error");
    if (connected) setMessage(`Connected ${connected}.`);
    if (error) setMessage(`Connection error: ${error}`);
  }, [params]);

  async function disconnectTikTok() {
    if (!confirm("Disconnect TikTok and delete local tokens?")) return;
    await fetch("/api/accounts/tiktok/disconnect", { method: "POST" });
    setMessage("TikTok disconnected.");
    await load();
  }

  if (!data) return <p className="p-6 text-[var(--muted)]">Loading accounts…</p>;

  const tiktok = data.accounts.find((a) => a.platform === "tiktok");

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-7">
        <h1 className="display text-4xl font-extrabold">Accounts</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Connect the social accounts you own. Tokens stay on this machine. Disconnect anytime.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="chip">TikTok app {data.config.tiktok ? "configured" : "not configured"}</span>
          <span className="chip">OpenAI {data.config.openai ? "configured" : "fallback mode"}</span>
          <span className="chip">{data.config.demoPost ? "Demo posting enabled" : "Live posting"}</span>
        </div>
        {message && <p className="mt-3 text-sm text-[var(--muted)]">{message}</p>}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="surface rounded-[24px] p-6">
          <h2 className="display text-2xl font-bold">TikTok</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Uses Login Kit for display name and the Content Posting API for uploads you approve.
          </p>
          {tiktok ? (
            <div className="mt-4 rounded-xl border border-[var(--line)] bg-white/70 p-4">
              <p className="font-semibold">{tiktok.display_name}</p>
              <p className="text-sm text-[var(--muted)]">Connected {new Date(tiktok.connected_at).toLocaleString()}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{tiktok.scopes}</p>
              <button className="btn btn-secondary mt-4" type="button" onClick={disconnectTikTok}>
                Disconnect
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {data.config.tiktok ? (
                <a className="btn inline-flex" href="/api/accounts/tiktok/connect">
                  Connect TikTok
                </a>
              ) : (
                <p className="rounded-xl border border-[var(--line)] bg-white/70 p-4 text-sm text-[var(--muted)]">
                  Set <code>TIKTOK_CLIENT_KEY</code> and <code>TIKTOK_CLIENT_SECRET</code> in{" "}
                  <code>.env.local</code> to enable Login Kit. Until then, Review can still record local
                  demo posts after you approve a video.
                </p>
              )}
            </div>
          )}
        </article>

        <article className="surface rounded-[24px] p-6">
          <h2 className="display text-2xl font-bold">YouTube & Instagram</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Hooks are reserved in the product model and privacy policy. Configure Google/Meta credentials
            in a later release to publish Shorts and Reels through the same review gate.
          </p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">
              YouTube — coming next
            </div>
            <div className="rounded-xl border border-dashed border-[var(--line)] p-4 text-sm text-[var(--muted)]">
              Instagram — coming next
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-[var(--muted)]">Loading accounts…</p>}>
      <AccountsInner />
    </Suspense>
  );
}
