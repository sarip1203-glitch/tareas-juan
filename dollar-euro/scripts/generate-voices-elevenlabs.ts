/**
 * Genera las voces con ElevenLabs (opcional). Cada intervención se guarda
 * como archivo independiente + sus tiempos por carácter, para que los
 * subtítulos y la boca usen los tiempos REALES del audio.
 *
 * Requisitos (variables de entorno):
 *   ELEVENLABS_API_KEY
 *   ELEVENLABS_VOICE_DOLLAR   voice_id para Dollar (paisa, medio-grave)
 *   ELEVENLABS_VOICE_EURO     voice_id para Euro (paisa, juvenil)
 *   ELEVENLABS_MODEL          opcional (por defecto eleven_multilingual_v2)
 *
 * Uso:
 *   npm run voices                       # todo lo que falte del ep01
 *   npm run voices -- --episode ep01 --line s1_l2_euro --force
 *
 * Importante: ElevenLabs no garantiza un acento paisa. Escuchen cada toma;
 * si el acento suena mexicano, español o neutro, regrábenla o usen un
 * locutor real (ver README, "Voces").
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CHARACTERS } from "../src/config/characters";
import { EPISODES } from "../src/episodes/registry";
import type { CharacterId, DialogueLine } from "../src/episodes/types";

const PUBLIC = join(import.meta.dirname, "..", "public");
const API = "https://api.elevenlabs.io/v1/text-to-speech";
const key = process.env.ELEVENLABS_API_KEY;
const model = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2";

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};
const force = process.argv.includes("--force");
const onlyEpisode = arg("episode");
const onlyLine = arg("line");

if (!key) {
  console.error("Falta ELEVENLABS_API_KEY. No se generó ningún audio.");
  process.exit(1);
}

type Alignment = {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
};

const tts = async (character: CharacterId, text: string, previous?: string, next?: string) => {
  const cfg = CHARACTERS[character].voice;
  const voiceId = process.env[cfg.elevenLabsVoiceEnv];
  if (!voiceId) throw new Error(`Falta la variable ${cfg.elevenLabsVoiceEnv} (voice_id de ${character}).`);
  const res = await fetch(`${API}/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: model,
      previous_text: previous,
      next_text: next,
      voice_settings: {
        stability: cfg.stability,
        similarity_boost: cfg.similarityBoost,
        style: cfg.style,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { audio_base64: string; alignment: Alignment };
  return { audio: Buffer.from(json.audio_base64, "base64"), alignment: json.alignment };
};

const ffmpeg = () => (spawnSync("ffmpeg", ["-version"]).status === 0 ? ["ffmpeg"] : ["npx", "remotion", "ffmpeg"]);

const run = async () => {
  for (const ep of EPISODES) {
    if (onlyEpisode && ep.id !== onlyEpisode) continue;
    const lines: DialogueLine[] = ep.scenes.flatMap((s) => s.lines);
    for (const [i, line] of lines.entries()) {
      if (onlyLine && line.id !== onlyLine) continue;
      const out = join(PUBLIC, "audio", line.speaker, ep.id, `${line.id}.mp3`);
      if (existsSync(out) && !force) {
        console.log(`· ya existe ${line.id}`);
        continue;
      }
      mkdirSync(dirname(out), { recursive: true });
      const prev = lines[i - 1]?.text;
      const next = lines[i + 1]?.text;
      console.log(`→ ${line.id} (${line.speaker}): ${line.text}`);
      if (line.speaker === "ambos") {
        // Dos tomas mezcladas: suenan las dos voces a la vez.
        const a = await tts("dollar", line.text, prev, next);
        const b = await tts("euro", line.text, prev, next);
        const ta = `${out}.dollar.mp3`;
        const tb = `${out}.euro.mp3`;
        writeFileSync(ta, a.audio);
        writeFileSync(tb, b.audio);
        const [cmd, ...pre] = ffmpeg();
        const r = spawnSync(cmd, [...pre, "-y", "-v", "error", "-i", ta, "-i", tb, "-filter_complex", "amix=inputs=2:normalize=0", out]);
        if (r.status !== 0) throw new Error(`ffmpeg no pudo mezclar ${line.id}: ${r.stderr}`);
        rmSync(ta);
        rmSync(tb);
        writeFileSync(out.replace(/\.mp3$/, ".alignment.json"), JSON.stringify(a.alignment));
      } else {
        const r = await tts(line.speaker, line.text, prev, next);
        writeFileSync(out, r.audio);
        writeFileSync(out.replace(/\.mp3$/, ".alignment.json"), JSON.stringify(r.alignment));
      }
    }
  }
  console.log("\nListo. Ejecuten `npm run assets` (o `npm run dev`) para recalcular los tiempos.");
};

run().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
