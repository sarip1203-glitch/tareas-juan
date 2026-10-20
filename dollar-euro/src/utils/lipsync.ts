import type { MouthShape } from "../components/character/DogRig";
import type { MouthCue, WordTiming } from "./assets";
import { syllableVowels } from "./words";

/**
 * Sincronización labial. Tres fuentes, de mejor a peor:
 *  1. "visemes": visemas de Rhubarb Lip Sync generados desde el audio real.
 *  2. "envelope": energía del audio real fotograma a fotograma.
 *  3. "synthetic": PROVISIONAL. Sílabas estimadas desde el texto y los
 *     tiempos de palabra. Solo se usa cuando aún no existe el audio.
 */
export type MouthTrack =
  | { kind: "visemes"; cues: MouthCue[] }
  | { kind: "envelope"; envelope: number[]; fps: number }
  | { kind: "synthetic"; pulses: SyllablePulse[] };

export type SyllablePulse = {
  startMs: number;
  endMs: number;
  peak: number;
  shape: MouthShape;
};

export type MouthSample = { open: number; shape: MouthShape };

const CLOSED: MouthSample = { open: 0, shape: "closed" };

// Formas de boca de Rhubarb (https://github.com/DanielSWolf/rhubarb-lip-sync).
const RHUBARB: Record<string, MouthSample> = {
  A: { open: 0, shape: "closed" }, // M, B, P
  B: { open: 0.22, shape: "narrow" }, // K, S, T...
  C: { open: 0.5, shape: "wide" }, // E
  D: { open: 0.88, shape: "wide" }, // A
  E: { open: 0.55, shape: "round" }, // O
  F: { open: 0.3, shape: "round" }, // U
  G: { open: 0.14, shape: "narrow" }, // F, V
  H: { open: 0.4, shape: "wide" }, // L
  X: { open: 0, shape: "closed" }, // reposo
};

const VOWEL_SHAPE: Record<string, { peak: number; shape: MouthShape }> = {
  a: { peak: 0.9, shape: "wide" },
  e: { peak: 0.6, shape: "wide" },
  i: { peak: 0.45, shape: "narrow" },
  o: { peak: 0.68, shape: "round" },
  u: { peak: 0.42, shape: "round" },
};

export const buildSyntheticPulses = (words: WordTiming[]): SyllablePulse[] => {
  const pulses: SyllablePulse[] = [];
  for (const w of words) {
    const vowels = syllableVowels(w.text);
    if (vowels.length === 0) continue;
    const span = (w.endMs - w.startMs) / vowels.length;
    vowels.forEach((v, i) => {
      const s = w.startMs + i * span;
      // Variación determinista para que no todas las sílabas sean iguales.
      const vary = 0.85 + 0.15 * Math.abs(Math.sin((s + i) * 0.013));
      pulses.push({
        startMs: s,
        endMs: s + span * 0.92,
        peak: VOWEL_SHAPE[v].peak * vary,
        shape: VOWEL_SHAPE[v].shape,
      });
    });
  }
  return pulses;
};

export const sampleMouth = (track: MouthTrack, ms: number): MouthSample => {
  if (ms < 0) return CLOSED;
  if (track.kind === "visemes") {
    const cue = track.cues.find((c) => ms >= c.startMs && ms < c.endMs);
    if (!cue) return CLOSED;
    const base = RHUBARB[cue.value] ?? CLOSED;
    // Suavizado corto en los bordes de cada visema.
    const edge = Math.min(ms - cue.startMs, cue.endMs - ms);
    const k = Math.min(1, edge / 45 + 0.35);
    return { open: base.open * k, shape: base.shape };
  }
  if (track.kind === "envelope") {
    const pos = (ms / 1000) * track.fps;
    const i = Math.floor(pos);
    const a = track.envelope[i] ?? 0;
    const b = track.envelope[i + 1] ?? 0;
    const e = a + (b - a) * (pos - i);
    const open = Math.pow(Math.max(0, Math.min(1, (e - 0.1) / 0.75)), 0.8);
    return { open, shape: open > 0.6 ? "wide" : open > 0.1 ? "narrow" : "closed" };
  }
  const p = track.pulses.find((x) => ms >= x.startMs && ms < x.endMs);
  if (!p) return CLOSED;
  const t = (ms - p.startMs) / (p.endMs - p.startMs);
  return { open: Math.pow(Math.sin(Math.PI * t), 0.75) * p.peak, shape: p.shape };
};
