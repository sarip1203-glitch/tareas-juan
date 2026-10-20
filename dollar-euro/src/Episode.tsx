import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { DialogueAudio } from "./components/DialogueAudio";
import { DraftBadge } from "./components/DraftBadge";
import { DynamicCaptions } from "./components/DynamicCaptions";
import { EpisodeProvider, useEpisode } from "./components/EpisodeContext";
import { EpisodeOutro } from "./components/EpisodeOutro";
import { EpisodeTitleCard, SeriesLogo } from "./components/Intro";
import { ReactionShot } from "./components/ReactionShot";
import { GlitchLayer, SceneTransition, TRANSITION_HALF } from "./components/SceneTransition";
import { RESOLVED } from "./episodes/registry";
import { FlashbackScene } from "./scenes/FlashbackScene";
import { StudioScene } from "./scenes/StudioScene";
import { hasAsset } from "./utils/assets";
import type { Segment } from "./utils/timeline";

export type EpisodeProps = {
  episodeId: string;
  showDraftBadges: boolean;
};

const SegmentView: React.FC<{ segment: Segment }> = ({ segment }) => {
  if (segment.shot.type === "flashback") return <FlashbackScene segment={segment} />;
  if (segment.shot.framing === "reactionDollar" || segment.shot.framing === "reactionEuro") {
    return <ReactionShot segment={segment} />;
  }
  return <StudioScene segment={segment} />;
};

const segmentName = (s: Segment) =>
  s.shot.type === "flashback" ? `${s.sceneId} · flashback ${s.shot.id}` : `${s.sceneId} · ${s.shot.framing}`;

export const Episode: React.FC<EpisodeProps> = ({ episodeId, showDraftBadges }) => {
  const frame = useCurrentFrame();
  const ep = RESOLVED[episodeId];
  if (!ep) throw new Error(`Episodio desconocido: ${episodeId}`);

  const screenOverlays = ep.overlays.filter((o) => !o.target);

  return (
    <EpisodeProvider ep={ep} frame={frame} showDraftBadges={showDraftBadges}>
      <AbsoluteFill style={{ backgroundColor: "#1A0F08" }}>
        {ep.segments.map((s) => (
          <Sequence key={`${s.sceneId}-${s.from}`} from={s.from} durationInFrames={s.durationInFrames} name={segmentName(s)}>
            <SegmentView segment={s} />
          </Sequence>
        ))}

        {/* Clips de video pre-generados (si existen) sustituyen a la animación en su línea. */}
        {ep.lines.map((l) =>
          l.video && hasAsset(l.video) ? (
            <Sequence key={`v-${l.id}`} from={l.startFrame} durationInFrames={l.spanEndFrame - l.startFrame} name={`video ${l.id}`}>
              <OffthreadVideo src={staticFile(l.video)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Sequence>
          ) : null,
        )}

        <Sequence from={ep.outro.from} durationInFrames={ep.outro.durationInFrames} name="Cierre / próximo capítulo">
          <EpisodeOutro nextNumber={ep.def.outro.nextEpisodeNumber} nextTitle={ep.def.outro.nextEpisodeTitle} />
        </Sequence>

        {screenOverlays.map((o) => (
          <Sequence key={o.key} from={o.from} durationInFrames={o.durationInFrames} name={`overlay ${o.type}`} layout="none">
            <ScreenOverlay type={o.type} from={o.from} dur={o.durationInFrames} />
          </Sequence>
        ))}

        {[...ep.segments.slice(1), { from: ep.outro.from, transitionIn: "flash" as const, sceneId: "outro" }].map((s) =>
          s.transitionIn !== "cut" ? (
            <Sequence key={`t-${s.sceneId}-${s.from}`} from={s.from - TRANSITION_HALF} durationInFrames={TRANSITION_HALF * 2} name={`transición ${s.transitionIn}`} layout="none">
              <SceneTransition type={s.transitionIn} t={frame - s.from} />
            </Sequence>
          ) : null,
        )}

        <DynamicCaptions />
        <DraftBadge />
        <DialogueAudio ep={ep} />
      </AbsoluteFill>
    </EpisodeProvider>
  );
};

const ScreenOverlay: React.FC<{ type: string; from: number; dur: number }> = ({ type, from, dur }) => {
  const frame = useCurrentFrame();
  const { ep } = useEpisode();
  const fps = ep.fps;
  if (type === "seriesLogo") return <SeriesLogo t={frame} dur={dur} fps={fps} />;
  if (type === "episodeTitle") {
    return <EpisodeTitleCard t={frame} dur={dur} fps={fps} number={ep.def.number} title={ep.def.title} />;
  }
  if (type === "glitch") {
    const strength = frame < dur - 6 ? 0.8 + 0.2 * Math.sin(frame * 2.3) : (dur - frame) / 6;
    return <GlitchLayer strength={strength} seed={from + frame} label="FALLA TÉCNICA" />;
  }
  return null;
};
