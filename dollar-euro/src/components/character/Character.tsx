import React from "react";
import { Img, staticFile } from "remotion";
import { CHARACTERS } from "../../config/characters";
import type { CharacterId } from "../../episodes/types";
import { hasAsset } from "../../utils/assets";
import { DogRig, type DogPose } from "./DogRig";
import type { BodyOffset } from "./pose";

// Personaje reutilizable. Elige automáticamente el modo de render:
//  - "layered": public/characters/<id>/body.png + head.png (+ jaw.png)
//  - "cutout":  public/characters/<id>/cutout.png (foto recortada, 2.5D)
//  - "rig":     rig SVG provisional (cuando aún no hay fotos)
// Los tres modos reciben la misma pose, así que los episodios no cambian.

export type CharacterRenderMode = "rig" | "cutout" | "layered";

export const characterRenderMode = (id: CharacterId): CharacterRenderMode => {
  if (hasAsset(`characters/${id}/body.png`) && hasAsset(`characters/${id}/head.png`)) return "layered";
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

const PhotoCharacter: React.FC<{ id: CharacterId; pose: DogPose; mode: CharacterRenderMode }> = ({
  id,
  pose,
  mode,
}) => {
  const cfg = CHARACTERS[id];
  const squash = 1 + pose.breath * 0.015 - pose.open * 0.01;
  if (mode === "cutout") {
    // Foto única: solo admite respiración, inclinación y rebote al hablar.
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "50% 100%",
          transform: `rotate(${pose.headTilt * 0.35}deg) scaleY(${squash}) translateY(${-pose.open * 6}px)`,
        }}
      >
        <Img src={staticFile(`characters/${id}/cutout.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%" }} />
      </div>
    );
  }
  const [px, py] = cfg.photo.headPivot;
  const hasJaw = hasAsset(`characters/${id}/jaw.png`);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Img src={staticFile(`characters/${id}/body.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transformOrigin: "50% 100%", transform: `scaleY(${squash})` }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${px * 100}% ${py * 100}%`,
          transform: `translate(${pose.headX}px, ${pose.headY}px) rotate(${pose.headTilt}deg)`,
        }}
      >
        {hasJaw ? (
          <Img src={staticFile(`characters/${id}/jaw.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transform: `translateY(${pose.open * cfg.photo.jawTravelPx}px)` }} />
        ) : null}
        <Img src={staticFile(`characters/${id}/head.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }} />
      </div>
    </div>
  );
};

export const Character: React.FC<Props> = ({ id, pose, body, puppy, width, x, y, uidSuffix = "" }) => {
  const cfg = CHARACTERS[id];
  const mode = puppy ? "rig" : characterRenderMode(id);
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
      {mode === "rig" ? (
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
      ) : (
        <PhotoCharacter id={id} pose={pose} mode={mode} />
      )}
    </div>
  );
};
