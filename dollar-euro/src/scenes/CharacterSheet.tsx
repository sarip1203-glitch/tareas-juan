import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DogRig, NEUTRAL_POSE } from "../components/character/DogRig";
import { EXPRESSIONS } from "../components/character/pose";
import { CHARACTERS } from "../config/characters";
import { FONTS } from "../config/fonts";
import type { CharacterId, Expression } from "../episodes/types";

// Ficha de personaje: todas las expresiones de un perro, animadas.
// Sirve para revisar identidad visual y expresiones antes de un episodio.

export const CharacterSheet: React.FC<{ id: CharacterId }> = ({ id }) => {
  const frame = useCurrentFrame();
  const cfg = CHARACTERS[id];
  const names = Object.keys(EXPRESSIONS) as Expression[];
  return (
    <AbsoluteFill style={{ background: "#F3E3C9", padding: 40 }}>
      <div style={{ fontFamily: FONTS.title, fontSize: 80, color: cfg.collarColor, WebkitTextStroke: "6px #2A160A", paintOrder: "stroke fill" }}>
        {cfg.name.toUpperCase()}
      </div>
      <div style={{ fontFamily: FONTS.captions, fontWeight: 600, fontSize: 28, color: "#2A160A", marginBottom: 20 }}>
        {cfg.palettesAreProvisional ? "Rig provisional · colores genéricos hasta recibir las fotografías" : "Paleta basada en fotografías"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {names.map((name, i) => {
          const e = EXPRESSIONS[name];
          const t = frame + i * 7;
          const blink = t % 80 < 5 ? 1 : 0;
          return (
            <div key={name} style={{ background: "#FFF8EC", borderRadius: 24, padding: 8, textAlign: "center" }}>
              <DogRig
                uid={`sheet-${id}-${name}`}
                palette={cfg.palette}
                markings={cfg.markings}
                collarColor={cfg.collarColor}
                tagLetter={cfg.tagLetter}
                style={{ width: 300, height: 340 }}
                pose={{
                  ...NEUTRAL_POSE,
                  smile: e.smile,
                  browL: e.brow + e.browAsym * 0.5,
                  browR: e.brow - e.browAsym * 0.5,
                  browAngle: e.browAngle,
                  lid: Math.max(e.lid, blink),
                  lowerLid: e.lowerLid,
                  pupilScale: e.pupilScale,
                  earL: e.ear + e.earAsym,
                  earR: e.ear - e.earAsym,
                  earBack: e.earBack,
                  headTilt: e.tilt + Math.sin(t * 0.08) * 2,
                  headY: e.chin,
                  open: e.mouthBase,
                  mouthShape: e.mouthBaseShape,
                  tongue: e.tongue,
                  blush: e.blush,
                  tail: Math.sin(t * 0.3 * (1 + e.wag)) * (5 + e.wag * 11),
                  breath: 0.5 + 0.5 * Math.sin(t * 0.2),
                }}
              />
              <div style={{ fontFamily: FONTS.captions, fontWeight: 800, fontSize: 30, color: "#2A160A" }}>{name}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
