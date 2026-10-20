import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { CHARACTERS } from "../config/characters";
import { FONTS } from "../config/fonts";
import { SAFE_ZONE } from "../config/video";

// Logo animado de la serie y tarjeta de título del episodio.

const Paw: React.FC<{ size: number; color: string; rot?: number }> = ({ size, color, rot = 0 }) => (
  <svg width={size} height={size} viewBox="-40 -40 80 80" style={{ transform: `rotate(${rot}deg)` }}>
    <g fill={color}>
      <ellipse cx={0} cy={12} rx={18} ry={14} />
      <circle cx={-20} cy={-10} r={8} />
      <circle cx={-7} cy={-22} r={8} />
      <circle cx={8} cy={-22} r={8} />
      <circle cx={21} cy={-10} r={8} />
    </g>
  </svg>
);

export const SeriesLogo: React.FC<{ t: number; dur: number; fps: number }> = ({ t, dur, fps }) => {
  const s = spring({ frame: t, fps, config: { damping: 9, stiffness: 120 } });
  const s2 = spring({ frame: t - 8, fps, config: { damping: 12 } });
  const out = interpolate(t, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wob = Math.sin(t * 0.18) * 2;
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: SAFE_ZONE.top + 120, opacity: out }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,240,200,0.55), rgba(0,0,0,0) 60%)", opacity: s }} />
      <div style={{ transform: `scale(${s}) rotate(${wob - 3}deg)`, textAlign: "center" }}>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: -10 }}>
          <Paw size={70} color={CHARACTERS.dollar.captionColor} rot={-20} />
          <Paw size={70} color={CHARACTERS.euro.captionColor} rot={20} />
        </div>
        <div style={{ fontFamily: FONTS.title, fontSize: 150, lineHeight: 0.95, WebkitTextStroke: "14px #2A160A", paintOrder: "stroke fill", textShadow: "0 14px 0 rgba(42,22,10,0.6)" }}>
          <span style={{ color: CHARACTERS.dollar.captionColor }}>DOLLAR</span>
          <br />
          <span style={{ color: "#FFF4DC", fontSize: 110 }}>&amp; </span>
          <span style={{ color: CHARACTERS.euro.captionColor }}>EURO</span>
        </div>
        <div
          style={{
            marginTop: 26,
            display: "inline-block",
            fontFamily: FONTS.title,
            fontSize: 52,
            color: "#2A160A",
            background: "#FFF4DC",
            borderRadius: 18,
            padding: "6px 28px",
            transform: `scale(${s2}) rotate(2deg)`,
            border: "6px solid #2A160A",
          }}
        >
          ESCUELA PARA HUMANOS
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const EpisodeTitleCard: React.FC<{ t: number; dur: number; fps: number; number: number; title: string }> = ({
  t,
  dur,
  fps,
  number,
  title,
}) => {
  const s = spring({ frame: t, fps, config: { damping: 14, stiffness: 140 } });
  const out = interpolate(t, [dur - 10, dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", paddingTop: SAFE_ZONE.top + 40 }}>
      <div
        style={{
          transform: `translateX(${(1 - s) * -1200 + out * 1200}px) rotate(-2deg)`,
          background: "#2A160A",
          borderRadius: 30,
          padding: "22px 40px 30px",
          maxWidth: 1080 - SAFE_ZONE.left - SAFE_ZONE.right,
          boxShadow: "0 14px 0 rgba(0,0,0,0.35)",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONTS.title, fontSize: 40, color: "#FFD23F", letterSpacing: 4 }}>EPISODIO {number}</div>
        <div style={{ fontFamily: FONTS.title, fontSize: 70, lineHeight: 1.05, color: "#FFF4DC", marginTop: 6 }}>{title.toUpperCase()}</div>
      </div>
    </AbsoluteFill>
  );
};
