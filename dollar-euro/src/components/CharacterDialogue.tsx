import React from "react";
import { CHARACTERS } from "../config/characters";
import type { CharacterId, OverlayType } from "../episodes/types";
import { Character } from "./character/Character";
import { computeCharacterFrame } from "./character/pose";
import { STUDIO_DOG_WIDTH, headWorldPosition } from "./character/useCharacterPlacement";
import { useEpisode } from "./EpisodeContext";
import { Hearts, PoolDream, QuestionMarks, SweatDrop } from "./gags/Gags";

// Los dos perros en el estudio, animados según el diálogo activo
// (quién habla, expresiones, miradas, acciones y gags anclados a ellos).

const ANCHORED: Partial<Record<OverlayType, typeof PoolDream>> = {
  poolDream: PoolDream,
  sweat: SweatDrop,
  hearts: Hearts,
  questionMarks: QuestionMarks,
};

export const CharacterDialogue: React.FC = () => {
  const { ep, frame } = useEpisode();
  const frames = {
    dollar: computeCharacterFrame(ep, "dollar", frame),
    euro: computeCharacterFrame(ep, "euro", frame),
  };

  // Quien tapa al otro con la pata va delante.
  const dollarCovering = frames.dollar.pose.pawR > 0.05;
  const order: CharacterId[] = dollarCovering ? ["euro", "dollar"] : ["dollar", "euro"];

  const gags = ep.overlays.filter(
    (o) => o.target && ANCHORED[o.type] && frame >= o.from && frame < o.from + o.durationInFrames,
  );

  return (
    <>
      {order.map((id) =>
        frames[id].visible ? (
          <Character
            key={id}
            id={id}
            pose={frames[id].pose}
            body={frames[id].body}
            width={STUDIO_DOG_WIDTH}
            x={CHARACTERS[id].studioAnchor.x}
            y={CHARACTERS[id].studioAnchor.y}
          />
        ) : null,
      )}
      {gags.map((o) => {
        const Comp = ANCHORED[o.type]!;
        const target = o.target as CharacterId;
        const head = headWorldPosition(target, frames[target]);
        return <Comp key={o.key} x={head.x} y={head.y} t={frame - o.from} dur={o.durationInFrames} fps={ep.fps} />;
      })}
    </>
  );
};
