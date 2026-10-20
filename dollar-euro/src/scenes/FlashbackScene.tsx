import React from "react";
import { AbsoluteFill, Easing, interpolate, spring } from "remotion";
import { Camera } from "../components/Camera";
import { Character } from "../components/character/Character";
import { computeCharacterFrame } from "../components/character/pose";
import { CinematicGrade } from "../components/CinematicGrade";
import { useEpisode } from "../components/EpisodeContext";
import { StudioSet } from "../components/StudioSet";
import { FONTS } from "../config/fonts";
import { SAFE_ZONE, msToFrames } from "../config/video";
import type { Expression, Look } from "../episodes/types";
import { normalizeWord } from "../utils/words";
import type { ResolvedLine, Segment } from "../utils/timeline";

// Flashback: los perros de cachorros, tratamiento más luminoso y un marco
// narrativo ("FLASHBACK · Euro, 3 meses"). La voz sigue siendo la actual.

const PUPPY_WIDTH = 330;

const Puddle: React.FC<{ x: number; y: number; t: number; fps: number; scale?: number }> = ({ x, y, t, fps, scale = 1 }) => {
  if (t < 0) return null;
  const s = spring({ frame: t, fps, config: { damping: 12, stiffness: 90 } }) * scale;
  const tw = (Math.sin(t * 0.4) + 1) / 2;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M-90,0 C-100,-26 -40,-34 0,-28 C50,-36 110,-22 96,4 C110,26 40,34 0,28 C-50,34 -110,22 -90,0 Z" fill="#F6E58D" opacity={0.8} />
        <ellipse cx={-30} cy={-8} rx={26} ry={7} fill="#fff" opacity={0.7} />
        {/* destellos tiernos */}
        <g opacity={tw}>
          <path d="M70,-60 l6,16 l16,6 l-16,6 l-6,16 l-6,-16 l-16,-6 l16,-6 Z" fill="#FFF7C2" />
        </g>
        <g opacity={1 - tw}>
          <path d="M-80,-50 l4,11 l11,4 l-11,4 l-4,11 l-4,-11 l-11,-4 l11,-4 Z" fill="#FFF7C2" />
        </g>
      </g>
    </svg>
  );
};

const wordStartFrame = (line: ResolvedLine | undefined, word: string, fps: number) => {
  if (!line) return Infinity;
  const w = line.words.find((x) => normalizeWord(x.text) === normalizeWord(word));
  return line.startFrame + (w ? msToFrames(w.startMs, fps) : 0);
};

export const FlashbackScene: React.FC<{ segment: Segment }> = ({ segment }) => {
  const { ep, frame } = useEpisode();
  if (segment.shot.type !== "flashback") return null;
  const shot = segment.shot;
  const fps = ep.fps;
  const local = frame - segment.from;
  const lines = ep.lines.filter((l) => segment.lineIds.includes(l.id));
  const first = lines[0];
  const second = lines[1];

  const push = 1 + 0.05 * Easing.inOut(Easing.quad)(Math.min(1, local / segment.durationInFrames));
  const cam = { cx: 540, cy: 1600, zoom: 1.25 * push, focusY: 1000 };

  let content: React.ReactNode = null;

  if (shot.id === "euroSofa") {
    const d1 = Math.max(1, first.endFrame - segment.from);
    const walkEnd = Math.round(d1 * 0.55);
    const peekAt = Math.round(d1 * 0.78);
    const puddleAt = second ? second.startFrame + msToFrames(900, fps) - segment.from : peekAt + 10;
    const signAt = wordStartFrame(second, "baño", fps) - segment.from;

    let expression: Expression = "smug";
    let look: Look = local % 40 < 20 ? "away" : "other";
    if (local >= peekAt) {
      expression = local >= puddleAt ? "innocent" : "guilty";
      look = "camera";
    }
    const cf = computeCharacterFrame(ep, "euro", frame, { silent: true, ignoreActions: true, expressionOverride: expression, lookOverride: look });
    const walkP = Math.min(1, local / walkEnd);
    let x = interpolate(walkP, [0, 1], [130, 760]);
    let y = 1690;
    let rot = Math.sin(local * 0.55) * 4;
    let bob = -Math.abs(Math.sin(local * 0.55)) * 14;
    if (local >= walkEnd) {
      bob = 0;
      rot = 0;
    }
    if (local >= peekAt) {
      // Asoma la cabeza por el borde del sofá.
      const s = spring({ frame: local - peekAt, fps, config: { damping: 14 } });
      x = interpolate(s, [0, 1], [760, 640]);
      y = 1690;
      rot = -10 * s;
    }
    const signS = signAt < Infinity ? spring({ frame: local - signAt, fps, config: { damping: 9 } }) : 0;
    content = (
      <>
        <Character id="euro" puppy uidSuffix="-pup" pose={cf.pose} body={{ x: 0, y: bob, rot, scale: 1 }} width={PUPPY_WIDTH} x={x} y={y} />
        {/* sofá en primer plano (el rinconcito) */}
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <rect x={660} y={1250} width={520} height={470} rx={60} fill="#4F8984" />
          <rect x={640} y={1200} width={140} height={520} rx={60} fill="#3F726E" />
          <rect x={660} y={1690} width={30} height={60} fill="#5C351C" />
        </svg>
        <Puddle x={600} y={1730} t={local - puddleAt} fps={fps} />
        {signS > 0.01 ? (
          <div
            style={{
              position: "absolute",
              left: 610,
              top: 1290,
              transform: `scale(${signS}) rotate(${-6 + Math.sin(local * 0.2) * 2}deg)`,
              background: "#FFF3D6",
              border: "6px solid #5C351C",
              borderRadius: 14,
              padding: "8px 18px",
              fontFamily: FONTS.title,
              fontSize: 40,
              color: "#5C351C",
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            BAÑO
            <br />
            PRIVADO
            <div style={{ fontSize: 26, marginTop: 4 }}>← solo Euro</div>
          </div>
        ) : null}
      </>
    );
  } else {
    // dollarBed: Dollar cachorro junto a su cama.
    const dripAt = first.startFrame + msToFrames(1700, fps) - segment.from;
    let expression: Expression = "happy";
    let look: Look = "down";
    if (local >= dripAt) expression = "surprised";
    if (local >= dripAt + 14) {
      expression = "innocent";
      look = "camera";
    }
    const cf = computeCharacterFrame(ep, "dollar", frame, { silent: true, ignoreActions: true, expressionOverride: expression, lookOverride: look });
    // Juega mordisqueando el lazo antes del accidente.
    if (local < dripAt) cf.pose.headTilt += Math.sin(local * 0.4) * 8;
    const ups = spring({ frame: local - dripAt - 16, fps, config: { damping: 10 } });
    content = (
      <>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={720} cy={1690} rx={210} ry={78} fill="#6EA7DD" />
          <ellipse cx={720} cy={1676} rx={156} ry={48} fill="#D6E8F8" />
        </svg>
        <Puddle x={500} y={1735} t={local - dripAt} fps={fps} scale={0.8} />
        <Character id="dollar" puppy uidSuffix="-pup" pose={cf.pose} body={{ x: 0, y: 0, rot: 0, scale: 1 }} width={PUPPY_WIDTH} x={360} y={1700} />
        {ups > 0.01 ? (
          <div style={{ position: "absolute", left: 420, top: 1180, transform: `scale(${ups})`, background: "#fff", borderRadius: 40, padding: "6px 26px", fontFamily: FONTS.title, fontSize: 52, color: "#2E6FB8", boxShadow: "0 6px 0 #2E6FB8" }}>
            ¿ups?
          </div>
        ) : null}
      </>
    );
  }

  const tagIn = spring({ frame: local, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ backgroundColor: "#FFF6E8", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "brightness(1.07) saturate(1.12) contrast(0.95)" }}>
        <Camera cam={cam}>
          <StudioSet frame={frame} blur={3} tone="flashback" showDesk={false} />
          <div style={{ position: "absolute", left: -200, top: 1900, width: 1480, height: 700, background: "#6E4326" }} />
          {content}
        </Camera>
      </AbsoluteFill>
      <CinematicGrade tone="flashback" />
      {/* marco narrativo */}
      <AbsoluteFill style={{ border: "18px solid rgba(255,255,255,0.85)", borderRadius: 50, boxShadow: "inset 0 0 80px rgba(255,240,210,0.9)" }} />
      <div
        style={{
          position: "absolute",
          top: SAFE_ZONE.top,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(${(1 - tagIn) * -200}px)`,
        }}
      >
        <div style={{ fontFamily: FONTS.title, fontSize: 64, color: "#fff", background: "#E07A4F", borderRadius: 20, padding: "4px 30px", transform: "rotate(-3deg)", boxShadow: "0 8px 0 #A44E2C" }}>
          FLASHBACK
        </div>
        <div style={{ marginTop: 16, fontFamily: FONTS.captions, fontWeight: 800, fontSize: 40, color: "#5C351C", background: "rgba(255,255,255,0.9)", borderRadius: 16, padding: "2px 22px" }}>
          {shot.label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
