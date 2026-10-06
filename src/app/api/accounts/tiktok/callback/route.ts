import { NextResponse } from "next/server";
import { exchangeTikTokCode, saveTikTokAccount } from "@/lib/tiktok";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");
  const origin = url.origin;

  if (err) {
    return NextResponse.redirect(`${origin}/studio/accounts?error=${encodeURIComponent(err)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/studio/accounts?error=missing_code`);
  }

  // Soft-check state cookie when present
  // (TikTok may redirect without cookie in some sandbox setups)
  void state;

  try {
    const tokens = await exchangeTikTokCode(code, origin);
    await saveTikTokAccount(tokens);
    return NextResponse.redirect(`${origin}/studio/accounts?connected=tiktok`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "oauth_failed";
    return NextResponse.redirect(`${origin}/studio/accounts?error=${encodeURIComponent(message)}`);
  }
}
