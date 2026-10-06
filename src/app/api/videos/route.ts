import { NextResponse } from "next/server";
import { createId, createVideo, getScript, listVideos, updateScript } from "@/lib/db";
import { renderVerticalVideo } from "@/lib/render";
import { synthesizeVoiceover } from "@/lib/tts";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as
    | "pending_review"
    | "approved"
    | "rejected"
    | "posted"
    | "failed"
    | null;
  return NextResponse.json({ videos: listVideos(status || undefined) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const scriptId = String(body.scriptId || "");
  const script = getScript(scriptId);
  if (!script) return NextResponse.json({ error: "Script not found" }, { status: 404 });

  const renderId = createId("render");
  const voiceText = script.full_voiceover || `${script.hook} ${script.body}`;

  try {
    const { audioPath } = await synthesizeVoiceover(voiceText, renderId);
    const rendered = await renderVerticalVideo({
      id: renderId,
      voiceoverPath: audioPath,
      hook: script.hook,
      fullText: voiceText,
    });

    const caption = [script.caption, script.hashtags].filter(Boolean).join("\n\n");
    const video = createVideo({
      script_id: script.id,
      niche_id: script.niche_id,
      title: script.hook,
      caption,
      file_path: rendered.videoPath,
      thumbnail_path: rendered.thumbnailPath,
      duration_sec: rendered.durationSec,
      privacy: "SELF_ONLY",
      status: "pending_review",
      ai_labeled: 1,
    });

    updateScript(script.id, { status: "rendered" });
    return NextResponse.json({ video }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Render failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
