# Audio

- `dollar/ep01/<id>.wav|mp3` — voces de Dollar, un archivo por intervención.
- `euro/ep01/<id>.wav|mp3` — voces de Euro.
- `ambos/ep01/<id>.wav|mp3` — líneas dichas por los dos a la vez.
- `effects/` — efectos (generados con `npm run sfx`, reemplazables).
- `music/tema-escuela.wav` — música de fondo PROVISIONAL (generada).

El `<id>` es el `id` de la línea en `src/episodes/episode01/episode.ts`.
La lista completa está en `docs/ep01-guion-locucion.md` (`npm run guion`).

Archivos auxiliares opcionales junto a cada voz (mismo nombre base):
- `<id>.alignment.json` — respuesta de ElevenLabs `with-timestamps`.
- `<id>.words.json` — `[{ "text": "Quiubo,", "startMs": 0, "endMs": 420 }, ...]`.
- `<id>.rhubarb.json` — visemas de Rhubarb Lip Sync (`-f json`).

Después de añadir o cambiar audios: `npm run assets` (o reiniciar `npm run dev`).
