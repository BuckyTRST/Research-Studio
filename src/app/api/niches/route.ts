import { NextResponse } from "next/server";
import { createNiche, listNiches } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ niches: listNiches() });
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  const niche = createNiche({
    name,
    description: String(body.description || ""),
    communities: String(body.communities || ""),
  });
  return NextResponse.json({ niche }, { status: 201 });
}
