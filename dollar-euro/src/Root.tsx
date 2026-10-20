import React from "react";
import { Composition, Folder } from "remotion";
import { VIDEO } from "./config/video";
import { Episode } from "./Episode";
import { EPISODES, RESOLVED } from "./episodes/registry";
import { CharacterSheet } from "./scenes/CharacterSheet";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Episodios">
        {EPISODES.map((def) => (
          <Composition
            key={def.id}
            id={def.compositionId}
            component={Episode}
            durationInFrames={RESOLVED[def.id].totalFrames}
            fps={VIDEO.fps}
            width={VIDEO.width}
            height={VIDEO.height}
            defaultProps={{ episodeId: def.id, showDraftBadges: true }}
          />
        ))}
      </Folder>
      <Folder name="Personajes">
        <Composition id="Ficha-Dollar" component={CharacterSheet} durationInFrames={120} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} defaultProps={{ id: "dollar" as const }} />
        <Composition id="Ficha-Euro" component={CharacterSheet} durationInFrames={120} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} defaultProps={{ id: "euro" as const }} />
      </Folder>
    </>
  );
};
