/**
 * Escanea public/ y genera src/generated/asset-manifest.json con:
 *  - la lista de archivos disponibles (fotos, audios, videos...)
 *  - la duración REAL de cada audio (ffprobe)
 *  - la envolvente de energía de cada voz (para la sincronía labial)
 *  - tiempos por palabra y visemas si existen archivos auxiliares:
 *      <audio>.alignment.json  (ElevenLabs /with-timestamps)
 *      <audio>.words.json      ([{ text, startMs, endMs }])
 *      <audio>.rhubarb.json    (Rhubarb Lip Sync, formato JSON)
 *
 * Uso: npm run assets  (se ejecuta solo antes de dev, render y check)
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { AssetManifest, AudioInfo, MouthCue, WordTiming } from "../src/utils/assets";
import { wordsFromCharacterAlignment } from "../src/utils/words";

const ROOT = join(import.meta.dirname, "..");
const PUBLIC = join(ROOT, "public");
const OUT = join(ROOT, "src", "generated", "asset-manifest.json");
const FPS = 30;
const AUDIO_EXT = /\.(wav|mp3|m4a|ogg|aac)$/i;
const VOICE_DIRS = /^audio\/(dollar|euro|ambos)\//;

// ffmpeg/ffprobe del sistema o, si no hay, los que trae Remotion.
const tool = (name: "ffmpeg" | "ffprobe") => {
  const sys = spawnSync(name, ["-version"], { encoding: "utf8" });
  if (sys.status === 0) return { cmd: name, pre: [] as string[] };
  return { cmd: "npx", pre: ["remotion", name] };
};
const FFPROBE = tool("ffprobe");
const FFMPEG = tool("ffmpeg");

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    if (name.startsWith(".")) return [];
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const durationMs = (file: string) => {
  const r = spawnSync(
    FFPROBE.cmd,
    [...FFPROBE.pre, "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  );
  const v = parseFloat(r.stdout.trim());
  if (!Number.isFinite(v)) throw new Error(`No pude leer la duración de ${file}: ${r.stderr}`);
  return Math.round(v * 1000);
};

const envelope = (file: string) => {
  const rate = 16000;
  const r = spawnSync(FFMPEG.cmd, [...FFMPEG.pre, "-v", "error", "-i", file, "-ac", "1", "-ar", String(rate), "-f", "f32le", "-"], {
    maxBuffer: 1024 * 1024 * 512,
  });
  if (r.status !== 0) throw new Error(`ffmpeg falló con ${file}: ${r.stderr}`);
  const b = r.stdout as Buffer;
  const samples = new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4));
  const win = rate / FPS;
  const rms: number[] = [];
  for (let i = 0; i < samples.length; i += win) {
    let s = 0;
    const end = Math.min(samples.length, i + win);
    for (let j = i; j < end; j++) s += samples[j] * samples[j];
    rms.push(Math.sqrt(s / Math.max(1, end - i)));
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const ref = sorted[Math.floor(sorted.length * 0.95)] || 1;
  return rms.map((v) => Math.round(Math.min(1, v / ref) * 1000) / 1000);
};

const readJson = (p: string) => JSON.parse(readFileSync(p, "utf8"));

const sidecars = (file: string): Pick<AudioInfo, "words" | "mouthCues"> => {
  const base = file.replace(AUDIO_EXT, "");
  const out: Pick<AudioInfo, "words" | "mouthCues"> = {};
  if (existsSync(`${base}.words.json`)) {
    out.words = readJson(`${base}.words.json`) as WordTiming[];
  } else if (existsSync(`${base}.alignment.json`)) {
    const j = readJson(`${base}.alignment.json`);
    const a = j.alignment ?? j.normalized_alignment ?? j;
    out.words = wordsFromCharacterAlignment(a);
  }
  if (existsSync(`${base}.rhubarb.json`)) {
    const j = readJson(`${base}.rhubarb.json`);
    out.mouthCues = (j.mouthCues as { start: number; end: number; value: string }[]).map(
      (c): MouthCue => ({ startMs: Math.round(c.start * 1000), endMs: Math.round(c.end * 1000), value: c.value }),
    );
  }
  return out;
};

const files = walk(PUBLIC)
  .map((p) => relative(PUBLIC, p).split("\\").join("/"))
  .filter((p) => !p.endsWith(".md") && !p.endsWith(".json"))
  .sort();

const manifest: AssetManifest = { generatedAt: new Date().toISOString(), files, audio: {} };
for (const f of files.filter((x) => AUDIO_EXT.test(x))) {
  const abs = join(PUBLIC, f);
  const info: AudioInfo = { durationMs: durationMs(abs) };
  if (VOICE_DIRS.test(f)) {
    info.envelope = envelope(abs);
    Object.assign(info, sidecars(abs));
  }
  manifest.audio[f] = info;
}

writeFileSync(OUT, JSON.stringify(manifest) + "\n");
const voices = Object.keys(manifest.audio).filter((f) => VOICE_DIRS.test(f));
console.log(`Manifiesto: ${files.length} archivos, ${Object.keys(manifest.audio).length} audios (${voices.length} voces).`);
