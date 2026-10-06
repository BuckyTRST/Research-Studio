import { NextResponse } from "next/server";
import { getVideo, updateVideo, nowIso } from "@/lib/db";
import type { PrivacyLevel } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const video = getVideo(id);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ video });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const existing = getVideo(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (body.caption !== undefined) patch.caption = String(body.caption);
  if (body.privacy !== undefined) patch.privacy = body.privacy as PrivacyLevel;
  if (body.status === "approved" || body.status === "rejected") {
    patch.status = body.status;
    patch.reviewed_at = nowIso();
  }

  const video = updateVideo(id, patch as never);
  return NextResponse.json({ video });
}
