import { NextResponse } from "next/server";
import { listAccounts } from "@/lib/db";
import { tiktokConfigured } from "@/lib/tiktok";
import { hasOpenAI } from "@/lib/openai";

export const runtime = "nodejs";

export async function GET() {
  const accounts = listAccounts().map((a) => ({
    id: a.id,
    platform: a.platform,
    display_name: a.display_name,
    account_id: a.account_id,
    scopes: a.scopes,
    connected_at: a.connected_at,
    updated_at: a.updated_at,
    token_expires_at: a.token_expires_at,
  }));

  return NextResponse.json({
    accounts,
    config: {
      tiktok: tiktokConfigured(),
      openai: hasOpenAI(),
      demoPost: process.env.TIKTOK_DEMO_POST === "1" || !tiktokConfigured(),
    },
  });
}
