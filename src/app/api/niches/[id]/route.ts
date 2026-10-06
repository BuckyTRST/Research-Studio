import { NextResponse } from "next/server";
import { deleteNiche, getNiche, listResearch, listScripts, listVideos } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const niche = getNiche(id);
  if (!niche) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    niche,
    research: listResearch(id),
    scripts: listScripts(id),
    videos: listVideos().filter((v) => v.niche_id === id),
  });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!getNiche(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  deleteNiche(id);
  return NextResponse.json({ ok: true });
}
