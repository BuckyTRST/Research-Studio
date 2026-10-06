import { NextResponse } from "next/server";
import { getNiche, insertResearch, listResearch } from "@/lib/db";
import { researchNiche } from "@/lib/research";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nicheId = searchParams.get("nicheId") || undefined;
  return NextResponse.json({ research: listResearch(nicheId) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const nicheId = String(body.nicheId || "");
  const niche = getNiche(nicheId);
  if (!niche) return NextResponse.json({ error: "Niche not found" }, { status: 404 });

  const discovered = await researchNiche(niche);
  const items = insertResearch(
    discovered.map((d) => ({
      niche_id: niche.id,
      title: d.title,
      summary: d.summary,
      source: d.source,
      source_url: d.source_url,
      engagement: d.engagement,
      raw_json: null,
    }))
  );

  return NextResponse.json({ research: items });
}
