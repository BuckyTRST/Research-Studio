export type Niche = {
  id: string;
  name: string;
  description: string;
  communities: string;
  created_at: string;
};

export type ResearchItem = {
  id: string;
  niche_id: string;
  title: string;
  summary: string;
  source: string;
  source_url: string | null;
  engagement: number;
  raw_json: string | null;
  created_at: string;
};

export type Script = {
  id: string;
  research_id: string | null;
  niche_id: string;
  hook: string;
  body: string;
  caption: string;
  hashtags: string;
  full_voiceover: string;
  status: "draft" | "ready" | "rendered";
  created_at: string;
  updated_at: string;
};

export type Video = {
  id: string;
  script_id: string;
  niche_id: string;
  title: string;
  caption: string;
  file_path: string;
  thumbnail_path: string | null;
  duration_sec: number;
  privacy: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY" | "FOLLOWER_OF_CREATOR";
  status: "pending_review" | "approved" | "rejected" | "posted" | "failed";
  platform: "tiktok" | "youtube" | "instagram" | null;
  platform_post_id: string | null;
  ai_labeled: number;
  created_at: string;
  reviewed_at: string | null;
  posted_at: string | null;
};

export type SocialAccount = {
  id: string;
  platform: "tiktok" | "youtube" | "instagram";
  display_name: string;
  account_id: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  scopes: string;
  connected_at: string;
  updated_at: string;
};

export type PrivacyLevel =
  | "PUBLIC_TO_EVERYONE"
  | "MUTUAL_FOLLOW_FRIENDS"
  | "SELF_ONLY"
  | "FOLLOWER_OF_CREATOR";
