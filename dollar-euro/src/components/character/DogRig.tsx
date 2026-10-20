import React from "react";
import type { FurPalette, Markings } from "../../config/characters";

// Rig 2.5D provisional de pastor de Shetland, dibujado en SVG.
// Sistema de coordenadas: viewBox 0 0 600 800, base de las patas en y≈780.
// Todo el rig se controla con `DogPose`; no hay animación interna aquí.

export type MouthShape = "closed" | "wide" | "round" | "narrow";

export type DogPose = {
  open: number; // 0..1 apertura de mandíbula
  mouthShape: MouthShape;
  smile: number; // -1 (triste) .. 1 (sonrisa)
  browL: number; // -1..1 subir/bajar ceja izquierda (de pantalla)
  browR: number;
  browAngle: number; // -1 tristeza .. 1 enojo
  lid: number; // 0 abierto .. 1 cerrado (párpado superior)
  lowerLid: number; // 0..1
  pupilX: number; // -1..1
  pupilY: number; // -1..1
  pupilScale: number;
  headTilt: number; // grados
  headTurn: number; // -1..1 (desplaza rasgos)
  headX: number;
  headY: number;
  earL: number; // grados
  earR: number;
  earBack: number; // 0..1 orejas hacia atrás
  tail: number; // grados
  breath: number; // 0..1
  pawL: number; // 0..1 levantar pata izquierda (de pantalla)
  pawR: number;
  tongue: number; // 0..1 lengua afuera
  blush: number;
};

export const NEUTRAL_POSE: DogPose = {
  open: 0,
  mouthShape: "closed",
  smile: 0.2,
  browL: 0,
  browR: 0,
  browAngle: 0,
  lid: 0.1,
  lowerLid: 0,
  pupilX: 0,
  pupilY: 0,
  pupilScale: 1,
  headTilt: 0,
  headTurn: 0,
  headX: 0,
  headY: 0,
  earL: 0,
  earR: 0,
  earBack: 0,
  tail: 0,
  breath: 0,
  pawL: 0,
  pawR: 0,
  tongue: 0,
  blush: 0,
};

type Props = {
  uid: string;
  pose: DogPose;
  palette: FurPalette;
  markings: Markings;
  collarColor: string;
  tagLetter: string;
  puppy?: boolean;
  style?: React.CSSProperties;
};

// Ojo almendrado (centro en 0,0). El lado externo apunta hacia arriba.
const EYE_PATH = "M-25,3 C-17,-15 13,-17 25,-5 C17,12 -13,15 -25,3 Z";
// Ojo redondo (Euro).
const ROUND_EYE_PATH = "M-22,0 C-22,-17 22,-19 23,-2 C23,15 -21,17 -22,0 Z";
// Oreja semierecta con punta doblada (base en 0,0).
const EAR_PATH = "M-40,12 C-44,-40 -32,-86 -16,-118 C-2,-92 20,-52 34,4 Z";
const EAR_INNER = "M-26,4 C-28,-34 -22,-66 -14,-86 C-4,-62 10,-34 18,2 Z";
const EAR_FOLD = "M-31,-70 C-26,-92 -20,-108 -16,-118 C-6,-104 4,-88 10,-74 C-2,-60 -18,-58 -31,-70 Z";

const Eye: React.FC<{
  uid: string;
  side: "L" | "R";
  pose: DogPose;
  palette: FurPalette;
  puppy: boolean;
  round: boolean;
}> = ({ uid, side, pose, palette, puppy, round }) => {
  const shape = round ? ROUND_EYE_PATH : EYE_PATH;
  const mirror = side === "R" ? -1 : 1;
  const clipId = `${uid}-eye-${side}`;
  const s = puppy ? 1.32 : 1;
  const px = pose.pupilX * 7 * mirror;
  const py = pose.pupilY * 5;
  const lid = Math.min(1, Math.max(0, pose.lid));
  const lower = Math.min(1, Math.max(0, pose.lowerLid));
  return (
    <g transform={`scale(${mirror * s}, ${s})`}>
      <defs>
        <clipPath id={clipId}>
          <path d={shape} />
        </clipPath>
        <radialGradient id={`${clipId}-iris`} cx="0.45" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#8a5a2b" />
          <stop offset="0.55" stopColor={palette.iris} />
          <stop offset="1" stopColor="#1a0d05" />
        </radialGradient>
      </defs>
      <path d={shape} fill="#1a0f0a" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx={px} cy={py} r={15} fill={`url(#${clipId}-iris)`} />
        <circle cx={px} cy={py} r={7.5 * pose.pupilScale} fill="#050302" />
        <circle cx={px - 5} cy={py - 6} r={4.2} fill="#fff" opacity={0.95} />
        <circle cx={px + 5} cy={py + 4} r={1.8} fill="#fff" opacity={0.7} />
        {/* párpado superior */}
        <rect x={-30} y={-22} width={60} height={4 + lid * 36} fill={palette.faceDark} />
        {/* párpado inferior */}
        <rect x={-30} y={18 - lower * 22} width={60} height={30} fill={palette.face} />
      </g>
      <path d={shape} fill="none" stroke="#120a06" strokeWidth={3.4} />
    </g>
  );
};

export const DogRig: React.FC<Props> = ({
  uid,
  pose,
  palette: p,
  markings: m,
  collarColor,
  tagLetter,
  puppy = false,
  style,
}) => {
  const turn = pose.headTurn * 12;
  const breathScale = 1 + pose.breath * 0.018;
  const earBackRot = pose.earBack * 32;
  const earBackScale = 1 - pose.earBack * 0.22;
  const open = Math.max(0, Math.min(1, pose.open));
  const shapeW =
    pose.mouthShape === "wide" ? 7 : pose.mouthShape === "round" ? -5 : pose.mouthShape === "narrow" ? -2 : 0;
  const smileY = pose.smile * 7;
  const jawDrop = open * 24;
  const bodyScale = puppy ? 0.78 : 1;
  const headScale = puppy ? 1.18 : 1;

  // Pata delantera (pivote en el hombro). Positivo = levantar.
  const leg = (side: "L" | "R", raise: number) => {
    const x = side === "L" ? 252 : 348;
    const rot = side === "L" ? raise * 118 : -raise * 118;
    return (
      <g transform={`rotate(${rot}, ${x}, 520)`}>
        <path
          d={`M${x - 33},500 C${x - 36},600 ${x - 32},690 ${x - 28},760 L${x + 28},760 C${x + 32},690 ${x + 36},600 ${x + 33},500 Z`}
          fill={`url(#${uid}-white)`}
          filter={furSoft}
        />
        {m.legs === "socks" ? (
          <path
            d={`M${x - 33},500 C${x - 36},560 ${x - 34},610 ${x - 31},650 C${x - 10},640 ${x + 12},662 ${x + 32},646 C${x + 35},600 ${x + 36},560 ${x + 33},500 Z`}
            fill={p.face}
            filter={furSoft}
          />
        ) : null}
        <path
          d={`M${x + 14},520 C${x + 18},610 ${x + 18},690 ${x + 20},758`}
          stroke={p.whiteShade}
          strokeWidth={6}
          fill="none"
          opacity={0.6}
        />
        <ellipse cx={x} cy={766} rx={38} ry={20} fill={p.white} />
        <path
          d={`M${x - 12},758 L${x - 12},780 M${x + 12},758 L${x + 12},780`}
          stroke={p.whiteShade}
          strokeWidth={3}
          strokeLinecap="round"
        />
      </g>
    );
  };

  // Mechones de pelo para dar textura.
  const strands = (
    cx: number,
    cy: number,
    w: number,
    h: number,
    color: string,
    count: number,
    seed: number,
  ) => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < count; i++) {
      const a = (Math.sin(seed * 97.3 + i * 12.9898) * 43758.5453) % 1;
      const b = (Math.sin(seed * 41.7 + i * 78.233) * 12543.123) % 1;
      const x = cx + (Math.abs(a) - 0.5) * w;
      const y = cy + (Math.abs(b) - 0.5) * h;
      const dx = (x - cx) * 0.08;
      out.push(
        <path
          key={i}
          d={`M${x},${y} q${dx + 3},10 ${dx * 2},22`}
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          fill="none"
          opacity={0.45}
        />,
      );
    }
    return out;
  };

  const fur = `url(#${uid}-fur)`;
  const furSoft = `url(#${uid}-fursoft)`;

  return (
    <svg viewBox="0 0 600 800" style={{ overflow: "visible", ...style }}>
      <defs>
        <filter id={`${uid}-fur`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={7} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={14} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`${uid}-fursoft`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves={2} seed={3} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={7} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id={`${uid}-coat`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor={p.coatLight} />
          <stop offset="0.55" stopColor={p.coat} />
          <stop offset="1" stopColor={p.coatDark} />
        </radialGradient>
        <radialGradient id={`${uid}-mane`} cx="0.5" cy="0.3" r="0.75">
          <stop offset="0" stopColor={p.maneLight} />
          <stop offset="0.6" stopColor={p.mane} />
          <stop offset="1" stopColor={p.coatDark} />
        </radialGradient>
        <radialGradient id={`${uid}-face`} cx="0.5" cy="0.62" r="0.62">
          <stop offset="0" stopColor={p.faceLight} />
          <stop offset="0.55" stopColor={p.face} />
          <stop offset="1" stopColor={p.faceDark} />
        </radialGradient>
        <linearGradient id={`${uid}-muzzle`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.face} />
          <stop offset="0.45" stopColor={p.muzzle} />
          <stop offset="0.8" stopColor={p.faceLight} />
          <stop offset="1" stopColor={p.chin} />
        </linearGradient>
        <radialGradient id={`${uid}-white`} cx="0.5" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.6" stopColor={p.white} />
          <stop offset="1" stopColor={p.whiteShade} />
        </radialGradient>
        <radialGradient id={`${uid}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity={0.35} />
          <stop offset="1" stopColor="#000" stopOpacity={0} />
        </radialGradient>
      </defs>

      {/* sombra en el piso */}
      <ellipse cx={300} cy={782} rx={250 * bodyScale} ry={30} fill={`url(#${uid}-shadow)`} />

      <g transform={`translate(300 780) scale(${bodyScale} ${bodyScale * breathScale}) translate(-300 -780)`}>
        {/* cola */}
        <g transform={`rotate(${pose.tail}, 420, 700)`}>
          <path
            d="M410,712 C470,720 530,690 552,630 C566,590 560,548 540,520 C552,575 520,640 470,660 C448,668 428,680 410,690 Z"
            fill={`url(#${uid}-coat)`}
            filter={fur}
          />
          {m.tailTip ? (
            <path d="M540,520 C556,540 566,575 556,612 C548,590 544,560 528,536 Z" fill={p.white} filter={furSoft} />
          ) : null}
        </g>

        {/* cuartos traseros */}
        <ellipse cx={300} cy={668} rx={208} ry={112} fill={`url(#${uid}-coat)`} filter={fur} />
        <ellipse cx={142} cy={770} rx={46} ry={19} fill={p.white} />
        <ellipse cx={458} cy={770} rx={46} ry={19} fill={p.white} />

        {/* torso */}
        {strands(300, 660, 360, 110, p.coatDark, 26, 2)}
        <ellipse cx={300} cy={700} rx={80} ry={70} fill={p.coatDark} opacity={0.55} filter={fur} />

        {/* patas delanteras */}
        {leg("L", pose.pawL)}
        {leg("R", pose.pawR)}

        {/* melena (collar de pelo sable) */}
        <path
          d="M300,250 C405,250 474,320 466,430 C460,500 430,560 390,600 L210,600 C170,560 140,500 134,430 C130,320 195,250 300,250 Z"
          fill={`url(#${uid}-mane)`}
          filter={fur}
        />
        {/* pechera blanca */}
        <g transform={`translate(300 0) scale(${m.ruffWidth} 1) translate(-300 0)`}>
        <path
          d="M300,320 C372,320 424,370 424,460 C424,520 410,580 392,630 L370,605 L350,652 L326,618 L300,668 L274,618 L250,652 L230,605 L208,630 C190,580 176,520 176,460 C180,370 230,320 300,320 Z"
          fill={`url(#${uid}-white)`}
          filter={fur}
        />
        {strands(300, 490, 210, 250, p.whiteShade, 34, 5)}
        </g>

        {/* collar identificador */}
        <path d="M212,402 Q300,446 388,402" stroke={collarColor} strokeWidth={15} fill="none" strokeLinecap="round" />
        <path d="M212,396 Q300,440 388,396" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={3} fill="none" />
        <circle cx={300} cy={448} r={17} fill="#F1D27A" stroke="#a8862e" strokeWidth={3} />
        <text x={300} y={455} fontSize={18} fontWeight={800} textAnchor="middle" fill="#6b4e12" fontFamily="sans-serif">
          {tagLetter}
        </text>
      </g>

      {/* cabeza */}
      <g
        transform={`translate(${pose.headX} ${pose.headY + (puppy ? 38 : -16)}) rotate(${pose.headTilt} 300 340) translate(300 340) scale(${headScale}) translate(-300 -340)`}
      >
        {/* orejas */}
        <g transform={`translate(${232 + turn * 0.5} 172) rotate(${-pose.earL - earBackRot}) scale(1 ${earBackScale})`}>
          <path d={EAR_PATH} fill={`url(#${uid}-mane)`} filter={fur} transform="scale(1.28 1.05)" />
          <path d={EAR_INNER} fill={p.innerEar} opacity={0.7} filter={furSoft} transform="scale(1.2 1)" />
          <path d={EAR_FOLD} fill={p.coatDark} opacity={0.85} transform={puppy ? "translate(4 8) scale(1.1)" : undefined} />
        </g>
        <g transform={`translate(${368 + turn * 0.5} 172) scale(-1 1) rotate(${-pose.earR - earBackRot}) scale(1 ${earBackScale})`}>
          <path d={EAR_PATH} fill={`url(#${uid}-mane)`} filter={fur} transform="scale(1.28 1.05)" />
          <path d={EAR_INNER} fill={p.innerEar} opacity={0.7} filter={furSoft} transform="scale(1.2 1)" />
          <path d={EAR_FOLD} fill={p.coatDark} opacity={0.85} transform={puppy ? "translate(4 8) scale(1.1)" : undefined} />
        </g>

        {/* mejillas peludas */}
        <path
          d="M206,170 C150,220 142,320 196,350 C222,362 242,338 250,312 L246,196 Z"
          fill={`url(#${uid}-mane)`}
          filter={fur}
        />
        <path
          d="M394,170 C450,220 458,320 404,350 C378,362 358,338 350,312 L354,196 Z"
          fill={`url(#${uid}-mane)`}
          filter={fur}
        />

        {/* cráneo */}
        <path
          d="M300,122 C362,122 398,154 406,204 C414,248 398,282 372,306 C352,326 338,344 332,360 L268,360 C262,344 248,326 228,306 C202,282 186,248 194,204 C202,154 238,122 300,122 Z"
          fill={`url(#${uid}-face)`}
          filter={furSoft}
        />
        {/* textura de pelo en la cara */}
        {strands(300 + turn * 0.5, 215, 190, 120, p.faceDark, 22, 9)}
        {/* sombra oscura de la frente y alrededor de los ojos */}
        <ellipse cx={300 + turn * 0.4} cy={160} rx={70} ry={34} fill={p.faceDark} opacity={0.45} filter={furSoft} />
        <g transform={`translate(${turn} 0)`}>
          {/* lista blanca (solo si el perro la tiene) */}
          <path
            display={m.blaze ? undefined : "none"}
            d="M300,138 C308,138 310,170 310,200 C310,232 322,258 336,280 L264,280 C278,258 290,232 290,200 C290,170 292,138 300,138 Z"
            fill={p.white}
            opacity={0.95}
          />
          {/* hocico */}
          <path
            d="M270,258 C280,246 320,246 330,258 C342,286 345,318 337,342 C327,362 273,362 263,342 C255,318 258,286 270,258 Z"
            fill={`url(#${uid}-muzzle)`}
            filter={furSoft}
          />

          {/* interior de la boca */}
          {open > 0.02 ? (
            <g>
              <ellipse cx={300} cy={346 + jawDrop * 0.45} rx={19 + shapeW} ry={3 + jawDrop * 0.55} fill="#4a1620" />
              <ellipse cx={300} cy={352 + jawDrop * 0.75} rx={12 + shapeW * 0.5} ry={5 + open * 4} fill="#e2737f" />
            </g>
          ) : null}
          {/* lengua afuera */}
          {pose.tongue > 0.05 ? (
            <path
              d={`M290,350 C290,${360 + pose.tongue * 26 + jawDrop} 310,${360 + pose.tongue * 26 + jawDrop} 310,350 Z`}
              fill="#e66b78"
              stroke="#b9485a"
              strokeWidth={1.5}
            />
          ) : null}
          {/* mandíbula inferior */}
          <ellipse cx={300} cy={356 + jawDrop} rx={23} ry={10} fill={p.chin} />
          {/* labio superior y línea de la boca */}
          <path
            d={`M300,330 L300,341 Q${291 - shapeW * 0.3},${348 - smileY * 0.4} ${280 - shapeW * 0.6},${343 - smileY} M300,341 Q${309 + shapeW * 0.3},${348 - smileY * 0.4} ${320 + shapeW * 0.6},${343 - smileY}`}
            stroke="#2a1712"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          {/* nariz */}
          <path d="M281,312 C281,302 319,302 319,312 C319,322 306,332 300,332 C294,332 281,322 281,312 Z" fill={p.nose} />
          <ellipse cx={294} cy={309} rx={6} ry={3} fill="#fff" opacity={0.35} />

          {/* rubor */}
          {pose.blush > 0.02 ? (
            <g opacity={pose.blush * 0.6}>
              <ellipse cx={232} cy={282} rx={18} ry={9} fill="#ff8c94" />
              <ellipse cx={368} cy={282} rx={18} ry={9} fill="#ff8c94" />
            </g>
          ) : null}

          {/* ojos */}
          <g transform="translate(254 230) rotate(8)">
            <Eye uid={uid} side="L" pose={pose} palette={p} puppy={puppy} round={m.eyes === "round"} />
          </g>
          <g transform="translate(346 230) rotate(-8)">
            <Eye uid={uid} side="R" pose={pose} palette={p} puppy={puppy} round={m.eyes === "round"} />
          </g>

          {/* cejas */}
          <g transform={`translate(254 ${204 - pose.browL * 9 - (puppy ? 6 : 0)}) rotate(${8 + pose.browAngle * 16})`}>
            <path d="M-18,2 Q0,-7 18,0" stroke={p.coatDark} strokeWidth={6} strokeLinecap="round" fill="none" />
          </g>
          <g transform={`translate(346 ${204 - pose.browR * 9 - (puppy ? 6 : 0)}) rotate(${-8 - pose.browAngle * 16})`}>
            <path d="M-18,0 Q0,-7 18,2" stroke={p.coatDark} strokeWidth={6} strokeLinecap="round" fill="none" />
          </g>
        </g>
      </g>
    </svg>
  );
};
