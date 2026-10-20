import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { FONTS } from "../../config/fonts";

// Gags visuales anclados a la cabeza de un personaje (coordenadas del mundo).
// `t` = fotograma local del gag, `dur` = duración en fotogramas.

type GagProps = { x: number; y: number; t: number; dur: number; fps: number };

const popIn = (t: number, dur: number, fps: number) => {
  const inS = spring({ frame: t, fps, config: { damping: 11, stiffness: 160 } });
  const out = interpolate(t, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return inS * out;
};

// Burbuja de pensamiento: Euro soñando con una piscina.
export const PoolDream: React.FC<GagProps> = ({ x, y, t, dur, fps }) => {
  const s = popIn(t, dur, fps);
  const wave = Math.sin(t * 0.25) * 6;
  const bx = x - 300;
  const by = y - 520;
  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}
    >
      <g opacity={Math.min(1, s * 1.4)}>
        <circle cx={x - 40} cy={y - 150} r={16 * s} fill="#fff" />
        <circle cx={x - 90} cy={y - 210} r={24 * s} fill="#fff" />
        <g transform={`translate(${bx + 210} ${by + 160}) scale(${s}) translate(${-210} ${-160})`}>
          <path
            d="M40,80 C10,20 90,-20 150,10 C190,-30 280,-20 300,20 C380,0 430,60 400,120 C440,170 400,250 330,240 C300,300 190,300 160,260 C100,300 20,260 30,200 C-20,170 -10,100 40,80 Z"
            fill="#fff"
            stroke="#d8e6f0"
            strokeWidth={6}
          />
          <clipPath id="poolClip">
            <rect x={70} y={70} width={290} height={170} rx={30} />
          </clipPath>
          <g clipPath="url(#poolClip)">
            <rect x={70} y={70} width={290} height={170} fill="#4FC3F7" />
            <path d={`M70,${120 + wave} C120,${100 - wave} 170,${140 + wave} 220,${120 - wave} C270,${100 + wave} 320,${140 - wave} 360,${120}`} stroke="#B3E5FC" strokeWidth={8} fill="none" />
            <path d={`M70,${180 - wave} C120,${160 + wave} 170,${200 - wave} 220,${180 + wave} C270,${160 - wave} 320,${200 + wave} 360,${180}`} stroke="#B3E5FC" strokeWidth={8} fill="none" />
            {/* flotador */}
            <g transform={`translate(${250 + wave} ${150 - wave * 0.5})`}>
              <circle r={36} fill="#FF7043" />
              <circle r={16} fill="#4FC3F7" />
              <path d="M-36,0 A36,36 0 0 1 0,-36" stroke="#fff" strokeWidth={14} fill="none" />
              <path d="M36,0 A36,36 0 0 1 0,36" stroke="#fff" strokeWidth={14} fill="none" />
            </g>
            {/* patico de hule */}
            <g transform={`translate(${140 - wave} ${190 + wave * 0.4})`}>
              <ellipse rx={30} ry={18} fill="#FFD54F" />
              <circle cx={18} cy={-20} r={15} fill="#FFD54F" />
              <path d="M30,-20 L44,-16 L30,-12 Z" fill="#FF8F00" />
              <circle cx={22} cy={-24} r={3} fill="#222" />
            </g>
          </g>
          <circle cx={340} cy={60} r={26} fill="#FFCA28" />
        </g>
      </g>
    </svg>
  );
};

// Gota de sudor que resbala.
export const SweatDrop: React.FC<GagProps> = ({ x, y, t, dur, fps }) => {
  const s = popIn(t, dur, fps);
  const cycle = (t % 24) / 24;
  const dy = Easing.in(Easing.quad)(cycle) * 50;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x + 92} ${y - 120 + dy}) scale(${s * 1.2})`} opacity={1 - cycle * 0.6}>
        <path d="M0,-28 C10,-10 18,0 18,10 C18,22 9,30 0,30 C-9,30 -18,22 -18,10 C-18,0 -10,-10 0,-28 Z" fill="#7FD3FF" stroke="#2E8BC0" strokeWidth={3} />
        <ellipse cx={-6} cy={8} rx={4} ry={7} fill="#fff" opacity={0.8} />
      </g>
    </svg>
  );
};

// Corazones que suben.
export const Hearts: React.FC<GagProps> = ({ x, y, t, dur, fps }) => {
  const items = [0, 1, 2, 3, 4];
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {items.map((i) => {
        const lt = t - i * 5;
        if (lt < 0) return null;
        const p = Math.min(1, lt / (fps * 1.4));
        const s = spring({ frame: lt, fps, config: { damping: 9 } });
        const hx = x + (i - 2) * 46 + Math.sin(lt * 0.2 + i) * 14;
        const hy = y - 140 - p * 220;
        const o = interpolate(p, [0, 0.7, 1], [1, 1, 0]) * interpolate(t, [dur - 6, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <path
            key={i}
            transform={`translate(${hx} ${hy}) scale(${s * (0.9 + (i % 2) * 0.4)})`}
            d="M0,10 C-30,-14 -20,-38 0,-24 C20,-38 30,-14 0,10 Z"
            fill={i % 2 ? "#FF6F91" : "#FF4D6D"}
            opacity={o}
          />
        );
      })}
    </svg>
  );
};

// Signos de pregunta (confusión).
export const QuestionMarks: React.FC<GagProps> = ({ x, y, t, dur, fps }) => {
  const s = popIn(t, dur, fps);
  return (
    <div style={{ position: "absolute", left: x + 60, top: y - 260, transform: `scale(${s}) rotate(${Math.sin(t * 0.2) * 8}deg)`, fontFamily: FONTS.title, fontSize: 110, color: "#FFD23F", WebkitTextStroke: "6px #3B2414" }}>
      ?
    </div>
  );
};
