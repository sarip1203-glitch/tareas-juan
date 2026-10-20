import manifestJson from "../generated/asset-manifest.json";

// El manifiesto lo genera `npm run assets` (scripts/prepare-assets.ts) a
// partir de lo que haya en public/. Gracias a él el proyecto sabe, sin
// romper la compilación, qué fotos, audios y videos existen realmente.

export type WordTiming = { text: string; startMs: number; endMs: number };
export type MouthCue = { startMs: number; endMs: number; value: string };

export type AudioInfo = {
  durationMs: number;
  // Energía RMS normalizada por fotograma (30 fps), 0..1.
  envelope?: number[];
  // Tiempos por palabra (ElevenLabs with-timestamps, Whisper, manual...).
  words?: WordTiming[];
  // Visemas Rhubarb Lip Sync (A–H, X).
  mouthCues?: MouthCue[];
};

export type AssetManifest = {
  generatedAt: string | null;
  files: string[];
  audio: Record<string, AudioInfo>;
};

export const manifest = manifestJson as AssetManifest;

const fileSet = new Set(manifest.files);

export const hasAsset = (path: string) => fileSet.has(path);

export const getAudioInfo = (path: string): AudioInfo | undefined =>
  manifest.audio[path];

export const AUDIO_EXTENSIONS = ["wav", "mp3", "m4a", "ogg", "aac"];

export const findFirstExisting = (candidates: string[]) =>
  candidates.find((c) => fileSet.has(c));
