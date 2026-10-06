import { chatJson, hasOpenAI } from "./openai";
import type { Niche } from "./types";

export type DiscoveredTopic = {
  title: string;
  summary: string;
  source: string;
  source_url: string | null;
  engagement: number;
};

type RedditListing = {
  data?: {
    children?: Array<{
      data?: {
        title?: string;
        selftext?: string;
        permalink?: string;
        score?: number;
        num_comments?: number;
        subreddit?: string;
        ups?: number;
      };
    }>;
  };
};

function parseCommunities(communities: string): string[] {
  return communities
    .split(/[,|\n]/)
    .map((s) => s.trim().replace(/^r\//i, "").replace(/^\/r\//i, ""))
    .filter(Boolean)
    .slice(0, 5);
}

async function fetchSubreddit(subreddit: string): Promise<DiscoveredTopic[]> {
  const url = `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=15`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "ResearchStudio/1.0 (self-hosted creator tool)",
      Accept: "application/json",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as RedditListing;
  const children = json.data?.children || [];
  return children
    .map((child) => {
      const d = child.data || {};
      const title = (d.title || "").trim();
      if (!title) return null;
      const summary = (d.selftext || "").trim().slice(0, 500) || `Hot discussion in r/${d.subreddit || subreddit}.`;
      const engagement = (d.score || d.ups || 0) + (d.num_comments || 0) * 2;
      return {
        title,
        summary,
        source: `reddit:r/${d.subreddit || subreddit}`,
        source_url: d.permalink ? `https://www.reddit.com${d.permalink}` : null,
        engagement,
      } satisfies DiscoveredTopic;
    })
    .filter((x): x is DiscoveredTopic => Boolean(x));
}

function heuristicTopics(niche: Niche): DiscoveredTopic[] {
  const seeds = [
    `What's the biggest mistake beginners make in ${niche.name}?`,
    `Unpopular opinion about ${niche.name} that actually holds up`,
    `The one tip that changed how people talk about ${niche.name}`,
    `Why everyone in ${niche.name} is arguing about this right now`,
    `If you're into ${niche.name}, stop doing this`,
    `A simple framework people in ${niche.name} swear by`,
    `The question nobody wants to ask about ${niche.name}`,
    `What veterans wish they knew earlier about ${niche.name}`,
  ];
  return seeds.map((title, i) => ({
    title,
    summary: niche.description
      ? `${niche.description} Potential angle: ${title}`
      : `Community-facing angle for ${niche.name}: ${title}`,
    source: "heuristic",
    source_url: null,
    engagement: 100 - i * 7,
  }));
}

async function enrichWithAI(niche: Niche, topics: DiscoveredTopic[]): Promise<DiscoveredTopic[]> {
  if (!hasOpenAI() || topics.length === 0) return topics;
  const result = await chatJson<{ topics: DiscoveredTopic[] }>(
    `You help short-form creators research niche communities. Return JSON: {"topics":[{"title","summary","source","source_url","engagement"}]}.
Keep titles punchy and conversational. Summaries should capture the debate or recurring question in the community's own language. Prefer 6-10 topics.`,
    `Niche: ${niche.name}
Description: ${niche.description}
Communities: ${niche.communities}
Raw discoveries:
${JSON.stringify(topics.slice(0, 20), null, 2)}

Cluster and rewrite into the strongest short-form video angles. Keep source and source_url when available. engagement should reflect relative strength.`
  );
  if (!result?.topics?.length) return topics;
  return result.topics.map((t) => ({
    title: t.title,
    summary: t.summary,
    source: t.source || "ai",
    source_url: t.source_url ?? null,
    engagement: Number(t.engagement) || 0,
  }));
}

export async function researchNiche(niche: Niche): Promise<DiscoveredTopic[]> {
  const subs = parseCommunities(niche.communities);
  const collected: DiscoveredTopic[] = [];

  for (const sub of subs) {
    try {
      const posts = await fetchSubreddit(sub);
      collected.push(...posts);
    } catch {
      // network may fail; continue
    }
  }

  if (collected.length === 0) {
    collected.push(...heuristicTopics(niche));
  }

  collected.sort((a, b) => b.engagement - a.engagement);
  const enriched = await enrichWithAI(niche, collected.slice(0, 20));
  return enriched.slice(0, 12);
}
