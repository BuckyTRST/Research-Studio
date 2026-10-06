# Research Studio

Self-hosted AI short-form video studio. Research niche community conversations, draft scripts, render 9:16 videos with voiceover and captions, then post to your own TikTok account only after you review and approve each video.

## Features

- **Niches** — define audiences and Reddit communities
- **Research** — pull hot discussions (Reddit) and turn them into short-form angles (OpenAI when configured, heuristics otherwise)
- **Scripts** — draft hooks, body, captions, hashtags, and full voiceover text; edit before rendering
- **Render** — Edge TTS or OpenAI TTS + FFmpeg 9:16 video with timed captions
- **Review gate** — nothing posts until you explicitly approve / press Post now and choose privacy
- **Accounts** — TikTok Login Kit connect/disconnect; tokens stored locally in SQLite
- **Retention** — rendered media cleaned up after 7 days

## Requirements

- Node.js 20+
- FFmpeg + FFprobe on PATH
- Python 3 with `edge-tts` (`pip install edge-tts`) for free voiceover
- Optional: OpenAI API key, TikTok developer app credentials

## Setup

```bash
npm install
pip install edge-tts
cp .env.example .env.local
# edit .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the marketing site, or [http://localhost:3000/studio](http://localhost:3000/studio) for the app.

## TikTok

1. Create a TikTok developer app with Login Kit + Content Posting API.
2. Set redirect URI to `http://localhost:3000/api/accounts/tiktok/callback` (or your deployed origin).
3. Put `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` in `.env.local`.
4. Set `TIKTOK_DEMO_POST=0` when you are ready for live uploads.
5. Connect from **Studio → Accounts**.

Until credentials are present, Review still runs end-to-end and records local demo posts after your explicit confirmation.

## Operator flow

1. Create a niche (`r/subreddit` list optional but recommended)
2. Run research
3. Draft a script from a research item (or from the niche)
4. Edit, then **Render video**
5. Open **Review**, watch the cut, set caption + privacy
6. **Post now** (requires `confirm: true` server-side)

## Data

Local files under `data/`:

- `studio.db` — niches, research, scripts, videos, account tokens
- `audio/` — voiceovers
- `videos/` — rendered mp4 + thumbnails

## Legal pages

`/terms` and `/privacy` mirror the product commitments used for TikTok app review. Domain verification files live in `public/`.
