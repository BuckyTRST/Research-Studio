import fs from "fs";
import path from "path";
import { getDb } from "./db";
import { VIDEO_DIR, AUDIO_DIR } from "./paths";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Delete rendered media older than 7 days, matching the privacy policy. */
export function cleanupExpiredMedia() {
  const cutoff = Date.now() - SEVEN_DAYS_MS;
  const db = getDb();
  const old = db
    .prepare("SELECT id, file_path, thumbnail_path, created_at FROM videos")
    .all() as Array<{ id: string; file_path: string; thumbnail_path: string | null; created_at: string }>;

  for (const video of old) {
    if (new Date(video.created_at).getTime() > cutoff) continue;
    for (const p of [video.file_path, video.thumbnail_path]) {
      if (p && fs.existsSync(p)) {
        try {
          fs.unlinkSync(p);
        } catch {
          // ignore
        }
      }
    }
  }

  // Sweep orphaned audio/video files by mtime
  for (const dir of [VIDEO_DIR, AUDIO_DIR]) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      try {
        const stat = fs.statSync(full);
        if (Date.now() - stat.mtimeMs > SEVEN_DAYS_MS) fs.unlinkSync(full);
      } catch {
        // ignore
      }
    }
  }
}
