import React from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";
import { Camera, type CameraState, FRAMINGS } from "../components/Camera";
import { CharacterDialogue } from "../components/CharacterDialogue";
import { CinematicGrade } from "../components/CinematicGrade";
import { EducationalTip } from "../components/EducationalTip";
import { useEpisode } from "../components/EpisodeContext";
import { StudioSet } from "../components/StudioSet";
import { msToFrames } from "../config/video";
import type { Segment } from "../utils/timeline";

// Escena en el estudio. El plano (general, primer plano, reacción, tablero)
// viene del segmento; la cámara hace un empuje lento y, si se pide, un zoom
// cómico rápido.

export type StudioSceneProps = {
  segment: Segment;
  snapIn?: boolean; // entrada con "golpe" de zoom (planos de reacción)
};

export const StudioScene: React.FC<StudioSceneProps> = ({ segment, snapIn }) => {
  const { ep, frame } = useEpisode();
  if (segment.shot.type !== "studio") return null;
  const shot = segment.shot;
  const local = frame - segment.from;
  const base = FRAMINGS[shot.framing];
  const cam: CameraState = { ...base };

  // Empuje lento de cámara durante el plano.
  const p = local / Math.max(1, segment.durationInFrames);
  cam.zoom *= 1 + 0.045 * Easing.inOut(Easing.quad)(Math.min(1, p));

  if (snapIn) {
    const s = spring({ frame: local, fps: ep.fps, config: { damping: 15, stiffness: 220 } });
    cam.zoom *= interpolate(s, [0, 1], [0.86, 1]);
  }

  if (shot.comicZoomAtMs !== undefined) {
    const first = ep.lines.find((l) => l.id === segment.lineIds[0]);
    if (first) {
      const at = first.startFrame + msToFrames(shot.comicZoomAtMs, ep.fps);
      const s = spring({ frame: frame - at, fps: ep.fps, config: { damping: 13, stiffness: 260 } });
      cam.zoom *= 1 + 0.55 * s;
      cam.cy -= 18 * s;
      cam.rot = (cam.rot ?? 0) + 2.5 * s;
    }
  }

  const blur = 1.2 + Math.max(0, cam.zoom - 1) * 3.2;

  return (
    <AbsoluteFill style={{ backgroundColor: "#2A1A10", overflow: "hidden" }}>
      <Camera cam={cam}>
        <StudioSet frame={frame} blur={blur} />
        <CharacterDialogue />
      </Camera>
      <CinematicGrade />
      {shot.framing === "tipBoard" ? <EducationalTip segment={segment} /> : null}
    </AbsoluteFill>
  );
};
