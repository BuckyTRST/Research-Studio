import path from "path";
import { VIDEO_DIR } from "./paths";

export function publicMediaUrl(filePath: string): string {
  const base = path.basename(filePath);
  return `/api/media/${encodeURIComponent(base)}`;
}

export function resolveMediaFile(name: string): string | null {
  const safe = path.basename(name);
  const full = path.join(VIDEO_DIR, safe);
  if (!full.startsWith(VIDEO_DIR)) return null;
  return full;
}

export function privacyLabels() {
  return [
    { value: "SELF_ONLY", label: "Only me" },
    { value: "MUTUAL_FOLLOW_FRIENDS", label: "Friends" },
    { value: "FOLLOWER_OF_CREATOR", label: "Followers" },
    { value: "PUBLIC_TO_EVERYONE", label: "Everyone" },
  ] as const;
}
