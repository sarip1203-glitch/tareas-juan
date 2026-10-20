import { Easing, interpolate, random } from "remotion";
import type { ActionCue, ActionType, CharacterId, Expression, Look } from "../../episodes/types";
import { sampleMouth } from "../../utils/lipsync";
import { type ResolvedEpisode, type ResolvedLine, lineAtFrame } from "../../utils/timeline";
import { type DogPose, type MouthShape, NEUTRAL_POSE } from "./DogRig";

// Calcula la pose de un personaje en un fotograma global del episodio.
// Es una función pura: misma entrada → mismo dibujo (requisito de Remotion).

type ExprParams = {
  smile: number;
  brow: number;
  browAsym: number;
  browAngle: number;
  lid: number;
  lowerLid: number;
  pupilScale: number;
  ear: number;
  earAsym: number;
  earBack: number;
  tilt: number;
  chin: number; // + baja la cabeza, - la sube
  mouthBase: number;
  mouthBaseShape: MouthShape;
  tongue: number;
  blush: number;
  wag: number; // energía de la cola
};

const E = (p: Partial<ExprParams>): ExprParams => ({
  smile: 0.2,
  brow: 0,
  browAsym: 0,
  browAngle: 0,
  lid: 0.12,
  lowerLid: 0,
  pupilScale: 1,
  ear: 0,
  earAsym: 0,
  earBack: 0,
  tilt: 0,
  chin: 0,
  mouthBase: 0,
  mouthBaseShape: "closed",
  tongue: 0,
  blush: 0,
  wag: 0.5,
  ...p,
});

export const EXPRESSIONS: Record<Expression, ExprParams> = {
  neutral: E({}),
  happy: E({ smile: 0.8, brow: 0.3, lid: 0.05, lowerLid: 0.2, ear: 5, tilt: 3, mouthBase: 0.22, mouthBaseShape: "wide", tongue: 0.35, wag: 1.1 }),
  smug: E({ smile: 0.55, brow: 0.1, browAsym: 0.6, lid: 0.48, lowerLid: 0.12, tilt: -4, chin: -6, wag: 0.6 }),
  annoyed: E({ smile: -0.45, brow: -0.35, browAngle: 0.7, lid: 0.38, ear: -6, earBack: 0.15, wag: 0.05 }),
  surprised: E({ smile: 0, brow: 0.95, lid: 0, pupilScale: 0.7, ear: 12, mouthBase: 0.35, mouthBaseShape: "round", wag: 0.2 }),
  guilty: E({ smile: -0.3, brow: 0.45, browAngle: -0.7, lid: 0.22, pupilScale: 1.3, ear: -10, earBack: 0.85, tilt: -6, chin: 10, wag: 0.12 }),
  nervous: E({ smile: -0.45, brow: 0.55, browAngle: -0.55, lid: 0.04, pupilScale: 0.72, ear: -8, earBack: 0.55, mouthBase: 0.08, mouthBaseShape: "wide", wag: 0.25 }),
  excited: E({ smile: 1, brow: 0.6, lid: 0, pupilScale: 1.25, ear: 14, mouthBase: 0.45, mouthBaseShape: "wide", tongue: 0.9, blush: 0.3, wag: 2.2 }),
  confused: E({ smile: 0, brow: 0.35, browAsym: -0.8, lid: 0.15, ear: 4, earAsym: 14, tilt: 13, wag: 0.3 }),
  laughing: E({ smile: 1, brow: 0.4, lid: 0.72, lowerLid: 0.45, ear: 6, mouthBase: 0.55, mouthBaseShape: "wide", tongue: 0.7, blush: 0.35, wag: 1.6 }),
  proud: E({ smile: 0.6, brow: 0.2, lid: 0.32, lowerLid: 0.1, ear: 8, tilt: -3, chin: -8, wag: 0.8 }),
  innocent: E({ smile: 0.35, brow: 0.65, browAngle: -0.45, lid: 0, pupilScale: 1.45, ear: 2, tilt: 9, wag: 0.6 }),
};

const DEFAULT_ACTION_MS: Partial<Record<ActionType, number>> = {
  enter: 600,
  nudge: 650,
  getNudged: 650,
  bounce: 700,
  nod: 900,
  shakeHead: 800,
  wave: 1500,
};

export type BodyOffset = { x: number; y: number; rot: number; scale: number };

export type CharacterFrame = {
  pose: DogPose;
  body: BodyOffset;
  speaking: boolean;
  visible: boolean;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const ease = Easing.bezier(0.33, 1, 0.68, 1);

const lerpExpr = (a: ExprParams, b: ExprParams, t: number): ExprParams => {
  const out = { ...b };
  (Object.keys(a) as (keyof ExprParams)[]).forEach((k) => {
    const av = a[k];
    const bv = b[k];
    if (typeof av === "number" && typeof bv === "number") {
      (out as Record<string, unknown>)[k] = av + (bv - av) * t;
    }
  });
  out.mouthBaseShape = t < 0.5 ? a.mouthBaseShape : b.mouthBaseShape;
  return out;
};

const lookVector = (look: Look, toward: number) => {
  switch (look) {
    case "other":
      return { px: toward * 0.85, py: 0, turn: toward * 0.4, headY: 0, tilt: toward * 2 };
    case "away":
      return { px: -toward * 0.85, py: 0, turn: -toward * 0.4, headY: 0, tilt: 0 };
    case "down":
      return { px: toward * 0.2, py: 0.85, turn: 0, headY: 10, tilt: 0 };
    case "up":
      return { px: 0, py: -0.9, turn: 0, headY: -8, tilt: -4 };
    default:
      return { px: 0, py: 0, turn: 0, headY: 0, tilt: 0 };
  }
};

// Parpadeos naturales con intervalos pseudoaleatorios deterministas.
const blinkAmount = (id: string, frame: number, fps: number) => {
  let t = Math.round(0.6 * fps);
  let n = 0;
  while (t <= frame) {
    if (frame < t + 6) return Math.sin((Math.PI * (frame - t)) / 6);
    // De vez en cuando, doble parpadeo.
    const double = random(`dbl-${id}-${n}`) > 0.82;
    t += double ? 9 : Math.round(fps * (2.2 + random(`blink-${id}-${n}`) * 2.8));
    n++;
  }
  return 0;
};

const earTwitch = (id: string, frame: number, fps: number) => {
  const period = fps * 4.7;
  const n = Math.floor(frame / period);
  const local = frame - n * period - random(`ear-${id}-${n}`) * (period - 12);
  if (local < 0 || local > 10) return { l: 0, r: 0 };
  const v = Math.sin((local / 10) * Math.PI) * 12;
  return random(`earside-${id}-${n}`) > 0.5 ? { l: v, r: 0 } : { l: 0, r: v };
};

const actionProgress = (a: ActionCue, line: ResolvedLine, frame: number, fps: number) => {
  const start = line.startFrame + Math.round(((a.atMs ?? 0) / 1000) * fps);
  const defMs = DEFAULT_ACTION_MS[a.type];
  const dur = a.durationMs ?? defMs;
  const durFrames = dur ? Math.max(1, Math.round((dur / 1000) * fps)) : Math.max(1, line.spanEndFrame - start);
  return { p: (frame - start) / durFrames, start, durFrames };
};

export type PoseOptions = {
  expressionOverride?: Expression;
  lookOverride?: Look;
  extraActions?: { cue: ActionCue; line: ResolvedLine }[];
  silent?: boolean; // sin boca (p. ej. cachorros en flashback con voz en off)
  ignoreActions?: boolean;
};

export const computeCharacterFrame = (
  ep: ResolvedEpisode,
  id: CharacterId,
  frame: number,
  opts: PoseOptions = {},
): CharacterFrame => {
  const fps = ep.fps;
  const toward = id === "dollar" ? 1 : -1;
  const t = frame / fps;
  const phase = id === "dollar" ? 0 : 1.7;

  const line = lineAtFrame(ep, frame) ?? ep.lines[ep.lines.length - 1];
  const prev = line ? ep.lines[line.index - 1] : undefined;

  // Expresión con transición suave entre líneas.
  const dirNow = line.directions[id];
  const dirPrev = prev ? prev.directions[id] : dirNow;
  const blendStart = Math.min(line.startFrame, prev ? prev.spanEndFrame : line.startFrame) - 3;
  const bt = clamp01((frame - blendStart) / 7);
  const exprNow = EXPRESSIONS[opts.expressionOverride ?? dirNow.expression];
  const exprPrev = EXPRESSIONS[opts.expressionOverride ?? dirPrev.expression];
  const ex = lerpExpr(exprPrev, exprNow, bt);

  const lvNow = lookVector(opts.lookOverride ?? dirNow.look, toward);
  const lvPrev = lookVector(opts.lookOverride ?? dirPrev.look, toward);
  const lb = clamp01((frame - blendStart) / 5);
  const lv = {
    px: lvPrev.px + (lvNow.px - lvPrev.px) * lb,
    py: lvPrev.py + (lvNow.py - lvPrev.py) * lb,
    turn: lvPrev.turn + (lvNow.turn - lvPrev.turn) * lb,
    headY: lvPrev.headY + (lvNow.headY - lvPrev.headY) * lb,
    tilt: lvPrev.tilt + (lvNow.tilt - lvPrev.tilt) * lb,
  };

  // Boca: solo si este personaje habla en este momento.
  const speaking =
    !opts.silent &&
    (line.speaker === id || line.speaker === "ambos") && frame >= line.startFrame && frame < line.endFrame;
  let open = 0;
  let shape: MouthShape = "closed";
  if (speaking) {
    const ms = ((frame - line.startFrame) / fps) * 1000;
    const a = sampleMouth(line.mouth, ms);
    const b = sampleMouth(line.mouth, ms - 1000 / fps);
    open = Math.max(a.open, b.open * 0.55);
    shape = a.shape === "closed" ? b.shape : a.shape;
  }
  const finalOpen = Math.max(speaking ? ex.mouthBase * 0.35 : ex.mouthBase, open);
  if (!speaking || open < ex.mouthBase * 0.35) shape = ex.mouthBaseShape;

  // Movimiento idle.
  const breath = 0.5 + 0.5 * Math.sin((t * 2 * Math.PI) / 3.1 + phase);
  const sway = Math.sin(t * 0.9 + phase) * 1.6;
  const ear = earTwitch(id, frame, fps);
  const wagSpeed = 1.1 + ex.wag * 1.4;
  const tail = Math.sin(t * 2 * Math.PI * wagSpeed + phase) * (5 + ex.wag * 11);
  const blink = blinkAmount(id, frame, fps);

  const pose: DogPose = {
    ...NEUTRAL_POSE,
    open: finalOpen,
    mouthShape: shape,
    smile: ex.smile,
    browL: ex.brow + ex.browAsym * 0.5,
    browR: ex.brow - ex.browAsym * 0.5,
    browAngle: ex.browAngle,
    lid: Math.max(ex.lid, blink),
    lowerLid: ex.lowerLid,
    pupilX: lv.px,
    pupilY: lv.py,
    pupilScale: ex.pupilScale,
    headTilt: ex.tilt + lv.tilt + sway + (speaking ? Math.sin(t * 5.3) * open * 3 : 0),
    headTurn: lv.turn,
    headX: Math.sin(t * 0.6 + phase) * 2,
    headY: ex.chin + lv.headY - (speaking ? open * 6 : 0),
    earL: ex.ear + ex.earAsym + ear.l,
    earR: ex.ear - ex.earAsym + ear.r,
    earBack: ex.earBack,
    tail,
    breath,
    tongue: speaking ? 0 : ex.tongue,
    blush: ex.blush,
  };

  const body: BodyOffset = { x: 0, y: 0, rot: 0, scale: 1 };
  let visible = true;

  // Acciones de la línea actual (y "enter" pendientes de líneas futuras de la
  // misma escena: el personaje está fuera de cuadro hasta que entra).
  const actions: { cue: ActionCue; line: ResolvedLine }[] = [
    ...(opts.ignoreActions ? [] : (dirNow.actions ?? []).map((cue) => ({ cue, line }))),
    ...(opts.extraActions ?? []),
  ];
  if (!opts.ignoreActions) ep.lines
    .filter((l) => l.sceneId === line.sceneId && l.index > line.index)
    .forEach((l) => {
      (l.directions[id].actions ?? [])
        .filter((a) => a.type === "enter")
        .forEach((cue) => actions.push({ cue, line: l }));
    });

  for (const { cue, line: l } of actions) {
    const { p } = actionProgress(cue, l, frame, fps);
    const pc = clamp01(p);
    const bump = p >= 0 && p <= 1 ? Math.sin(Math.PI * p) : 0;
    switch (cue.type) {
      case "enter": {
        if (p < 0) visible = false;
        const e = ease(pc);
        body.x += -toward * 720 * (1 - e);
        body.y -= Math.abs(Math.sin(pc * Math.PI * 3)) * 26 * (1 - pc);
        body.rot += -toward * 6 * (1 - e);
        break;
      }
      case "nudge":
        body.x += toward * 60 * bump;
        body.rot += toward * 7 * bump;
        pose.headTilt += toward * 6 * bump;
        break;
      case "getNudged": {
        const q = clamp01((p - 0.18) / 0.82);
        const b2 = p >= 0.18 && p <= 1 ? Math.sin(Math.PI * q) : 0;
        body.x -= toward * 48 * b2;
        body.rot -= toward * 8 * b2;
        break;
      }
      case "pawCover": {
        if (p < 0 || p > 1) break;
        const up = interpolate(p, [0, 0.12, 0.85, 1], [0, 1, 1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        // 1.17 ≈ 138°: la pata sube hasta la boca del otro.
        if (toward > 0) pose.pawR = up * 1.17;
        else pose.pawL = up * 1.17;
        body.x += toward * 285 * up;
        body.rot += toward * 5 * up;
        pose.headTilt -= toward * 6 * up;
        break;
      }
      case "bounce":
        if (p >= 0 && p <= 1) body.y -= Math.abs(Math.sin(p * Math.PI * 2)) * 42;
        break;
      case "headTilt":
        if (p >= 0) pose.headTilt += 15 * ease(clamp01(p * 4));
        break;
      case "nod":
        if (p >= 0 && p <= 1) pose.headY += Math.sin(p * Math.PI * 4) * 9 * (1 - p);
        break;
      case "shakeHead":
        if (p >= 0 && p <= 1) {
          pose.headTurn += Math.sin(p * Math.PI * 6) * 0.7 * (1 - p);
          pose.headTilt += Math.sin(p * Math.PI * 6) * 4 * (1 - p);
        }
        break;
      case "shrink":
        if (p >= 0) {
          const e = ease(clamp01(p * 3));
          body.scale *= 1 - 0.05 * e;
          body.y += 14 * e;
        }
        break;
      case "lean":
        if (p >= 0) {
          const e = ease(clamp01(p * 3));
          body.x += toward * 20 * e;
          body.scale *= 1 + 0.03 * e;
        }
        break;
      case "wave":
        if (p >= 0 && p <= 1) {
          const env = interpolate(p, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);
          const v = env * (0.72 + 0.2 * Math.sin(p * Math.PI * 8));
          if (toward > 0) pose.pawL = v;
          else pose.pawR = v;
        }
        break;
    }
  }

  return { pose, body, speaking, visible };
};
