import React from "react";
import { Img, staticFile } from "remotion";
import { CHARACTERS } from "../../config/characters";
import type { CharacterId } from "../../episodes/types";
import { hasAsset } from "../../utils/assets";
import { DogRig, type DogPose } from "./DogRig";
import { PUPPETS, PhotoPuppet } from "./PhotoPuppet";
import type { BodyOffset } from "./pose";

// Personaje reutilizable. Elige automáticamente el modo de render:
//  - "puppet": marioneta 2.5D realista (public/characters/<id>/body.png,
//              head.png y jaw.png, generadas con scripts/prepare-photo-puppet.py)
//  - "cutout": public/characters/<id>/cutout.png (foto recortada, 2.5D mínimo)
//  - "rig":    rig SVG con los colores de las fotos (sin imágenes)
// Los tres modos reciben la misma pose, así que los episodios no cambian.

export type CharacterRenderMode = "rig" | "cutout" | "puppet";

export const characterRenderMode = (id: CharacterId): CharacterRenderMode => {
  if (PUPPETS[id] && ["body", "head", "jaw"].every((n) => hasAsset(`characters/${id}/${n}.png`))) return "puppet";
  if (hasAsset(`characters/${id}/cutout.png`)) return "cutout";
  return "rig";
};

type Props = {
  id: CharacterId;
  pose: DogPose;
  body: BodyOffset;
  puppy?: boolean;
  width: number; // ancho en px del personaje (rig: 600 unidades)
  x: number; // centro de la base, coordenadas del mundo
  y: number;
  uidSuffix?: string;
};

// Foto única: solo admite respiración, inclinación y rebote al hablar.
const CutoutCharacter: React.FC<{ id: CharacterId; pose: DogPose }> = ({ id, pose }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      transformOrigin: "50% 100%",
      transform: `rotate(${pose.headTilt * 0.35}deg) scaleY(${1 + pose.breath * 0.015}) translateY(${-pose.open * 6}px)`,
    }}
  >
    <Img src={staticFile(`characters/${id}/cutout.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%" }} />
  </div>
);

export const Character: React.FC<Props> = ({ id, pose, body, puppy, width, x, y, uidSuffix = "" }) => {
  const cfg = CHARACTERS[id];
  const mode = characterRenderMode(id);
  const height = (width * 800) / 600;
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height,
        width,
        height,
        transformOrigin: "50% 100%",
        transform: `translate(${body.x}px, ${body.y}px) rotate(${body.rot}deg) scale(${body.scale})`,
      }}
    >
      {mode === "puppet" ? (
        <PhotoPuppet id={id} pose={pose} width={width} height={height} puppy={puppy} />
      ) : mode === "cutout" ? (
        <CutoutCharacter id={id} pose={pose} />
      ) : (
        <DogRig
          uid={`${id}${uidSuffix}`}
          pose={pose}
          palette={cfg.palette}
          markings={cfg.markings}
          collarColor={cfg.collarColor}
          tagLetter={cfg.tagLetter}
          puppy={puppy}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};
