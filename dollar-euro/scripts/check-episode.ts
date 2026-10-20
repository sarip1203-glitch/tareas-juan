/**
 * Verifica los episodios: duración total, tiempos de cada línea, origen de
 * los tiempos (audio real / estimado), solapamientos y recursos faltantes.
 * Uso: npm run check  [-- --stills]   (--stills imprime fotogramas de muestra)
 */
import { EPISODES, RESOLVED } from "../src/episodes/registry";
import { hasAsset } from "../src/utils/assets";

const sec = (frames: number, fps: number) => (frames / fps).toFixed(2).padStart(6);
let problems = 0;

for (const def of EPISODES) {
  const ep = RESOLVED[def.id];
  const fps = ep.fps;
  console.log(`\n=== ${def.compositionId} — ${def.title}`);
  console.log(`Duración total: ${(ep.totalFrames / fps).toFixed(1)} s (${ep.totalFrames} fotogramas)  objetivo ${def.targetDurationSec.join("–")} s`);
  for (const s of ep.scenes) {
    console.log(`\n[${s.def.id}] ${s.def.title}  ${sec(s.startFrame, fps)}s → ${sec(s.endFrame, fps)}s`);
    for (const l of s.lines) {
      const src = l.timingSource === "estimated" ? "ESTIMADO" : l.timingSource === "alignment" ? "audio+palabras" : "audio";
      console.log(`  ${sec(l.startFrame, fps)}–${sec(l.endFrame, fps)}  ${l.speaker.padEnd(6)} ${src.padEnd(14)} ${l.id}  "${l.text.slice(0, 48)}${l.text.length > 48 ? "…" : ""}"`);
    }
  }
  // Solapamientos de diálogo.
  ep.lines.forEach((l, i) => {
    const n = ep.lines[i + 1];
    if (n && n.startFrame < l.endFrame) {
      problems++;
      console.log(`✖ Solapamiento: ${l.id} termina después de que empieza ${n.id}`);
    }
  });
  // Escenas que terminan antes que su última frase.
  ep.scenes.forEach((s) => {
    const last = s.lines[s.lines.length - 1];
    if (last && last.endFrame > s.endFrame) {
      problems++;
      console.log(`✖ La escena ${s.def.id} termina antes que la frase ${last.id}`);
    }
  });
  const missingSfx = [...new Set(ep.sfx.map((x) => x.src).filter((x) => !hasAsset(x)))];
  missingSfx.forEach((m) => console.log(`⚠ Efecto no encontrado: ${m}`));
  if (def.music && !hasAsset(def.music.src)) console.log(`⚠ Música no encontrada: ${def.music.src}`);

  console.log(`\nVoces: ${ep.stats.withRealAudio}/${ep.stats.lines} con audio real.`);
  if (ep.stats.missingAudio.length) {
    console.log(`⚠ ${ep.stats.missingAudio.length} audios pendientes (los tiempos son ESTIMADOS y la boca es PROVISIONAL):`);
    ep.stats.missingAudio.forEach((m) => console.log(`   public/${m}`));
  }
  if (process.argv.includes("--stills")) {
    console.log("\nFotogramas de muestra (mitad de cada plano):");
    ep.segments.forEach((s) => console.log(`  ${Math.round(s.from + s.durationInFrames / 2)}  ${s.sceneId} ${s.shot.type === "studio" ? s.shot.framing : s.shot.id}`));
  }
}

if (problems > 0) {
  console.log(`\n${problems} problema(s) de tiempos.`);
  process.exit(1);
}
console.log("\n✔ Sin solapamientos ni escenas recortadas.");
