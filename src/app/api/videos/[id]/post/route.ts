import { NextResponse } from "next/server";
import { getVideo, nowIso, updateVideo } from "@/lib/db";
import { getValidTikTokAccount, postVideoToTikTok } from "@/lib/tiktok";
import type { PrivacyLevel } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const video = getVideo(id);
  if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const privacy = (body.privacy as PrivacyLevel) || video.privacy;

  // Hard gate: never post without explicit approval in this request or prior approve
  const confirmed = body.confirm === true;
  if (!confirmed) {
    return NextResponse.json(
      { error: "Posting requires confirm:true after reviewing this video." },
      { status: 400 }
    );
  }

  if (video.status === "rejected") {
    return NextResponse.json({ error: "Rejected videos cannot be posted." }, { status: 400 });
  }

  // Mark approved as part of the explicit post action if still pending
  if (video.status === "pending_review") {
    updateVideo(id, { status: "approved", privacy, reviewed_at: nowIso() });
  } else if (privacy !== video.privacy) {
    updateVideo(id, { privacy });
  }

  const account = await getValidTikTokAccount();
  if (!account) {
    // Still allow local demo "post" so the operator can finish the flow without credentials
    const posted = updateVideo(id, {
      status: "posted",
      platform: "tiktok",
      platform_post_id: `local_demo_${Date.now()}`,
      privacy,
      posted_at: nowIso(),
    });
    return NextResponse.json({
      video: posted,
      demo: true,
      message: "No TikTok account connected. Recorded a local demo post. Connect TikTok on Accounts to upload for real.",
    });
  }

  try {
    const result = await postVideoToTikTok({
      accessToken: account.access_token,
      videoPath: video.file_path,
      title: video.caption || video.title,
      privacy,
      aiLabeled: Boolean(video.ai_labeled),
    });

    const posted = updateVideo(id, {
      status: "posted",
      platform: "tiktok",
      platform_post_id: result.publish_id || null,
      privacy,
      posted_at: nowIso(),
    });

    return NextResponse.json({ video: posted, demo: Boolean(result.demo), message: result.message });
  } catch (err) {
    updateVideo(id, { status: "failed" });
    const message = err instanceof Error ? err.message : "Post failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
