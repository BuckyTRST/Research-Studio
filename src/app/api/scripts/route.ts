import { NextResponse } from "next/server";
import { createScript, getNiche, getResearch, listScripts } from "@/lib/db";
import { generateScript } from "@/lib/script";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nicheId = searchParams.get("nicheId") || undefined;
  return NextResponse.json({ scripts: listScripts(nicheId) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const nicheId = String(body.nicheId || "");
  const researchId = body.researchId ? String(body.researchId) : null;
  const niche = getNiche(nicheId);
  if (!niche) return NextResponse.json({ error: "Niche not found" }, { status: 404 });
  const research = researchId ? getResearch(researchId) || null : null;
  if (researchId && !research) {
    return NextResponse.json({ error: "Research item not found" }, { status: 404 });
  }

  const generated = await generateScript(niche, research);
  const script = createScript({
    niche_id: niche.id,
    research_id: research?.id || null,
    hook: generated.hook,
    body: generated.body,
    caption: generated.caption,
    hashtags: generated.hashtags,
    full_voiceover: generated.full_voiceover,
    status: "ready",
  });

  return NextResponse.json({ script }, { status: 201 });
}
