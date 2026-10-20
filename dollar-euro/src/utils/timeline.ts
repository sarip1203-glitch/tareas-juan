import { CHARACTERS } from "../config/characters";
import { VIDEO, msToFrames } from "../config/video";
import type {
  CharacterDirection,
  CharacterId,
  DialogueLine,
  EpisodeDefinition,
  Expression,
  OverlayCue,
  SceneDefinition,
  SfxCue,
  ShotSpec,
  TransitionType,
} from "../episodes/types";
import {
  AUDIO_EXTENSIONS,
  type WordTiming,
  findFirstExisting,
  getAudioInfo,
} from "./assets";
import { type MouthTrack, buildSyntheticPulses } from "./lipsync";
import { distributeWords } from "./words";

// Construye la línea de tiempo del episodio a partir de las duraciones
// REALES de los audios (o estimaciones marcadas cuando faltan).

export type TimingSource = "alignment" | "audio-proportional" | "estimated";

export type ResolvedLine = DialogueLine & {
  sceneId: string;
  index: number;
  startFrame: number; // inicio de la voz
  endFrame: number; // fin de la voz
  spanEndFrame: number; // hasta donde "manda" esta línea (incluye la pausa)
  durationMs: number;
  audioSrc?: string;
  expectedAudio: string;
  timingSource: TimingSource;
  words: WordTiming[]; // ms relativos al inicio de la línea
  mouth: MouthTrack;
  resolvedShot: ShotSpec;
  directions: Record<CharacterId, Required<Pick<CharacterDirection, "expression" | "look">> & CharacterDirection>;
};

export type ResolvedScene = {
  def: SceneDefinition;
  startFrame: number;
  endFrame: number;
  tailStartFrame: number;
  lines: ResolvedLine[];
};

export type Segment = {
  key: string;
  sceneId: string;
  shot: ShotSpec;
  from: number;
  durationInFrames: number;
  transitionIn: TransitionType;
  lineIds: string[];
};

export type TimedOverlay = OverlayCue & { from: number; durationInFrames: number; key: string };
export type TimedSfx = SfxCue & { from: number; key: string };

export type ResolvedEpisode = {
  def: EpisodeDefinition;
  fps: number;
  scenes: ResolvedScene[];
  lines: ResolvedLine[];
  segments: Segment[];
  overlays: TimedOverlay[];
  sfx: TimedSfx[];
  outro: { from: number; durationInFrames: number };
  totalFrames: number;
  stats: {
    lines: number;
    withRealAudio: number;
    estimated: number;
    missingAudio: string[];
  };
};

const DEFAULT_PAUSE_MS = 280;
const INTERRUPT_PAUSE_MS = 60;

const audioFolder = (line: DialogueLine) => line.speaker;

const expectedAudioPath = (episodeId: string, line: DialogueLine) =>
  `audio/${audioFolder(line)}/${episodeId}/${line.id}.wav`;

const findLineAudio = (episodeId: string, line: DialogueLine) => {
  if (line.audio) return findFirstExisting([line.audio]);
  return findFirstExisting(
    AUDIO_EXTENSIONS.map((ext) => `audio/${audioFolder(line)}/${episodeId}/${line.id}.${ext}`),
  );
};

const charsPerSecond = (line: DialogueLine) =>
  line.speaker === "ambos"
    ? CHARACTERS.dollar.voice.estimatedCharsPerSecond
    : CHARACTERS[line.speaker].voice.estimatedCharsPerSecond;

export const buildTimeline = (def: EpisodeDefinition, fps: number = VIDEO.fps): ResolvedEpisode => {
  const scenes: ResolvedScene[] = [];
  const lines: ResolvedLine[] = [];
  const overlays: TimedOverlay[] = [];
  const sfx: TimedSfx[] = [];
  const missingAudio: string[] = [];

  const lastExpression: Record<CharacterId, Expression> = { dollar: "neutral", euro: "neutral" };
  let lastShot: ShotSpec = { type: "studio", framing: "wide" };
  let cursor = 0;
  let index = 0;

  for (const scene of def.scenes) {
    const sceneStart = cursor;
    cursor += msToFrames(scene.leadInMs ?? 0, fps);
    const sceneLines: ResolvedLine[] = [];

    for (const line of scene.lines) {
      const audioSrc = findLineAudio(def.id, line);
      const info = audioSrc ? getAudioInfo(audioSrc) : undefined;
      const cps = charsPerSecond(line);

      let words: WordTiming[];
      let durationMs: number;
      let timingSource: TimingSource;
      if (info && info.words && info.words.length > 0) {
        words = info.words;
        durationMs = info.durationMs;
        timingSource = "alignment";
      } else if (info) {
        const d = distributeWords(line.text, cps, info.durationMs);
        words = d.words;
        durationMs = info.durationMs;
        timingSource = "audio-proportional";
      } else {
        const d = distributeWords(line.text, cps);
        words = d.words;
        durationMs = d.durationMs;
        timingSource = "estimated";
        missingAudio.push(line.audio ?? expectedAudioPath(def.id, line));
      }

      let mouth: MouthTrack;
      if (info?.mouthCues && info.mouthCues.length > 0) {
        mouth = { kind: "visemes", cues: info.mouthCues };
      } else if (info?.envelope && info.envelope.length > 0) {
        mouth = { kind: "envelope", envelope: info.envelope, fps };
      } else {
        mouth = { kind: "synthetic", pulses: buildSyntheticPulses(words) };
      }

      const directions = {} as ResolvedLine["directions"];
      (["dollar", "euro"] as CharacterId[]).forEach((id) => {
        const d = line.cast?.[id] ?? {};
        const speaking = line.speaker === id || line.speaker === "ambos";
        const expression = d.expression ?? lastExpression[id];
        lastExpression[id] = expression;
        directions[id] = { ...d, expression, look: d.look ?? (speaking ? "camera" : "other") };
      });

      lastShot = line.shot ?? lastShot;
      const startFrame = cursor;
      const endFrame = startFrame + Math.ceil((durationMs / 1000) * fps);
      const pause = line.interrupt ? INTERRUPT_PAUSE_MS : (line.pauseAfterMs ?? DEFAULT_PAUSE_MS);
      cursor = endFrame + msToFrames(Math.max(0, pause), fps);

      const resolved: ResolvedLine = {
        ...line,
        sceneId: scene.id,
        index: index++,
        startFrame,
        endFrame,
        spanEndFrame: cursor,
        durationMs,
        audioSrc,
        expectedAudio: line.audio ?? expectedAudioPath(def.id, line),
        timingSource,
        words,
        mouth,
        resolvedShot: lastShot,
        directions,
      };
      sceneLines.push(resolved);

      (line.overlays ?? []).forEach((o, i) => {
        const from = Math.max(sceneStart, startFrame + msToFrames(o.atMs ?? 0, fps));
        const durationInFrames = o.durationMs
          ? msToFrames(o.durationMs, fps)
          : Math.max(1, endFrame - from);
        overlays.push({ ...o, from, durationInFrames, key: `${line.id}-ov${i}` });
      });
      (line.sfx ?? []).forEach((s, i) => {
        sfx.push({ ...s, from: startFrame + msToFrames(s.atMs ?? 0, fps), key: `${line.id}-sfx${i}` });
      });
    }

    const tailStart = cursor;
    cursor += msToFrames(scene.tailMs ?? 0, fps);
    // La última línea manda también durante la cola de la escena.
    if (sceneLines.length > 0) sceneLines[sceneLines.length - 1].spanEndFrame = cursor;

    (scene.tailOverlays ?? []).forEach((o, i) => {
      overlays.push({
        ...o,
        from: tailStart + msToFrames(o.atMs ?? 0, fps),
        durationInFrames: msToFrames(o.durationMs ?? scene.tailMs ?? 1000, fps),
        key: `${scene.id}-tail-ov${i}`,
      });
    });
    (scene.tailSfx ?? []).forEach((s, i) => {
      sfx.push({ ...s, from: tailStart + msToFrames(s.atMs ?? 0, fps), key: `${scene.id}-tail-sfx${i}` });
    });

    scenes.push({ def: scene, startFrame: sceneStart, endFrame: cursor, tailStartFrame: tailStart, lines: sceneLines });
    lines.push(...sceneLines);
  }

  // Segmentos de plano: líneas consecutivas con el mismo plano.
  const segments: Segment[] = [];
  for (const scene of scenes) {
    scene.lines.forEach((line, i) => {
      const key = JSON.stringify(line.resolvedShot);
      const prev = segments[segments.length - 1];
      if (i > 0 && prev && prev.key === key && prev.sceneId === scene.def.id) {
        prev.lineIds.push(line.id);
        return;
      }
      const from = i === 0 ? scene.startFrame : line.startFrame;
      let transitionIn: TransitionType = "cut";
      if (i === 0) {
        transitionIn = scene.def.transitionIn ?? "cut";
      } else if (prev && prev.shot.type !== line.resolvedShot.type) {
        transitionIn = "flash";
      }
      segments.push({ key, sceneId: scene.def.id, shot: line.resolvedShot, from, durationInFrames: 0, transitionIn, lineIds: [line.id] });
    });
  }
  const scenesEnd = cursor;
  segments.forEach((s, i) => {
    const next = segments[i + 1];
    s.durationInFrames = (next ? next.from : scenesEnd) - s.from;
  });

  const outroFrames = msToFrames(def.outro.durationMs, fps);

  return {
    def,
    fps,
    scenes,
    lines,
    segments,
    overlays,
    sfx,
    outro: { from: scenesEnd, durationInFrames: outroFrames },
    totalFrames: scenesEnd + outroFrames,
    stats: {
      lines: lines.length,
      withRealAudio: lines.filter((l) => l.audioSrc).length,
      estimated: lines.filter((l) => l.timingSource === "estimated").length,
      missingAudio,
    },
  };
};

// Línea que "manda" en un fotograma (incluye su pausa posterior; durante el
// lead-in de una escena manda ya la primera línea de esa escena).
export const lineAtFrame = (ep: ResolvedEpisode, frame: number): ResolvedLine | undefined =>
  ep.lines.find((l) => frame < l.spanEndFrame);
