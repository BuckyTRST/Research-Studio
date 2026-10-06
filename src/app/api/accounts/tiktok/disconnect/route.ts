import { NextResponse } from "next/server";
import { disconnectTikTok } from "@/lib/tiktok";

export const runtime = "nodejs";

export async function POST() {
  disconnectTikTok();
  return NextResponse.json({ ok: true });
}
