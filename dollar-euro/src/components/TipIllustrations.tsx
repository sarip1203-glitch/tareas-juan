import React from "react";
import { interpolate, spring } from "remotion";
import { CHARACTERS } from "../config/characters";
import { FONTS } from "../config/fonts";
import type { TipIllustration } from "../episodes/types";
import { DogRig, type DogPose, NEUTRAL_POSE } from "./character/DogRig";

// Ilustraciones del consejo educativo (600×380). Sin castigos, sin gritos:
// solo rutina, premios, limpieza tranquila y paciencia.

type IlluProps = { t: number; fps: number };

const W = 600;
const H = 380;

const Puppy: React.FC<{ x: number; y: number; w: number; pose: Partial<DogPose>; t: number; id?: "dollar" | "euro" }> = ({
  x,
  y,
  w,
  pose,
  t,
  id = "euro",
}) => {
  const cfg = CHARACTERS[id];
  const blink = t % 75 < 5 ? 1 : 0;
  const full: DogPose = {
    ...NEUTRAL_POSE,
    tail: Math.sin(t * 0.5) * 16,
    breath: 0.5 + 0.5 * Math.sin(t * 0.2),
    ...pose,
    lid: Math.max(pose.lid ?? 0.05, blink),
  };
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - (w * 4) / 3, width: w, height: (w * 4) / 3 }}>
      <DogRig uid={`tip-${id}`} pose={full} palette={cfg.palette} collarColor={cfg.collarColor} tagLetter={cfg.tagLetter} puppy style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; color?: string; size?: number }> = ({
  x,
  y,
  children,
  color = "#3B2414",
  size = 30,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", fontFamily: FONTS.captions, fontWeight: 800, fontSize: size, color, whiteSpace: "nowrap" }}>
    {children}
  </div>
);

const Grass: React.FC = () => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
    <rect width={W} height={H} fill="#BFE6F7" />
    <circle cx={520} cy={70} r={40} fill="#FFD54F" />
    <path d={`M0,250 C150,220 300,270 600,235 L600,380 L0,380 Z`} fill="#7CC36E" />
    <path d={`M0,300 C200,280 400,320 600,290 L600,380 L0,380 Z`} fill="#5FAE5A" />
  </svg>
);

const Hand: React.FC<{ x: number; y: number; rot: number; children?: React.ReactNode }> = ({ x, y, rot, children }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={0} y={-30} width={260} height={60} rx={26} fill="#5C7FA8" />
      <rect x={-14} y={-34} width={34} height={68} rx={14} fill="#46698F" />
      <ellipse cx={-40} cy={0} rx={44} ry={32} fill="#E8B48F" />
      <ellipse cx={-78} cy={-8} rx={16} ry={10} fill="#E8B48F" />
      {children}
    </g>
  </svg>
);

const PuppyLearning: React.FC<IlluProps> = ({ t }) => (
  <>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <rect width={W} height={H} fill="#FFF3DD" />
      <rect x={0} y={290} width={W} height={90} fill="#E7C39A" />
      {/* tapete y puerta al patio */}
      <rect x={420} y={120} width={140} height={190} rx={8} fill="#8FD07F" stroke="#7B4A28" strokeWidth={10} />
      <rect x={60} y={300} width={130} height={40} rx={8} fill="#A9D8F5" />
    </svg>
    <Puppy x={300} y={360} w={200} t={t} pose={{ headTilt: Math.sin(t * 0.08) * 12, pupilX: Math.sin(t * 0.08), smile: 0.4, browL: 0.4, browR: 0.1 }} />
    <Label x={300} y={46} size={34}>¿Aquí... o allá?</Label>
    <Label x={125} y={290} size={22}>tapete</Label>
    <Label x={490} y={100} size={22}>patio</Label>
  </>
);

const ConfusedPuppy: React.FC<IlluProps> = ({ t, fps }) => {
  const q = spring({ frame: t - 8, fps, config: { damping: 10 } });
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect width={W} height={H} fill="#F1E6FF" />
        <rect x={0} y={290} width={W} height={90} fill="#D9C6EC" />
        {/* reloj: "hace 2 horas" */}
        <g transform="translate(110 130)">
          <circle r={62} fill="#fff" stroke="#6C4FA0" strokeWidth={10} />
          <line x1={0} y1={0} x2={0} y2={-40} stroke="#6C4FA0" strokeWidth={8} strokeLinecap="round" />
          <line x1={0} y1={0} x2={30 * Math.cos(t * 0.15)} y2={30 * Math.sin(t * 0.15)} stroke="#6C4FA0" strokeWidth={8} strokeLinecap="round" />
        </g>
        <ellipse cx={470} cy={330} rx={60} ry={14} fill="#F7E58A" opacity={0.45} />
      </svg>
      <Label x={110} y={230} size={26} color="#6C4FA0">hace 2 horas</Label>
      <Puppy x={330} y={360} w={200} t={t} id="dollar" pose={{ headTilt: 16, browL: 0.8, browR: -0.1, smile: 0, pupilScale: 1.3, earL: 10, earR: -6 }} />
      <div style={{ position: "absolute", left: 400, top: 40, fontFamily: FONTS.title, fontSize: 110, color: "#6C4FA0", transform: `scale(${q}) rotate(12deg)` }}>?</div>
      <div style={{ position: "absolute", left: 470, top: 90, fontFamily: FONTS.title, fontSize: 70, color: "#9B7FD0", transform: `scale(${q}) rotate(-10deg)` }}>?</div>
    </>
  );
};

const GoOutside: React.FC<IlluProps> = ({ t, fps }) => {
  const icons = [
    { label: "al despertar", draw: <circle r={26} fill="#FFC93C" /> },
    {
      label: "después de comer",
      draw: (
        <g>
          <path d="M-32,-4 L32,-4 L22,22 L-22,22 Z" fill="#E5534B" />
          <ellipse cx={0} cy={-6} rx={30} ry={8} fill="#8B5A2B" />
        </g>
      ),
    },
    { label: "después de jugar", draw: <circle r={24} fill="#3FA9FF" stroke="#fff" strokeWidth={5} /> },
  ];
  const walk = interpolate(t, [0, fps * 1.2], [-60, 0], { extrapolateRight: "clamp" });
  return (
    <>
      <Grass />
      <Puppy x={300 + walk} y={300} w={180} t={t} pose={{ smile: 0.9, open: 0.3, mouthShape: "wide", tongue: 0.5, headTilt: Math.sin(t * 0.3) * 4 }} />
      {icons.map((ic, i) => {
        const s = spring({ frame: t - 10 - i * 12, fps, config: { damping: 12 } });
        const x = 100 + i * 200;
        return (
          <React.Fragment key={i}>
            <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <g transform={`translate(${x} 335) scale(${s})`}>
                <circle r={40} fill="#fff" opacity={0.9} />
                {ic.draw}
              </g>
            </svg>
            <Label x={x} y={58} size={24}>
              <span style={{ opacity: s }}>{ic.label}</span>
            </Label>
          </React.Fragment>
        );
      })}
    </>
  );
};

const TreatReward: React.FC<IlluProps> = ({ t, fps }) => {
  const reach = spring({ frame: t - 4, fps, config: { damping: 14 } });
  const sparkle = spring({ frame: t - 16, fps, config: { damping: 8 } });
  return (
    <>
      <Grass />
      <Puppy x={220} y={350} w={200} t={t} pose={{ smile: 1, open: 0.45, mouthShape: "wide", lid: 0.5, lowerLid: 0.35, tongue: 0.6, blush: 0.4, tail: Math.sin(t * 0.9) * 30 }} />
      <Hand x={interpolate(reach, [0, 1], [620, 400])} y={200} rot={-8}>
        <g transform="translate(-92 -2) rotate(-20)">
          <rect x={-26} y={-8} width={52} height={16} rx={8} fill="#C98A4B" />
          <circle cx={-26} cy={-7} r={9} fill="#C98A4B" />
          <circle cx={-26} cy={7} r={9} fill="#C98A4B" />
          <circle cx={26} cy={-7} r={9} fill="#C98A4B" />
          <circle cx={26} cy={7} r={9} fill="#C98A4B" />
        </g>
      </Hand>
      <div style={{ position: "absolute", left: 360, top: 40, transform: `scale(${sparkle})`, background: "#fff", borderRadius: 30, padding: "8px 22px", fontFamily: FONTS.captions, fontWeight: 800, fontSize: 34, color: "#2E7D32", boxShadow: "0 6px 0 #2E7D32" }}>
        ¡Muy bien!
      </div>
    </>
  );
};

const CalmCleaning: React.FC<IlluProps> = ({ t }) => {
  const wipe = Math.sin(t * 0.35) * 40;
  const shrink = Math.max(0.25, 1 - t / 90);
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect width={W} height={H} fill="#E6F6F3" />
        <rect x={0} y={250} width={W} height={130} fill="#CFE3DE" />
        <ellipse cx={330} cy={300} rx={80 * shrink} ry={20 * shrink} fill="#F2E27A" opacity={0.7} />
        {/* atomizador */}
        <g transform="translate(500 210)">
          <rect x={-30} y={0} width={60} height={90} rx={12} fill="#4DB6AC" />
          <rect x={-14} y={-26} width={28} height={28} fill="#00897B" />
          <path d="M14,-22 L42,-18 L42,-8 L14,-8 Z" fill="#00897B" />
          <rect x={-22} y={30} width={44} height={30} rx={4} fill="#fff" />
        </g>
      </svg>
      <Label x={500} y={255} size={13} color="#00695C">ENZIMÁTICO</Label>
      <Hand x={360 + wipe} y={280} rot={-15}>
        <rect x={-86} y={8} width={70} height={30} rx={8} fill="#FFB74D" />
      </Hand>
      <Puppy x={130} y={330} w={170} t={t} id="dollar" pose={{ smile: 0.5, lid: 0.15, headTilt: -6 }} />
      <Label x={300} y={50} size={34} color="#00695C">Con calma, sin regaños</Label>
    </>
  );
};

const Patience: React.FC<IlluProps> = ({ t, fps }) => {
  const beat = 1 + 0.08 * Math.max(0, Math.sin(t * 0.25));
  const s = spring({ frame: t, fps, config: { damping: 12 } });
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect width={W} height={H} fill="#FFF0F3" />
        <g transform={`translate(470 150) scale(${beat * s})`}>
          <path d="M0,40 C-90,-20 -60,-100 0,-56 C60,-100 90,-20 0,40 Z" fill="#FF4D6D" />
        </g>
        <g transform="translate(120 160)">
          <path d="M-40,-70 L40,-70 L4,0 L40,70 L-40,70 L-4,0 Z" fill="#FFE3A3" stroke="#7B4A28" strokeWidth={8} />
          <path d={`M-30,${70 - (t % 60)} L30,${70 - (t % 60)} L30,64 L-30,64 Z`} fill="#E0A84E" opacity={0.6} />
        </g>
      </svg>
      <Puppy x={230} y={360} w={150} t={t} id="dollar" pose={{ smile: 0.8, lid: 0.2 }} />
      <Puppy x={360} y={360} w={150} t={t + 20} id="euro" pose={{ smile: 0.9, open: 0.3, mouthShape: "wide", tongue: 0.5 }} />
      <Label x={300} y={46} size={34} color="#C2185B">Paso a paso, con cariño</Label>
    </>
  );
};

export const TIP_ILLUSTRATIONS: Record<TipIllustration, React.FC<IlluProps>> = {
  puppyLearning: PuppyLearning,
  confusedPuppy: ConfusedPuppy,
  goOutside: GoOutside,
  treatReward: TreatReward,
  calmCleaning: CalmCleaning,
  patience: Patience,
};

export const TIP_SIZE = { width: W, height: H };
