import Database from "better-sqlite3";
import { nanoid } from "nanoid";
import { DB_PATH, ensureDataDirs } from "./paths";
import type { Niche, ResearchItem, Script, SocialAccount, Video } from "./types";

let db: Database.Database | null = null;

export function getDb() {
  if (db) return db;
  ensureDataDirs();
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  return db;
}

function migrate(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS niches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      communities TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS research_items (
      id TEXT PRIMARY KEY,
      niche_id TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual',
      source_url TEXT,
      engagement INTEGER NOT NULL DEFAULT 0,
      raw_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (niche_id) REFERENCES niches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS scripts (
      id TEXT PRIMARY KEY,
      research_id TEXT,
      niche_id TEXT NOT NULL,
      hook TEXT NOT NULL,
      body TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      hashtags TEXT NOT NULL DEFAULT '',
      full_voiceover TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (niche_id) REFERENCES niches(id) ON DELETE CASCADE,
      FOREIGN KEY (research_id) REFERENCES research_items(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      script_id TEXT NOT NULL,
      niche_id TEXT NOT NULL,
      title TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      file_path TEXT NOT NULL,
      thumbnail_path TEXT,
      duration_sec REAL NOT NULL DEFAULT 0,
      privacy TEXT NOT NULL DEFAULT 'SELF_ONLY',
      status TEXT NOT NULL DEFAULT 'pending_review',
      platform TEXT,
      platform_post_id TEXT,
      ai_labeled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      reviewed_at TEXT,
      posted_at TEXT,
      FOREIGN KEY (script_id) REFERENCES scripts(id) ON DELETE CASCADE,
      FOREIGN KEY (niche_id) REFERENCES niches(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS social_accounts (
      id TEXT PRIMARY KEY,
      platform TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      account_id TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at TEXT,
      scopes TEXT NOT NULL DEFAULT '',
      connected_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix?: string) {
  return prefix ? `${prefix}_${nanoid(12)}` : nanoid(12);
}

/* ---------- Niches ---------- */

export function listNiches(): Niche[] {
  return getDb().prepare("SELECT * FROM niches ORDER BY created_at DESC").all() as Niche[];
}

export function getNiche(id: string): Niche | undefined {
  return getDb().prepare("SELECT * FROM niches WHERE id = ?").get(id) as Niche | undefined;
}

export function createNiche(input: { name: string; description?: string; communities?: string }): Niche {
  const niche: Niche = {
    id: createId("niche"),
    name: input.name.trim(),
    description: (input.description || "").trim(),
    communities: (input.communities || "").trim(),
    created_at: nowIso(),
  };
  getDb()
    .prepare(
      "INSERT INTO niches (id, name, description, communities, created_at) VALUES (@id, @name, @description, @communities, @created_at)"
    )
    .run(niche);
  return niche;
}

export function deleteNiche(id: string) {
  getDb().prepare("DELETE FROM niches WHERE id = ?").run(id);
}

/* ---------- Research ---------- */

export function listResearch(nicheId?: string): ResearchItem[] {
  if (nicheId) {
    return getDb()
      .prepare("SELECT * FROM research_items WHERE niche_id = ? ORDER BY engagement DESC, created_at DESC")
      .all(nicheId) as ResearchItem[];
  }
  return getDb()
    .prepare("SELECT * FROM research_items ORDER BY created_at DESC")
    .all() as ResearchItem[];
}

export function getResearch(id: string): ResearchItem | undefined {
  return getDb().prepare("SELECT * FROM research_items WHERE id = ?").get(id) as ResearchItem | undefined;
}

export function insertResearch(
  items: Omit<ResearchItem, "id" | "created_at">[]
): ResearchItem[] {
  const stmt = getDb().prepare(`
    INSERT INTO research_items (id, niche_id, title, summary, source, source_url, engagement, raw_json, created_at)
    VALUES (@id, @niche_id, @title, @summary, @source, @source_url, @engagement, @raw_json, @created_at)
  `);
  const created: ResearchItem[] = [];
  const tx = getDb().transaction((rows: Omit<ResearchItem, "id" | "created_at">[]) => {
    for (const row of rows) {
      const item: ResearchItem = { ...row, id: createId("res"), created_at: nowIso() };
      stmt.run(item);
      created.push(item);
    }
  });
  tx(items);
  return created;
}

export function deleteResearch(id: string) {
  getDb().prepare("DELETE FROM research_items WHERE id = ?").run(id);
}

/* ---------- Scripts ---------- */

export function listScripts(nicheId?: string): Script[] {
  if (nicheId) {
    return getDb()
      .prepare("SELECT * FROM scripts WHERE niche_id = ? ORDER BY created_at DESC")
      .all(nicheId) as Script[];
  }
  return getDb().prepare("SELECT * FROM scripts ORDER BY created_at DESC").all() as Script[];
}

export function getScript(id: string): Script | undefined {
  return getDb().prepare("SELECT * FROM scripts WHERE id = ?").get(id) as Script | undefined;
}

export function createScript(input: Omit<Script, "id" | "created_at" | "updated_at" | "status"> & { status?: Script["status"] }): Script {
  const ts = nowIso();
  const script: Script = {
    id: createId("script"),
    research_id: input.research_id,
    niche_id: input.niche_id,
    hook: input.hook,
    body: input.body,
    caption: input.caption,
    hashtags: input.hashtags,
    full_voiceover: input.full_voiceover,
    status: input.status || "draft",
    created_at: ts,
    updated_at: ts,
  };
  getDb()
    .prepare(
      `INSERT INTO scripts (id, research_id, niche_id, hook, body, caption, hashtags, full_voiceover, status, created_at, updated_at)
       VALUES (@id, @research_id, @niche_id, @hook, @body, @caption, @hashtags, @full_voiceover, @status, @created_at, @updated_at)`
    )
    .run(script);
  return script;
}

export function updateScript(id: string, patch: Partial<Script>): Script | undefined {
  const existing = getScript(id);
  if (!existing) return undefined;
  const next: Script = { ...existing, ...patch, id: existing.id, updated_at: nowIso() };
  getDb()
    .prepare(
      `UPDATE scripts SET research_id=@research_id, niche_id=@niche_id, hook=@hook, body=@body, caption=@caption,
       hashtags=@hashtags, full_voiceover=@full_voiceover, status=@status, updated_at=@updated_at WHERE id=@id`
    )
    .run(next);
  return next;
}

export function deleteScript(id: string) {
  getDb().prepare("DELETE FROM scripts WHERE id = ?").run(id);
}

/* ---------- Videos ---------- */

export function listVideos(status?: Video["status"]): Video[] {
  if (status) {
    return getDb()
      .prepare("SELECT * FROM videos WHERE status = ? ORDER BY created_at DESC")
      .all(status) as Video[];
  }
  return getDb().prepare("SELECT * FROM videos ORDER BY created_at DESC").all() as Video[];
}

export function getVideo(id: string): Video | undefined {
  return getDb().prepare("SELECT * FROM videos WHERE id = ?").get(id) as Video | undefined;
}

export function createVideo(input: Omit<Video, "id" | "created_at" | "reviewed_at" | "posted_at" | "platform" | "platform_post_id"> & {
  platform?: Video["platform"];
  platform_post_id?: string | null;
}): Video {
  const video: Video = {
    id: createId("vid"),
    script_id: input.script_id,
    niche_id: input.niche_id,
    title: input.title,
    caption: input.caption,
    file_path: input.file_path,
    thumbnail_path: input.thumbnail_path,
    duration_sec: input.duration_sec,
    privacy: input.privacy,
    status: input.status,
    platform: input.platform ?? null,
    platform_post_id: input.platform_post_id ?? null,
    ai_labeled: input.ai_labeled,
    created_at: nowIso(),
    reviewed_at: null,
    posted_at: null,
  };
  getDb()
    .prepare(
      `INSERT INTO videos (id, script_id, niche_id, title, caption, file_path, thumbnail_path, duration_sec, privacy, status, platform, platform_post_id, ai_labeled, created_at, reviewed_at, posted_at)
       VALUES (@id, @script_id, @niche_id, @title, @caption, @file_path, @thumbnail_path, @duration_sec, @privacy, @status, @platform, @platform_post_id, @ai_labeled, @created_at, @reviewed_at, @posted_at)`
    )
    .run(video);
  return video;
}

export function updateVideo(id: string, patch: Partial<Video>): Video | undefined {
  const existing = getVideo(id);
  if (!existing) return undefined;
  const next: Video = { ...existing, ...patch, id: existing.id };
  getDb()
    .prepare(
      `UPDATE videos SET script_id=@script_id, niche_id=@niche_id, title=@title, caption=@caption, file_path=@file_path,
       thumbnail_path=@thumbnail_path, duration_sec=@duration_sec, privacy=@privacy, status=@status, platform=@platform,
       platform_post_id=@platform_post_id, ai_labeled=@ai_labeled, reviewed_at=@reviewed_at, posted_at=@posted_at WHERE id=@id`
    )
    .run(next);
  return next;
}

/* ---------- Social accounts ---------- */

export function listAccounts(): SocialAccount[] {
  return getDb().prepare("SELECT * FROM social_accounts ORDER BY connected_at DESC").all() as SocialAccount[];
}

export function getAccount(platform: SocialAccount["platform"]): SocialAccount | undefined {
  return getDb()
    .prepare("SELECT * FROM social_accounts WHERE platform = ?")
    .get(platform) as SocialAccount | undefined;
}

export function upsertAccount(input: Omit<SocialAccount, "id" | "connected_at" | "updated_at"> & { id?: string }): SocialAccount {
  const existing = getAccount(input.platform);
  const ts = nowIso();
  if (existing) {
    const next: SocialAccount = {
      ...existing,
      ...input,
      id: existing.id,
      connected_at: existing.connected_at,
      updated_at: ts,
    };
    getDb()
      .prepare(
        `UPDATE social_accounts SET display_name=@display_name, account_id=@account_id, access_token=@access_token,
         refresh_token=@refresh_token, token_expires_at=@token_expires_at, scopes=@scopes, updated_at=@updated_at WHERE id=@id`
      )
      .run(next);
    return next;
  }
  const account: SocialAccount = {
    id: createId("acct"),
    platform: input.platform,
    display_name: input.display_name,
    account_id: input.account_id,
    access_token: input.access_token,
    refresh_token: input.refresh_token,
    token_expires_at: input.token_expires_at,
    scopes: input.scopes,
    connected_at: ts,
    updated_at: ts,
  };
  getDb()
    .prepare(
      `INSERT INTO social_accounts (id, platform, display_name, account_id, access_token, refresh_token, token_expires_at, scopes, connected_at, updated_at)
       VALUES (@id, @platform, @display_name, @account_id, @access_token, @refresh_token, @token_expires_at, @scopes, @connected_at, @updated_at)`
    )
    .run(account);
  return account;
}

export function deleteAccount(platform: SocialAccount["platform"]) {
  getDb().prepare("DELETE FROM social_accounts WHERE platform = ?").run(platform);
}

export function getStudioStats() {
  const database = getDb();
  const niches = (database.prepare("SELECT COUNT(*) as c FROM niches").get() as { c: number }).c;
  const research = (database.prepare("SELECT COUNT(*) as c FROM research_items").get() as { c: number }).c;
  const scripts = (database.prepare("SELECT COUNT(*) as c FROM scripts").get() as { c: number }).c;
  const pending = (
    database.prepare("SELECT COUNT(*) as c FROM videos WHERE status = 'pending_review'").get() as { c: number }
  ).c;
  const posted = (database.prepare("SELECT COUNT(*) as c FROM videos WHERE status = 'posted'").get() as { c: number }).c;
  return { niches, research, scripts, pending, posted };
}
