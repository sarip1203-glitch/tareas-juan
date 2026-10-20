import React from "react";
import { Img, staticFile } from "remotion";
import { CHARACTERS } from "../config/characters";
import { FONTS } from "../config/fonts";
import { hasAsset } from "../utils/assets";

// Set del programa: sala familiar convertida en estudio. Mundo 1080×1920.
// Si existe public/backgrounds/estudio.png se usa como fondo en lugar del
// set dibujado (los muebles del primer plano se mantienen).

type Props = {
  frame: number;
  blur: number; // desenfoque de profundidad del fondo (px)
  tone?: "present" | "flashback";
  showDesk?: boolean;
};

const BG_IMAGE = "backgrounds/estudio.png";

const Bulbs: React.FC<{ x: number; y: number; w: number; h: number; frame: number }> = ({ x, y, w, h, frame }) => {
  const out: React.ReactNode[] = [];
  const step = 34;
  let i = 0;
  const push = (cx: number, cy: number) => {
    const on = (Math.floor(frame / 6) + i) % 3 !== 0;
    out.push(<circle key={i} cx={cx} cy={cy} r={7} fill={on ? "#FFE9A8" : "#9a7a45"} opacity={on ? 1 : 0.7} />);
    i++;
  };
  for (let px = x; px <= x + w; px += step) push(px, y);
  for (let py = y + step; py <= y + h; py += step) push(x + w, py);
  for (let px = x + w - step; px >= x; px -= step) push(px, y + h);
  for (let py = y + h - step; py > y; py -= step) push(x, py);
  return <g>{out}</g>;
};

export const StudioSet: React.FC<Props> = ({ frame, blur, tone = "present", showDesk = true }) => {
  const fb = tone === "flashback";
  const wallTop = fb ? "#FBE9CF" : "#F2D3A6";
  const wallBottom = fb ? "#F4D7B5" : "#DDAE7C";
  const sofa = fb ? "#6FA8A3" : "#2F6D72";
  const sofaDark = fb ? "#4F8984" : "#1F5054";
  const flicker = 0.92 + 0.08 * Math.sin(frame * 0.21) * Math.sin(frame * 0.053);
  const useBg = hasAsset(BG_IMAGE);

  return (
    <div style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }}>
      {/* el piso continúa más allá del borde del mundo (planos con zoom) */}
      <div style={{ position: "absolute", left: -400, top: 1880, width: 1880, height: 800, background: "#6E4326" }} />
      {/* FONDO (desenfocado) */}
      <div style={{ position: "absolute", inset: 0, filter: blur > 0.1 ? `blur(${blur}px)` : undefined }}>
        {useBg ? (
          <Img src={staticFile(BG_IMAGE)} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
        ) : (
          <svg width={1080} height={1920} viewBox="0 0 1080 1920">
            <defs>
              <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={wallTop} />
                <stop offset="1" stopColor={wallBottom} />
              </linearGradient>
              <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0" stopColor="#FFE2A0" stopOpacity={0.9} />
                <stop offset="1" stopColor="#FFE2A0" stopOpacity={0} />
              </radialGradient>
              <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#9FD3F0" />
                <stop offset="1" stopColor="#FCE4B8" />
              </linearGradient>
              <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8E5B33" />
                <stop offset="1" stopColor="#6B4022" />
              </linearGradient>
            </defs>
            {/* pared */}
            <rect width={1080} height={1320} fill="url(#wall)" />
            {/* friso de madera */}
            <rect y={1060} width={1080} height={260} fill="#B97C4C" />
            {Array.from({ length: 9 }).map((_, i) => (
              <rect key={i} x={20 + i * 120} y={1085} width={96} height={210} rx={6} fill="none" stroke="#9C6338" strokeWidth={5} />
            ))}
            {/* ventana con montañas de Medellín */}
            <g transform="translate(40 560)">
              <rect width={300} height={400} rx={10} fill="url(#sky)" />
              <path d="M0,300 C60,240 110,270 160,220 C210,180 250,230 300,200 L300,400 L0,400 Z" fill="#7FAF7A" />
              <path d="M0,340 C70,300 140,330 200,300 C240,285 270,300 300,290 L300,400 L0,400 Z" fill="#5E9460" />
              {Array.from({ length: 14 }).map((_, i) => (
                <rect key={i} x={12 + (i % 7) * 40} y={330 + Math.floor(i / 7) * 26} width={14} height={18} fill="#F5E6C8" opacity={0.85} />
              ))}
              <rect width={300} height={400} rx={10} fill="none" stroke="#FFF6E6" strokeWidth={16} />
              <rect x={142} width={16} height={400} fill="#FFF6E6" />
              <rect y={192} width={300} height={16} fill="#FFF6E6" />
              {/* cortinas */}
              <path d="M-30,-30 C10,120 -10,300 20,440 L-50,440 L-50,-30 Z" fill="#E07A4F" />
              <path d="M330,-30 C290,120 310,300 280,440 L350,440 L350,-30 Z" fill="#E07A4F" />
            </g>
            {/* cuadros con huellas */}
            {[
              [800, 620, 150, 120, "#F7C873"],
              [960, 600, 90, 110, "#8FC1E3"],
              [400, 660, 110, 90, "#E9967A"],
            ].map(([x, y, w, h, c], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <rect width={w as number} height={h as number} fill="#5B3A22" rx={4} />
                <rect x={10} y={10} width={(w as number) - 20} height={(h as number) - 20} fill={c as string} />
                <g transform={`translate(${(w as number) / 2} ${(h as number) / 2}) scale(${(h as number) / 140})`} fill="#5B3A22" opacity={0.7}>
                  <ellipse cx={0} cy={12} rx={18} ry={14} />
                  <circle cx={-20} cy={-10} r={8} />
                  <circle cx={-7} cy={-22} r={8} />
                  <circle cx={8} cy={-22} r={8} />
                  <circle cx={21} cy={-10} r={8} />
                </g>
              </g>
            ))}
            {/* lámpara de pie */}
            <circle cx={980} cy={900} r={210 * flicker} fill="url(#lampGlow)" />
            <rect x={972} y={930} width={14} height={420} fill="#4A3424" />
            <path d="M920,930 L1040,930 L1010,840 L950,840 Z" fill="#F6E3B4" />
            {/* letrero ON AIR */}
            <g transform="translate(560 640)">
              <rect width={170} height={64} rx={14} fill="#3A1414" />
              <rect x={6} y={6} width={158} height={52} rx={10} fill={fb ? "#7a3a3a" : "#E2372B"} opacity={fb ? 0.6 : flicker} />
              <text x={85} y={44} textAnchor="middle" fontSize={32} fontFamily={FONTS.title} fill="#FFF3E0">
                {fb ? "HACE TIEMPO" : "AL AIRE"}
              </text>
            </g>
          </svg>
        )}
      </div>

      {/* LETRERO DE LA SERIE (más nítido que el fondo) */}
      <div style={{ position: "absolute", inset: 0, filter: blur > 0.1 ? `blur(${blur * 0.6}px)` : undefined }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <g transform="translate(150 300)">
            <rect x={-10} y={-10} width={800} height={260} rx={30} fill="#3B2414" />
            <rect width={780} height={240} rx={24} fill="url(#signWood)" />
            <defs>
              <linearGradient id="signWood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#A86B3C" />
                <stop offset="1" stopColor="#7A4A26" />
              </linearGradient>
            </defs>
            <Bulbs x={24} y={22} w={732} h={196} frame={frame} />
            <text x={390} y={142} textAnchor="middle" fontSize={92} fontFamily={FONTS.title} fill="#FFF4DC" stroke="#3B2414" strokeWidth={6} paintOrder="stroke">
              <tspan fill={CHARACTERS.dollar.captionColor}>DOLLAR</tspan>
              <tspan fill="#FFF4DC"> &amp; </tspan>
              <tspan fill={CHARACTERS.euro.captionColor}>EURO</tspan>
            </text>
            <text x={390} y={196} textAnchor="middle" fontSize={34} fontFamily={FONTS.title} fill="#FFE7B8" letterSpacing={6}>
              ESCUELA PARA HUMANOS
            </text>
          </g>
        </svg>
      </div>

      {/* SOFÁ, PISO, ALFOMBRA, CAMAS (nítidos) */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9A6640" />
            <stop offset="1" stopColor="#6E4326" />
          </linearGradient>
          <radialGradient id="rug" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#F2D9B8" />
            <stop offset="0.7" stopColor="#E7C39A" />
            <stop offset="1" stopColor="#C9885A" />
          </radialGradient>
        </defs>
        {/* piso de madera */}
        <rect y={1320} width={1080} height={600} fill="url(#floor)" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1={540 + (i - 6) * 40} y1={1320} x2={540 + (i - 6) * 210} y2={1920} stroke="#5E3820" strokeWidth={3} opacity={0.35} />
        ))}
        {/* sofá */}
        <g>
          <rect x={10} y={880} width={1060} height={300} rx={60} fill={sofaDark} />
          <rect x={40} y={900} width={1000} height={250} rx={50} fill={sofa} />
          <rect x={-20} y={1080} width={1120} height={200} rx={50} fill={sofa} />
          <rect x={-40} y={980} width={150} height={320} rx={60} fill={sofaDark} />
          <rect x={970} y={980} width={150} height={320} rx={60} fill={sofaDark} />
          {/* cojines */}
          <rect x={120} y={930} width={210} height={170} rx={40} fill="#E8A33D" transform="rotate(-8 225 1015)" />
          <rect x={760} y={930} width={210} height={170} rx={40} fill="#D9674A" transform="rotate(7 865 1015)" />
          <rect x={-10} y={1290} width={1100} height={36} fill="#1F4044" opacity={0.6} />
        </g>
        {/* mesita con micrófono */}
        {showDesk ? (
          <g transform="translate(540 1330)">
            <ellipse cx={0} cy={150} rx={110} ry={16} fill="#000" opacity={0.25} />
            <rect x={-90} y={20} width={180} height={22} rx={8} fill="#7B4A28" />
            <rect x={-80} y={42} width={14} height={110} fill="#5C351C" />
            <rect x={66} y={42} width={14} height={110} fill="#5C351C" />
            <rect x={-5} y={-70} width={10} height={92} fill="#333" />
            <rect x={-26} y={-150} width={52} height={90} rx={26} fill="#4b4b4f" />
            {Array.from({ length: 5 }).map((_, i) => (
              <line key={i} x1={-22} y1={-135 + i * 14} x2={22} y2={-135 + i * 14} stroke="#77777c" strokeWidth={3} />
            ))}
            <rect x={-30} y={-80} width={60} height={14} rx={6} fill="#2a2a2d" />
          </g>
        ) : null}
        {/* alfombra */}
        <ellipse cx={540} cy={1640} rx={640} ry={240} fill="url(#rug)" />
        <ellipse cx={540} cy={1640} rx={560} ry={200} fill="none" stroke="#C0704A" strokeWidth={10} strokeDasharray="30 18" />
        <ellipse cx={540} cy={1640} rx={420} ry={140} fill="none" stroke="#5E9C95" strokeWidth={8} />
        {/* camas: azul (Dollar) y amarilla (Euro) */}
        <g transform="translate(-40 1570)">
          <ellipse cx={120} cy={70} rx={190} ry={70} fill={fb ? "#6EA7DD" : "#2E6FB8"} />
          <ellipse cx={120} cy={60} rx={140} ry={42} fill="#BFD9F2" />
        </g>
        <g transform="translate(880 1570)">
          <ellipse cx={120} cy={70} rx={190} ry={70} fill={fb ? "#F4D873" : "#E1A915"} />
          <ellipse cx={120} cy={60} rx={140} ry={42} fill="#FFF0BF" />
        </g>
        {/* juguetes */}
        <g transform="translate(560 1720)">
          <circle r={34} fill="#E5413A" />
          <path d="M-34,0 C-12,-20 12,20 34,0" stroke="#fff" strokeWidth={6} fill="none" />
        </g>
        <g transform="translate(160 1790) rotate(-18)">
          <rect x={-60} y={-12} width={120} height={24} rx={12} fill="#F3EEE4" />
          <circle cx={-60} cy={-12} r={18} fill="#F3EEE4" />
          <circle cx={-60} cy={12} r={18} fill="#F3EEE4" />
          <circle cx={60} cy={-12} r={18} fill="#F3EEE4" />
          <circle cx={60} cy={12} r={18} fill="#F3EEE4" />
        </g>
        <g transform="translate(900 1820) rotate(12)">
          <path d="M-80,0 C-40,-20 40,20 80,0" stroke="#3E8ED0" strokeWidth={22} strokeLinecap="round" fill="none" />
          <path d="M-80,0 C-40,-20 40,20 80,0" stroke="#F2C230" strokeWidth={22} strokeDasharray="14 14" strokeLinecap="round" fill="none" />
        </g>
      </svg>
    </div>
  );
};
