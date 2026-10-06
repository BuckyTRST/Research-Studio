import { chatJson, hasOpenAI } from "./openai";
import type { Niche, ResearchItem } from "./types";

export type GeneratedScript = {
  hook: string;
  body: string;
  caption: string;
  hashtags: string;
  full_voiceover: string;
};

function fallbackScript(niche: Niche, research?: ResearchItem | null): GeneratedScript {
  const topic = research?.title || `a pattern inside ${niche.name}`;
  const hook = `Stop scrolling if you're into ${niche.name}.`;
  const body = [
    `Here's what people keep arguing about: ${topic}.`,
    research?.summary
      ? research.summary.split(/[.!?]/).filter(Boolean).slice(0, 2).join(". ") + "."
      : `The community keeps circling the same question, and most takes miss the point.`,
    `The useful angle is simple: notice the pattern, cut the noise, and say it the way the niche actually talks.`,
    `If this hit, save it and test the idea in your next post.`,
  ].join(" ");
  const hashtags = [`#${niche.name.replace(/\s+/g, "")}`, "#fyp", "#creator", "#niche"].join(" ");
  const caption = `${hook} ${topic}`.slice(0, 140);
  const full_voiceover = `${hook} ${body}`;
  return { hook, body, caption, hashtags, full_voiceover };
}

export async function generateScript(
  niche: Niche,
  research?: ResearchItem | null
): Promise<GeneratedScript> {
  if (!hasOpenAI()) {
    return fallbackScript(niche, research);
  }

  const result = await chatJson<GeneratedScript>(
    `You write short-form TikTok scripts for niche communities.
Return JSON with keys: hook, body, caption, hashtags, full_voiceover.
Rules:
- Speak in the community's language, not corporate marketing.
- Hook must stop the scroll in one sentence.
- Body is 45-75 spoken seconds when read aloud (roughly 110-180 words).
- full_voiceover = hook + body as one spoken script, no stage directions.
- caption is short and postable.
- hashtags is a space-separated string of 3-6 tags.
- No emojis overload. No spammy CTA spam.`,
    `Niche: ${niche.name}
Description: ${niche.description}
Communities: ${niche.communities}
Research title: ${research?.title || "n/a"}
Research summary: ${research?.summary || "n/a"}
Source: ${research?.source || "n/a"}`
  );

  if (!result?.hook || !result?.body || !result?.full_voiceover) {
    return fallbackScript(niche, research);
  }

  return {
    hook: result.hook.trim(),
    body: result.body.trim(),
    caption: (result.caption || result.hook).trim(),
    hashtags: (result.hashtags || "").trim(),
    full_voiceover: result.full_voiceover.trim(),
  };
}
