import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { hasAsset } from "../utils/assets";
import type { ResolvedEpisode } from "../utils/timeline";

// Pistas de audio del episodio: una por intervención (archivos
// independientes), efectos y música con "ducking" bajo los diálogos.
// Si falta un archivo no se inserta nada (y el episodio lo avisa).

export const DialogueAudio: React.FC<{ ep: ResolvedEpisode }> = ({ ep }) => {
  const music = ep.def.music && hasAsset(ep.def.music.src) ? ep.def.music : undefined;
  const ranges = ep.lines.map((l) => [l.startFrame, l.endFrame] as const);
  const duck = (f: number) => {
    // Distancia en fotogramas al diálogo más cercano → mezcla suave.
    let d = Infinity;
    for (const [a, b] of ranges) {
      if (f >= a && f < b) return 0;
      d = Math.min(d, f < a ? a - f : f - b);
    }
    return Math.min(1, d / 10);
  };

  return (
    <>
      {ep.lines.map((l) =>
        l.audioSrc ? (
          <Sequence key={l.id} from={l.startFrame} durationInFrames={l.spanEndFrame - l.startFrame} name={`voz ${l.id}`} layout="none">
            <Audio src={staticFile(l.audioSrc)} />
          </Sequence>
        ) : null,
      )}
      {ep.sfx.map((s) =>
        hasAsset(s.src) ? (
          <Sequence key={s.key} from={s.from} name={`sfx ${s.src.split("/").pop()}`} layout="none">
            <Audio src={staticFile(s.src)} volume={s.volume ?? 0.6} />
          </Sequence>
        ) : null,
      )}
      {music ? (
        <Audio
          src={staticFile(music.src)}
          loop
          volume={(f) => {
            const k = duck(f);
            const fadeOut = Math.min(1, Math.max(0, (ep.totalFrames - f) / 30));
            return (music.duckedVolume + (music.volume - music.duckedVolume) * k) * fadeOut;
          }}
        />
      ) : null}
    </>
  );
};
