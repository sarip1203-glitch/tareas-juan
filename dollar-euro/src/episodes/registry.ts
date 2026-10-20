import { buildTimeline, type ResolvedEpisode } from "../utils/timeline";
import { episode01 } from "./episode01/episode";
import type { EpisodeDefinition } from "./types";

// Para añadir un episodio: crear episodes/episodeXX/episode.ts y sumarlo aquí.
export const EPISODES: EpisodeDefinition[] = [episode01];

export const RESOLVED: Record<string, ResolvedEpisode> = Object.fromEntries(
  EPISODES.map((def) => [def.id, buildTimeline(def)]),
);
