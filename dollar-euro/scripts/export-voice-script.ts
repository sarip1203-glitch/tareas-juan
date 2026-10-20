/**
 * Exporta el guion de locución de cada episodio (para actores de voz o para
 * revisar las tomas de TTS): archivo esperado, personaje, texto y dirección.
 * Uso: npm run guion   → docs/<episodio>-guion-locucion.md
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CHARACTERS } from "../src/config/characters";
import { EPISODES } from "../src/episodes/registry";

const DOCS = join(import.meta.dirname, "..", "docs");
mkdirSync(DOCS, { recursive: true });

for (const ep of EPISODES) {
  const out: string[] = [];
  out.push(`# Guion de locución — Episodio ${ep.number}: ${ep.title}`, "");
  out.push("Generado con `npm run guion` desde `src/episodes/" + `episode${String(ep.number).padStart(2, "0")}/episode.ts` + "`. No editar a mano.", "");
  out.push("## Voces", "");
  for (const c of Object.values(CHARACTERS)) out.push(`- **${c.name}**: ${c.voice.description}`);
  out.push(
    "",
    "Reglas: acento paisa natural de Medellín, sin exagerar las muletillas. Pausas, risitas e interrupciones sí; lectura monótona no.",
    "Cada línea es un archivo independiente (WAV o MP3, 44,1 o 48 kHz, mono o estéreo), sin silencios largos al principio ni al final.",
    "",
  );
  for (const s of ep.scenes) {
    out.push(`## Escena ${s.id.slice(1)} — ${s.title}`, "");
    out.push("| Archivo | Quién | Texto | Dirección |", "|---|---|---|---|");
    for (const l of s.lines) {
      const who = l.speaker === "ambos" ? "Ambos" : CHARACTERS[l.speaker].name;
      out.push(`| \`public/audio/${l.speaker}/${ep.id}/${l.id}.wav\` | ${who} | ${l.text} | ${l.direction ?? ""} |`);
    }
    out.push("");
  }
  const file = join(DOCS, `${ep.id}-guion-locucion.md`);
  writeFileSync(file, out.join("\n"));
  console.log("✔", file);
}
