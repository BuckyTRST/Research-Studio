import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { AUDIO_DIR, VIDEO_DIR } from "@/lib/paths";

export const runtime = "nodejs";

export async function GET(_: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const safe = path.basename(name);
  const candidates = [path.join(VIDEO_DIR, safe), path.join(AUDIO_DIR, safe)];
  const file = candidates.find((p) => fs.existsSync(p));
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = fs.readFileSync(file);
  const ext = path.extname(file).toLowerCase();
  const type =
    ext === ".mp4"
      ? "video/mp4"
      : ext === ".mp3"
        ? "audio/mpeg"
        : ext === ".jpg" || ext === ".jpeg"
          ? "image/jpeg"
          : ext === ".png"
            ? "image/png"
            : "application/octet-stream";

  return new NextResponse(data, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
