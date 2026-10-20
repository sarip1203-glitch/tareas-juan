# DOLLAR & EURO — Escuela para humanos

Serie animada vertical (9:16, 1080×1920, 30 fps) hecha con **Remotion + React + TypeScript**.
Dos pastores de Shetland paisas les enseñan a los humanos cómo entenderlos.

Episodio 1: **¿Quién se hizo chichí en la casa?**, sobre enseñar a un cachorro dónde hacer sus necesidades con rutina, paciencia y premios.

> **Estado: borrador funcional.** El episodio compila, se ve en Remotion Studio y se exporta a MP4, pero
> **todavía no tiene voces** (los tiempos se estiman a partir del texto). Los perros son **imágenes realistas
> animadas en 2.5D por capas** (cabeza, mandíbula, párpados), no animación 3D. El video lo marca en pantalla
> con un aviso "BORRADOR". Detalles en [Estado actual](#estado-actual).

---

## Requisitos

- Node.js 20.19+ o 22.13+.
- `npm install` dentro de esta carpeta.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Escanea `public/` y abre **Remotion Studio** (vista previa). |
| `npm run check` | Muestra la línea de tiempo y detecta solapamientos, escenas recortadas y audios faltantes. |
| `npm run render` | Exporta `out/ep01-quien-se-hizo-chichi.mp4` (H.264 + AAC, 1080×1920), con avisos de borrador. |
| `npm run render:final` | Igual, pero **sin** los avisos de borrador (solo cuando ya estén voces y fotos). |
| `npm run still` | Exporta un fotograma de prueba a `out/fotograma.png`. |
| `npm run assets` | Regenera `src/generated/asset-manifest.json` (archivos disponibles, duraciones reales y envolventes de voz). |
| `npm run guion` | Genera `docs/ep01-guion-locucion.md`: qué archivo grabar, quién lo dice y con qué intención. |
| `npm run voices` | (Opcional) Genera las voces con ElevenLabs. Ver [Voces](#voces). |
| `npm run sfx` | Regenera los efectos y la música provisional sintetizados por código. |
| `npm run lint` | ESLint + TypeScript. |

**Redes restringidas.** Remotion descarga su propio Chrome la primera vez. Si no puede, indíquenle uno local:
`REMOTION_BROWSER=/ruta/a/chrome-headless-shell npm run render`.

---

## Dónde va cada cosa

```
dollar-euro/
├─ public/
│  ├─ characters/dollar|euro/   fotos recortadas (cutout.png o body/head/jaw.png)
│  ├─ backgrounds/estudio.png   (opcional) fondo propio del estudio
│  ├─ audio/dollar|euro|ambos/ep01/<id>.wav|mp3   una voz por intervención
│  ├─ audio/effects/  audio/music/   efectos y música
│  ├─ videos/ep01/              clips animados pre-generados (opcional)
│  └─ fonts/                    Baloo 2 y Lilita One (OFL)
├─ src/
│  ├─ episodes/episode01/episode.ts   ← EL EPISODIO (guion, planos, gestos, consejos)
│  ├─ episodes/types.ts               formato de un episodio
│  ├─ episodes/registry.ts            lista de episodios registrados
│  ├─ config/characters.ts            identidad, colores, voces de Dollar y Euro
│  ├─ config/video.ts                 formato y zonas seguras de redes
│  ├─ components/                     piezas reutilizables (ver abajo)
│  ├─ scenes/                         StudioScene, FlashbackScene, fichas de personaje
│  ├─ utils/                          línea de tiempo, sincronía labial, texto
│  ├─ Episode.tsx  Root.tsx  index.ts
├─ scripts/                           assets, verificación, voces, guion, sfx
└─ docs/ep01-guion-locucion.md        guion para grabar
```

Cada carpeta de `public/` tiene un `LEEME.md` con el formato exacto que espera.

### Personajes: imágenes y fotografías

En `docs/referencias/` hay dos tipos de imágenes:

- **Fotos reales**: `dollar-ladrillos.jpg` y `euro-sofa.jpg`. Son la referencia de identidad.
- **Imágenes de estilo**: `estilo-dollar.webp` (Dollar de pie, más oscuro) y `estilo-euro.webp` (Euro sentado, con la lengua afuera). Es el look que se busca.

Los perros del video salen de las **imágenes de estilo**, convertidas en una marioneta 2.5D por capas:

1. `scripts/prepare-photo-puppet.py` quita el fondo con IA en local (rembg) y separa cada imagen en `body.png`, `head.png` y `jaw.png` dentro de `public/characters/<perro>/`.
2. `src/config/puppets.json` guarda los puntos de cada imagen: cabeza, pivote del cuello, mandíbula, boca y ojos.
3. `components/character/PhotoPuppet.tsx` las anima con la misma pose que el resto del sistema:
   - la cabeza se inclina, gira y asiente;
   - la mandíbula baja con la voz;
   - los párpados (hechos con el propio pelo de encima del ojo) parpadean;
   - el cuerpo respira;
   - las acciones mueven al perro entero.

   No mueve pupilas, cejas, orejas, cola ni patas sueltas.

Para cambiar o mejorar una imagen:

1. Reemplacen el archivo en `docs/referencias/` y ajusten sus puntos en `puppets.json`.
2. Ejecuten:
   ```
   pip install "rembg[cpu]" pillow numpy
   python scripts/prepare-photo-puppet.py
   npm run assets
   ```

Si se borran las capas, el sistema vuelve solo al rig SVG dibujado. Ese rig usa los colores y las marcas de las fotos reales (`palette` y `markings` en `src/config/characters.ts`):

- **Dollar**: casi negro, cara dorada, pechera estrecha, patas canela arriba y blancas abajo, ojos almendrados.
- **Euro**: melena marrón oscuro, cara canela, pechera grande, patas blancas, ojos redondos.

Nunca hay que intercambiar estos valores entre los dos.

### Voces

Remotion **no genera voces**. Cada intervención es un archivo aparte, así que se puede corregir una toma sin rehacer el episodio:

```
public/audio/dollar/ep01/s1_l1_dollar.wav
public/audio/euro/ep01/s1_l2_euro.wav
public/audio/ambos/ep01/s6_l3_ambos.wav
...
```

La lista completa, con la dirección de actuación de cada línea, está en `docs/ep01-guion-locucion.md`.

- **Locutores reales (recomendado para el acento paisa):** graben cada línea con el nombre indicado (WAV o MP3) y ejecuten `npm run dev` o `npm run assets`.
- **ElevenLabs:** definan `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_DOLLAR` y `ELEVENLABS_VOICE_EURO` (y opcionalmente `ELEVENLABS_MODEL`). Luego ejecuten `npm run voices`. Se guarda el MP3 y su `*.alignment.json` con tiempos por carácter. Revisen el acento toma por toma: ningún TTS garantiza un paisa natural.
- **Otro TTS:** sirve cualquier servicio que entregue WAV o MP3. Si además da tiempos por palabra, guárdenlos como `<id>.words.json`.

Al añadir audios, la duración de cada línea, los subtítulos y las escenas se recalculan **a partir del audio real**. Las líneas nunca se solapan y ninguna escena se corta antes de terminar su frase.

### Sincronía labial

El sistema usa la mejor fuente disponible para cada línea:

1. **Visemas** (`<id>.rhubarb.json`, de [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync)): para español, usen el reconocedor fonético.
   `rhubarb -r phonetic -f json -o s1_l1_dollar.rhubarb.json s1_l1_dollar.wav`
2. **Energía del audio real**: se calcula sola con `npm run assets`, fotograma a fotograma.
3. **Provisional**: sin audio, la boca se anima con las sílabas estimadas del texto. No es sincronía real.

### Subtítulos

Son grandes, de hasta 2 renglones y salen dentro de la zona segura de TikTok, Reels y Shorts, sin tapar las caras. Dollar va en azul y Euro en amarillo. La palabra activa se resalta y las palabras graciosas (`highlight` en cada línea) salen en una etiqueta de color.

El orden de prioridad de los tiempos es:

1. Tiempos por palabra (`.alignment.json` o `.words.json`).
2. Reparto proporcional dentro de la duración real del audio.
3. Estimación desde el texto (solo en el borrador).

### Clips de video

Para usar animaciones ya generadas, pongan el MP4 vertical en `public/videos/ep01/` y añadan `video: "videos/ep01/<archivo>.mp4"` a la línea. Se muestra durante esa línea, con los subtítulos encima.

---

## Crear un episodio nuevo

1. Copiar `src/episodes/episode01/` a `src/episodes/episode02/` y editar `episode.ts`:
   - número, título, tema, objetivo, fórmula del consejo;
   - escenas, cada una con sus líneas (`speaker`, `text`, `direction`, `highlight`, `shot`, `cast`);
   - consejos (`tip`), gags (`overlays`), efectos (`sfx`) y el avance (`outro`).
2. Registrarlo en `src/episodes/registry.ts`.
3. `npm run guion` → grabar las voces → `npm run check` → `npm run dev` → `npm run render`.

Lo que se puede usar en un episodio está en `src/episodes/types.ts`:

- **Planos (`shot`):** `wide`, `twoShot`, `closeDollar`, `closeEuro`, `reactionDollar`, `reactionEuro`, `tipBoard` y `flashback`. `comicZoomAtMs` añade un zoom cómico.
- **Expresiones:** `neutral`, `happy`, `smug`, `annoyed`, `surprised`, `guilty`, `nervous`, `excited`, `confused`, `laughing`, `proud` e `innocent`.
- **Miradas:** `camera`, `other`, `away`, `down` y `up`.
- **Acciones:** `enter`, `nudge`, `getNudged`, `pawCover`, `bounce`, `headTilt`, `nod`, `shakeHead`, `shrink`, `lean` y `wave`.
- **Transiciones:** `cut`, `whip`, `flash`, `glitch` e `iris`.
- **Gags:** `seriesLogo`, `episodeTitle`, `poolDream`, `sweat`, `hearts`, `questionMarks` y `glitch`.

Para un flashback o una ilustración educativa nueva hay que añadir su dibujo en `scenes/FlashbackScene.tsx` o en `components/TipIllustrations.tsx`.

## Componentes

| Componente | Archivo |
|---|---|
| Intro (logo + título del episodio) | `components/Intro.tsx` |
| Character (marioneta realista / rig, misma pose) | `components/character/Character.tsx`, `PhotoPuppet.tsx`, `DogRig.tsx`, `pose.ts` |
| CharacterDialogue | `components/CharacterDialogue.tsx` |
| StudioScene | `scenes/StudioScene.tsx` + `components/StudioSet.tsx` + `components/Camera.tsx` |
| FlashbackScene | `scenes/FlashbackScene.tsx` |
| ReactionShot | `components/ReactionShot.tsx` |
| EducationalTip | `components/EducationalTip.tsx` + `components/TipIllustrations.tsx` |
| DynamicCaptions | `components/DynamicCaptions.tsx` |
| DialogueAudio (voces, efectos, música con ducking) | `components/DialogueAudio.tsx` |
| SceneTransition | `components/SceneTransition.tsx` |
| EpisodeOutro | `components/EpisodeOutro.tsx` |

En Studio también están las fichas **Personajes → Ficha-Dollar / Ficha-Euro**, con las 12 expresiones del rig dibujado. Ese rig es la versión de respaldo y también se usa en las ilustraciones del tablero educativo.

---

## Estado actual

**Implementado y verificado:**

- El proyecto compila (`npm run lint`), se previsualiza en Studio y exporta MP4 1080×1920 H.264/AAC.
- Las 6 escenas del episodio 1 están montadas: presentación, tema, confesiones con 2 flashbacks, consejo con tablero educativo, remate y cierre. Le sigue la pantalla final con el avance del capítulo 2.
- Los personajes son reutilizables: expresiones, miradas, parpadeo, respiración, orejas, cola, boca y acciones.
- Cámara con 7 planos, empuje lento, zoom cómico y plano de reacción.
- Transiciones, gags, subtítulos dinámicos y aviso de borrador.
- Sistema de audio por línea, con duraciones reales, envolventes, alineación de ElevenLabs y Rhubarb.
- Efectos de sonido y música de fondo propios, sintetizados por código (sin derechos de terceros).

**Provisional (no es el producto final):**

- **Voces:** no hay ninguna grabada. Los tiempos de subtítulos y escenas son estimados y el video **no tiene diálogo audible**: solo música y efectos.
- **Personajes:** imágenes realistas animadas por capas (2.5D). La cabeza, la boca y los párpados se mueven, pero las orejas, la cola, las patas y la mirada no. En los flashbacks, los "cachorros" son los mismos perros más pequeños y con la cabeza agrandada, no cachorros reales. El "tapar con la pata" del remate se resuelve con Dollar lanzándose delante de Euro.
- **Sincronía labial:** sílabas estimadas del texto. Se vuelve real al añadir los audios o los visemas.
- **Música:** tema sintetizado de relleno. Reemplazar `public/audio/music/tema-escuela.wav`.
- **Duración:** con el guion completo, la estimación da unos 2 minutos, más que el objetivo de 75–90 s. La duración real saldrá de las voces; si se pasa, hay que acelerar la locución o recortar líneas en `episode.ts`.

## Qué falta para la versión animada final

1. **Más fotografías** de Dollar y Euro (perfil, cuerpo entero, cola, patas traseras, de cachorros si existen), para afinar la identidad visual. Las de frente ya están en `docs/referencias/`.
2. **Voces finales**: locutores paisas o TTS revisado toma por toma, un archivo por línea. Después, `npm run assets`.
3. **Visemas Rhubarb** de cada voz, para que la boca siga los fonemas.
4. **Animación cinematográfica completa**: para orejas, cola, patas, mirada y movimientos reales, lo viable es generar clips con una herramienta de video IA a partir de `docs/referencias/estilo-*.webp`, o animar en 3D. Los clips se exportan verticales, por línea o por plano, y se asignan con `video:` en el episodio. Remotion ya se encarga del montaje, el audio, los subtítulos y las transiciones.
5. **Música final** con licencia adecuada.
6. Quitar los avisos con `npm run render:final`.
