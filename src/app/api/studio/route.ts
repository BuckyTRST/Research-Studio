import { NextResponse } from "next/server";
import { getStudioStats, listNiches, listVideos } from "@/lib/db";
import { hasOpenAI } from "@/lib/openai";
import { tiktokConfigured } from "@/lib/tiktok";
import { cleanupExpiredMedia } from "@/lib/cleanup";

export const runtime = "nodejs";

export async function GET() {
  cleanupExpiredMedia();
  return NextResponse.json({
    stats: getStudioStats(),
    niches: listNiches().slice(0, 6),
    pending: listVideos("pending_review").slice(0, 6),
    config: {
      openai: hasOpenAI(),
      tiktok: tiktokConfigured(),
    },
  });
}
