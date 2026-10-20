import type { WordTiming } from "./assets";

// Utilidades de texto en español para estimar tiempos y sílabas.

export const splitWords = (text: string) =>
  text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);

// Normaliza para comparar palabras (sin signos ni tildes).
export const normalizeWord = (w: string) =>
  w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zñ0-9]/g, "");

// Núcleos vocálicos aproximados (suficiente para animar la boca).
export const syllableVowels = (word: string): string[] => {
  const clean = word.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const groups = clean.match(/[aeiouy]+/g);
  if (!groups) {
    return [];
  }
  // "ahhh" o "nooo" alargadas cuentan como una sílaba larga.
  return groups.map((g) => {
    if (g.includes("a")) return "a";
    if (g.includes("o")) return "o";
    if (g.includes("e")) return "e";
    if (g.includes("u")) return "u";
    return "i";
  });
};

// Pausa natural (ms) que añade la puntuación al final de una palabra.
const punctuationPauseMs = (word: string) => {
  if (/\.\.\.$|…$/.test(word)) return 380;
  if (/[.!?]$/.test(word)) return 230;
  if (/[,;:]$/.test(word)) return 150;
  return 0;
};

/**
 * Reparte palabras dentro de una duración total.
 * - Con `durationMs` real (audio sin marcas de tiempo): ajusta
 *   proporcionalmente al peso de cada palabra.
 * - Sin audio: estima la duración con la velocidad del personaje.
 */
export const distributeWords = (
  text: string,
  charsPerSecond: number,
  durationMs?: number,
): { words: WordTiming[]; durationMs: number } => {
  const words = splitWords(text);
  const weights = words.map((w) => {
    const letters = normalizeWord(w).length;
    const elongation = /(.)\1\1/.test(w) ? 250 : 0; // "Ahhh", "Nooo"
    return {
      speak: Math.max(140, (letters / charsPerSecond) * 1000 + 40) + elongation,
      pause: punctuationPauseMs(w),
    };
  });
  // La última palabra no lleva pausa: la controla pauseAfterMs.
  if (weights.length > 0) {
    weights[weights.length - 1].pause = 0;
  }
  const natural = weights.reduce((a, w) => a + w.speak + w.pause, 0);
  const total = durationMs ?? natural;
  const k = total / Math.max(1, natural);
  let t = 0;
  const out: WordTiming[] = words.map((text, i) => {
    const start = t;
    const end = start + weights[i].speak * k;
    t = end + weights[i].pause * k;
    return { text, startMs: Math.round(start), endMs: Math.round(end) };
  });
  return { words: out, durationMs: Math.round(total) };
};

/**
 * Agrupa palabras con tiempos de caracteres (formato ElevenLabs
 * "with-timestamps") en palabras.
 */
export const wordsFromCharacterAlignment = (alignment: {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}): WordTiming[] => {
  const out: WordTiming[] = [];
  let current = "";
  let start = 0;
  let end = 0;
  alignment.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) {
      if (current) out.push({ text: current, startMs: start * 1000, endMs: end * 1000 });
      current = "";
      return;
    }
    if (!current) start = alignment.character_start_times_seconds[i];
    current += ch;
    end = alignment.character_end_times_seconds[i];
  });
  if (current) out.push({ text: current, startMs: start * 1000, endMs: end * 1000 });
  return out.map((w) => ({ ...w, startMs: Math.round(w.startMs), endMs: Math.round(w.endMs) }));
};
