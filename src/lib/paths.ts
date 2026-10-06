import fs from "fs";
import path from "path";

export const DATA_DIR = path.join(process.cwd(), "data");
export const DB_PATH = path.join(DATA_DIR, "studio.db");
export const AUDIO_DIR = path.join(DATA_DIR, "audio");
export const VIDEO_DIR = path.join(DATA_DIR, "videos");
export const MEDIA_DIR = path.join(DATA_DIR, "media");
export const TOKENS_PATH = path.join(DATA_DIR, "tokens.json");

export function ensureDataDirs() {
  for (const dir of [DATA_DIR, AUDIO_DIR, VIDEO_DIR, MEDIA_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
