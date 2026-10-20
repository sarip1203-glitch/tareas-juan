// Tipos del sistema de episodios. Un episodio nuevo = un archivo de datos
// que cumpla `EpisodeDefinition` (ver episodes/episode01/episode.ts).

export type CharacterId = "dollar" | "euro";
export type Speaker = CharacterId | "ambos";

export type Expression =
  | "neutral"
  | "happy"
  | "smug"
  | "annoyed"
  | "surprised"
  | "guilty"
  | "nervous"
  | "excited"
  | "confused"
  | "laughing"
  | "proud"
  | "innocent";

// Hacia dónde mira el personaje.
export type Look = "camera" | "other" | "away" | "down" | "up";

export type ActionType =
  | "enter" // entra desde fuera de cuadro por su lado exterior
  | "nudge" // empuja suavemente al otro
  | "getNudged" // recibe el empujón
  | "pawCover" // levanta la pata para tapar al otro
  | "bounce" // salta de emoción
  | "headTilt" // ladea la cabeza (confusión)
  | "nod" // asiente
  | "shakeHead" // niega
  | "shrink" // se encoge (culpa / vergüenza)
  | "lean" // se inclina hacia el otro
  | "wave"; // saluda con la pata

export type ActionCue = {
  type: ActionType;
  // Relativo al inicio de la línea.
  atMs?: number;
  durationMs?: number;
};

export type CharacterDirection = {
  expression?: Expression;
  look?: Look;
  actions?: ActionCue[];
};

export type StudioFraming =
  | "wide"
  | "twoShot"
  | "closeDollar"
  | "closeEuro"
  | "reactionDollar"
  | "reactionEuro"
  | "tipBoard";

export type FlashbackId = "euroSofa" | "dollarBed";

export type ShotSpec =
  | { type: "studio"; framing: StudioFraming; comicZoomAtMs?: number }
  | { type: "flashback"; id: FlashbackId; label: string };

export type TransitionType = "cut" | "whip" | "flash" | "glitch" | "iris";

export type SfxCue = {
  src: string; // relativo a public/
  atMs?: number;
  volume?: number;
};

export type OverlayType =
  | "seriesLogo"
  | "episodeTitle"
  | "poolDream"
  | "sweat"
  | "questionMarks"
  | "hearts"
  | "glitch";

export type OverlayCue = {
  type: OverlayType;
  atMs?: number;
  durationMs?: number;
  // Personaje sobre el que se ancla (burbujas, gotas de sudor...).
  target?: CharacterId;
};

export type TipIllustration =
  | "puppyLearning"
  | "confusedPuppy"
  | "goOutside"
  | "treatReward"
  | "calmCleaning"
  | "patience";

export type TipBeat = {
  illustration: TipIllustration;
  caption: string;
  // Elemento de la fórmula (1 = RUTINA, 2 = PACIENCIA, 3 = PREMIOS) que se
  // ilumina en esta línea. Un número mayor que la fórmula = fórmula completa.
  formulaStep?: number;
};

export type DialogueLine = {
  id: string; // también es el nombre del archivo de audio
  speaker: Speaker;
  text: string; // texto para subtítulos y para locución
  direction?: string; // indicación de actuación de voz
  highlight?: string[]; // palabras graciosas a resaltar
  shot?: ShotSpec; // si falta, se mantiene el plano anterior
  cast?: Partial<Record<CharacterId, CharacterDirection>>;
  pauseAfterMs?: number; // silencio tras la línea (por defecto 350)
  interrupt?: boolean; // la siguiente línea entra casi pegada (interrupción)
  sfx?: SfxCue[];
  overlays?: OverlayCue[];
  tip?: TipBeat;
  audio?: string; // ruta explícita (si no, se usa la convención)
  video?: string; // clip animado pre-generado para esta línea (public/)
};

export type SceneDefinition = {
  id: string;
  title: string;
  transitionIn?: TransitionType;
  leadInMs?: number; // tiempo antes de la primera línea
  tailMs?: number; // tiempo después de la última línea
  tailOverlays?: OverlayCue[]; // overlays que aparecen en la cola
  tailSfx?: SfxCue[];
  lines: DialogueLine[];
};

export type EpisodeDefinition = {
  id: string; // ep01
  compositionId: string;
  number: number;
  title: string;
  topic: string;
  objective: string;
  targetDurationSec: [number, number];
  music?: { src: string; volume: number; duckedVolume: number };
  formula: string[]; // p. ej. ["RUTINA", "PACIENCIA", "PREMIOS"]
  lessonLabel: string;
  scenes: SceneDefinition[];
  outro: {
    durationMs: number;
    nextEpisodeTitle: string;
    nextEpisodeNumber: number;
  };
};
