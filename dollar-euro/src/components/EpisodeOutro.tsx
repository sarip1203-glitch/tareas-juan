import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHARACTERS } from "../config/characters";
import { FONTS } from "../config/fonts";
import { SAFE_ZONE } from "../config/video";
import { DogRig, NEUTRAL_POSE } from "./character/DogRig";

// Pantalla final: logo, eslogan y avance del próximo capítulo.

export const EpisodeOutro: React.FC<{ nextNumber: number; nextTitle: string }> = ({ nextNumber, nextTitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame, fps, config: { damping: 12 } });
  const b = spring({ frame: frame - 12, fps, config: { damping: 12 } });
  const c = spring({ frame: frame - 24, fps, config: { damping: 10 } });
  const fadeIn = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  const chew = Math.sin(frame * 0.6);

  return (
    <AbsoluteFill style={{ opacity: fadeIn, background: "radial-gradient(circle at 50% 35%, #5A3418 0%, #2A160A 70%)", alignItems: "center" }}>
      {/* huellitas de fondo */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: (i * 211) % 1000,
            top: ((i * 377) % 1700) + 100,
            width: 60,
            height: 60,
            borderRadius: 30,
            background: i % 2 ? CHARACTERS.dollar.captionColor : CHARACTERS.euro.captionColor,
            opacity: 0.08,
            transform: `translateY(${-frame * (0.6 + (i % 3) * 0.3)}px)`,
          }}
        />
      ))}
      <div style={{ marginTop: SAFE_ZONE.top + 40, transform: `scale(${a})`, textAlign: "center" }}>
        <div style={{ fontFamily: FONTS.title, fontSize: 140, lineHeight: 0.95, WebkitTextStroke: "12px #120804", paintOrder: "stroke fill" }}>
          <span style={{ color: CHARACTERS.dollar.captionColor }}>DOLLAR</span>
          <br />
          <span style={{ color: "#FFF4DC", fontSize: 100 }}>&amp; </span>
          <span style={{ color: CHARACTERS.euro.captionColor }}>EURO</span>
        </div>
        <div style={{ fontFamily: FONTS.title, fontSize: 54, color: "#FFF4DC", letterSpacing: 4, marginTop: 18 }}>ESCUELA PARA HUMANOS</div>
      </div>

      <div
        style={{
          marginTop: 60,
          width: 1080 - SAFE_ZONE.left - SAFE_ZONE.right,
          marginLeft: SAFE_ZONE.left - SAFE_ZONE.right,
          transform: `translateY(${(1 - b) * 400}px)`,
          opacity: b,
          background: "#FFF4DC",
          borderRadius: 34,
          border: "7px solid #120804",
          padding: "26px 30px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: FONTS.title, fontSize: 40, color: "#E2372B" }}>PRÓXIMO CAPÍTULO · {nextNumber}</div>
        <div style={{ fontFamily: FONTS.captions, fontWeight: 800, fontSize: 60, lineHeight: 1.1, color: "#2A160A", marginTop: 8 }}>{nextTitle}</div>
      </div>

      {/* adelanto: Euro cachorro con una chancla */}
      <div style={{ position: "absolute", left: 300, top: 1080, width: 330, height: 440, transform: `scale(${c})` }}>
        <DogRig
          uid="outro-euro"
          pose={{ ...NEUTRAL_POSE, open: 0.35 + chew * 0.15, mouthShape: "wide", smile: 0.6, lid: 0.3, headTilt: chew * 6, tail: Math.sin(frame * 0.8) * 25 }}
          palette={CHARACTERS.euro.palette}
          markings={CHARACTERS.euro.markings}
          collarColor={CHARACTERS.euro.collarColor}
          tagLetter={CHARACTERS.euro.tagLetter}
          puppy
          style={{ width: "100%", height: "100%" }}
        />
        <svg width={200} height={120} viewBox="0 0 200 120" style={{ position: "absolute", left: 120, top: 250, transform: `rotate(${-20 + chew * 8}deg)` }}>
          <path d="M10,60 C10,20 60,10 110,20 C170,30 195,50 190,70 C185,95 120,100 60,95 C25,92 10,80 10,60 Z" fill="#3FA9FF" stroke="#0D4A80" strokeWidth={6} />
          <path d="M70,30 C90,60 110,60 130,30" stroke="#FFD23F" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M180,55 l8,-6 l4,10 l8,-4" stroke="#0D4A80" strokeWidth={4} fill="none" />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
