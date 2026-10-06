import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { buildTikTokAuthUrl, tiktokConfigured } from "@/lib/tiktok";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  if (!tiktokConfigured()) {
    return NextResponse.json(
      {
        error:
          "TikTok is not configured. Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in .env.local.",
      },
      { status: 400 }
    );
  }
  const state = nanoid(16);
  const url = buildTikTokAuthUrl(origin, state);
  const res = NextResponse.redirect(url);
  res.cookies.set("tiktok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
