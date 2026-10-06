import { getAccount, upsertAccount, deleteAccount } from "./db";
import type { PrivacyLevel, SocialAccount } from "./types";

const TIKTOK_AUTH = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_USER = "https://open.tiktokapis.com/v2/user/info/";
const TIKTOK_CREATOR_INFO = "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";
const TIKTOK_INIT = "https://open.tiktokapis.com/v2/post/publish/video/init/";

export function tiktokConfigured(): boolean {
  return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
}

export function getTikTokRedirectUri(origin: string): string {
  return process.env.TIKTOK_REDIRECT_URI || `${origin}/api/accounts/tiktok/callback`;
}

export function buildTikTokAuthUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    scope: "user.info.basic,video.publish,video.upload",
    response_type: "code",
    redirect_uri: getTikTokRedirectUri(origin),
    state,
  });
  return `${TIKTOK_AUTH}?${params.toString()}`;
}

export async function exchangeTikTokCode(code: string, origin: string) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    code,
    grant_type: "authorization_code",
    redirect_uri: getTikTokRedirectUri(origin),
  });
  const res = await fetch(TIKTOK_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TikTok token exchange failed: ${text}`);
  }
  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    scope?: string;
    open_id?: string;
  };
}

export async function refreshTikTokToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET || "",
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TIKTOK_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error("TikTok refresh failed");
  return (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
    open_id?: string;
  };
}

export async function fetchTikTokDisplayName(accessToken: string): Promise<{ display_name: string; open_id?: string }> {
  const res = await fetch(`${TIKTOK_USER}?fields=display_name,open_id`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    return { display_name: "TikTok account" };
  }
  const json = (await res.json()) as {
    data?: { user?: { display_name?: string; open_id?: string } };
  };
  return {
    display_name: json.data?.user?.display_name || "TikTok account",
    open_id: json.data?.user?.open_id,
  };
}

export async function saveTikTokAccount(tokens: {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  open_id?: string;
}): Promise<SocialAccount> {
  const profile = await fetchTikTokDisplayName(tokens.access_token);
  const expiresAt = tokens.expires_in
    ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    : null;
  return upsertAccount({
    platform: "tiktok",
    display_name: profile.display_name,
    account_id: tokens.open_id || profile.open_id || null,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || null,
    token_expires_at: expiresAt,
    scopes: tokens.scope || "user.info.basic,video.publish",
  });
}

export async function getValidTikTokAccount(): Promise<SocialAccount | null> {
  const account = getAccount("tiktok");
  if (!account) return null;
  if (account.token_expires_at && account.refresh_token) {
    const expires = new Date(account.token_expires_at).getTime();
    if (Date.now() > expires - 60_000) {
      try {
        const refreshed = await refreshTikTokToken(account.refresh_token);
        return saveTikTokAccount(refreshed);
      } catch {
        return account;
      }
    }
  }
  return account;
}

export async function queryCreatorInfo(accessToken: string) {
  const res = await fetch(TIKTOK_CREATOR_INFO, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({}),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function postVideoToTikTok(opts: {
  accessToken: string;
  videoPath: string;
  title: string;
  privacy: PrivacyLevel;
  aiLabeled?: boolean;
}): Promise<{ publish_id?: string; demo?: boolean; message?: string }> {
  // Without real TikTok credentials / sandbox approval, operate in demo mode:
  // still require explicit creator approval in the app, but simulate the upload.
  if (!tiktokConfigured() || process.env.TIKTOK_DEMO_POST === "1") {
    return {
      demo: true,
      publish_id: `demo_${Date.now()}`,
      message: "Demo post recorded locally. Configure TIKTOK_CLIENT_KEY/SECRET and disable TIKTOK_DEMO_POST for live uploads.",
    };
  }

  const fs = await import("fs");
  const stat = fs.statSync(opts.videoPath);
  const initRes = await fetch(TIKTOK_INIT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      post_info: {
        title: opts.title.slice(0, 2200),
        privacy_level: opts.privacy,
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
        ...(opts.aiLabeled ? { is_aigc: true } : {}),
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: stat.size,
        chunk_size: stat.size,
        total_chunk_count: 1,
      },
    }),
  });

  if (!initRes.ok) {
    const text = await initRes.text();
    throw new Error(`TikTok init failed: ${text}`);
  }

  const initJson = (await initRes.json()) as {
    data?: { publish_id?: string; upload_url?: string };
    error?: { message?: string };
  };

  const uploadUrl = initJson.data?.upload_url;
  const publishId = initJson.data?.publish_id;
  if (!uploadUrl) {
    throw new Error(initJson.error?.message || "No upload URL from TikTok");
  }

  const videoBuffer = fs.readFileSync(opts.videoPath);
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(videoBuffer.length),
      "Content-Range": `bytes 0-${videoBuffer.length - 1}/${videoBuffer.length}`,
    },
    body: videoBuffer,
  });

  if (!uploadRes.ok) {
    const text = await uploadRes.text();
    throw new Error(`TikTok upload failed: ${text}`);
  }

  return { publish_id: publishId };
}

export function disconnectTikTok() {
  deleteAccount("tiktok");
}
