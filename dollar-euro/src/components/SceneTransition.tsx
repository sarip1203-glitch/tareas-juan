import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CHARACTERS } from "../config/characters";
import type { TransitionType } from "../episodes/types";

// Transiciones dibujadas como capa encima del corte entre dos planos.
// `t` va de -HALF a +HALF fotogramas alrededor del corte (0 = corte).

export const TRANSITION_HALF = 8;

export const SceneTransition: React.FC<{ type: TransitionType; t: number }> = ({ type, t }) => {
  const p = (t + TRANSITION_HALF) / (TRANSITION_HALF * 2); // 0..1
  if (type === "cut") return null;

  if (type === "flash") {
    const o = interpolate(t, [-TRANSITION_HALF, 0, TRANSITION_HALF], [0, 1, 0]);
    return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #FFFFFF 30%, #FFF2D6 100%)", opacity: o }} />;
  }

  if (type === "whip") {
    // Barrido diagonal con los colores de la serie y líneas de velocidad.
    const x = interpolate(p, [0, 1], [-1700, 1700]);
    return (
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: -600,
            left: x - 300,
            width: 1500,
            height: 3100,
            transform: "rotate(18deg)",
            background: `linear-gradient(90deg, transparent 0%, ${CHARACTERS.dollar.captionColor} 18%, #FFF4DC 50%, ${CHARACTERS.euro.captionColor} 82%, transparent 100%)`,
          }}
        />
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: 140 + i * 180,
              left: x * (1.1 + (i % 3) * 0.15) - 200,
              width: 700,
              height: 10,
              borderRadius: 5,
              background: "rgba(255,255,255,0.8)",
            }}
          />
        ))}
      </AbsoluteFill>
    );
  }

  if (type === "iris") {
    // Se cierra en círculo y se vuelve a abrir.
    const r = interpolate(Math.abs(t), [0, TRANSITION_HALF], [0, 1500]);
    return (
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, transparent ${r}px, #1A0F08 ${r + 2}px)`,
        }}
      />
    );
  }

  // glitch
  const strength = interpolate(Math.abs(t), [0, TRANSITION_HALF], [1, 0]);
  return <GlitchLayer strength={strength} seed={t} />;
};

export const GlitchLayer: React.FC<{ strength: number; seed: number; label?: string }> = ({ strength, seed, label }) => {
  const bars = Array.from({ length: 9 }).map((_, i) => {
    const r = Math.abs(Math.sin((seed + 3) * 12.9898 + i * 78.233)) % 1;
    return { top: r * 1920, h: 20 + r * 120, shift: (r - 0.5) * 220 * strength, color: ["#FF0055", "#00E5FF", "#FFE600"][i % 3] };
  });
  return (
    <AbsoluteFill style={{ opacity: strength, pointerEvents: "none" }}>
      {bars.map((b, i) => (
        <div key={i} style={{ position: "absolute", top: b.top, left: b.shift, width: 1080, height: b.h, background: b.color, mixBlendMode: "screen", opacity: 0.55 }} />
      ))}
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 3px, transparent 3px, transparent 7px)" }} />
      {label ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 64, color: "#fff", background: "#000", padding: "10px 30px", transform: `translateX(${Math.sin(seed) * 14}px)` }}>
            {label}
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
