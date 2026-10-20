import React from "react";
import { Img, staticFile } from "remotion";
import puppets from "../../config/puppets.json";
import type { CharacterId } from "../../episodes/types";
import type { DogPose } from "./DogRig";

// Marioneta 2.5D a partir de una imagen realista del perro, separada en
// capas por scripts/prepare-photo-puppet.py (body/head/jaw.png).
// Recibe la misma DogPose que el rig SVG, así que los episodios no cambian.
// Limitaciones: no mueve pupilas, cejas, orejas ni patas.

type EyeCfg = { x: number; y: number; rx: number; ry: number; lid: string };
export type PuppetConfig = {
  size: [number, number];
  feetY: number;
  centerX: number;
  displayHeight: number;
  pivot: [number, number];
  mouth: { x: number; y: number; w: number };
  jawTravel: number;
  eyes: EyeCfg[];
};

export const PUPPETS = puppets as unknown as Record<CharacterId, PuppetConfig>;

type Props = {
  id: CharacterId;
  pose: DogPose;
  width: number; // ancho del contenedor (mismo que el rig)
  height: number;
  puppy?: boolean;
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const PhotoPuppet: React.FC<Props> = ({ id, pose, width, height, puppy }) => {
  const c = PUPPETS[id];
  const [iw, ih] = c.size;
  const k = (height * c.displayHeight) / ih;
  const s = ih / 800; // unidades del rig → píxeles de la imagen
  const open = clamp(pose.open, 0, 1);
  const tilt = clamp(pose.headTilt, -10, 10);
  const turn = clamp(pose.headTurn, -1, 1);
  const breath = 1 + pose.breath * 0.012;
  const jawDrop = open * c.jawTravel;
  const mouthW = c.mouth.w * (pose.mouthShape === "round" ? 0.62 : pose.mouthShape === "narrow" ? 0.78 : 0.92);
  // Con fotos, los ojos entrecerrados se ven raros: se limita a 0.45 salvo
  // en los parpadeos (que sí cierran del todo, muy rápido).
  const lid = pose.lid > 0.9 ? pose.lid : clamp(pose.lid, 0, 0.45);
  const [px, py] = c.pivot;
  const headScale = puppy ? 1.16 : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: width / 2 - c.centerX * k,
        top: height - c.feetY * k,
        width: iw,
        height: ih,
        transformOrigin: "0 0",
        transform: `scale(${k})`,
      }}
    >
      {/* cuerpo (respira) */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${c.centerX}px ${c.feetY}px`, transform: `scaleY(${breath})` }}>
        <Img src={staticFile(`characters/${id}/body.png`)} style={{ position: "absolute", left: 0, top: 0, width: iw, height: ih }} />
      </div>
      {/* cabeza: inclina, gira y asiente desde el cuello */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: `${px}px ${py}px`,
          transform: `translate(${pose.headX * s + turn * 10 * s}px, ${(pose.headY - pose.breath * 3) * s}px) perspective(${iw * 2}px) rotateY(${turn * 14}deg) rotate(${tilt}deg) scale(${headScale})`,
        }}
      >
        <Img src={staticFile(`characters/${id}/head.png`)} style={{ position: "absolute", left: 0, top: 0, width: iw, height: ih }} />
        <svg width={iw} height={ih} viewBox={`0 0 ${iw} ${ih}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* interior de la boca */}
          {open > 0.03 ? (
            <g>
              <ellipse cx={c.mouth.x} cy={c.mouth.y + jawDrop * 0.55} rx={mouthW / 2} ry={2 + jawDrop * 0.75} fill="#3a0d14" />
              <ellipse cx={c.mouth.x} cy={c.mouth.y + jawDrop * 0.95} rx={mouthW * 0.3} ry={2 + jawDrop * 0.35} fill="#e07a86" />
            </g>
          ) : null}
        </svg>
        {/* párpados: el pelo de encima del ojo se desliza hacia abajo (textura real) */}
        {lid > 0.08
          ? c.eyes.map((e, i) => {
              const h = (e.ry * 2 + 4) * lid;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: e.x - e.rx - 2,
                    top: e.y - e.ry - 2,
                    width: e.rx * 2 + 4,
                    height: e.ry * 2 + 4,
                    clipPath: "ellipse(50% 50% at 50% 50%)",
                  }}
                >
                  <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: h, overflow: "hidden", boxShadow: "inset 0 -3px 3px rgba(30,15,5,0.65)" }}>
                    <Img
                      src={staticFile(`characters/${id}/head.png`)}
                      style={{ position: "absolute", left: -(e.x - e.rx - 2), top: h - (e.y - e.ry - 2), width: iw, height: ih, maxWidth: "none" }}
                    />
                  </div>
                </div>
              );
            })
          : null}
        {/* mandíbula inferior */}
        <Img
          src={staticFile(`characters/${id}/jaw.png`)}
          style={{ position: "absolute", left: 0, top: 0, width: iw, height: ih, transform: `translateY(${jawDrop}px)` }}
        />
      </div>
    </div>
  );
};
