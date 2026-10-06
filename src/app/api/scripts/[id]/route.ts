import { NextResponse } from "next/server";
import { deleteScript, getScript, updateScript } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const script = getScript(id);
  if (!script) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ script });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const script = updateScript(id, {
    hook: body.hook !== undefined ? String(body.hook) : undefined,
    body: body.body !== undefined ? String(body.body) : undefined,
    caption: body.caption !== undefined ? String(body.caption) : undefined,
    hashtags: body.hashtags !== undefined ? String(body.hashtags) : undefined,
    full_voiceover: body.full_voiceover !== undefined ? String(body.full_voiceover) : undefined,
    status: body.status,
  } as never);
  if (!script) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ script });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!getScript(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  deleteScript(id);
  return NextResponse.json({ ok: true });
}
