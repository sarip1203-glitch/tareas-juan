import type { CharacterId } from "../episodes/types";

/**
 * Identidad de los personajes.
 *
 * Paletas y marcas tomadas de las fotografías reales
 * (docs/referencias/dollar-ladrillos.jpg y docs/referencias/euro-sofa.jpg):
 *  - Dollar: sable muy sombreado, cuerpo y melena casi negros, cara dorada
 *    con sombra oscura alrededor de los ojos, pechera blanca estrecha,
 *    patas canela arriba y blancas abajo, ojos almendrados.
 *  - Euro: sable con melena marrón muy oscuro, cara canela anaranjada,
 *    pechera blanca grande, patas blancas, ojos redondos.
 * Ninguno tiene lista blanca en la frente. Nunca intercambiar estos valores.
 * Los colores del collar (azul / amarillo) coinciden con sus subtítulos.
 */
export type FurPalette = {
  coat: string; // cuerpo, cuartos traseros, cola
  coatDark: string;
  coatLight: string;
  mane: string; // melena que enmarca la cara y orejas
  maneLight: string;
  face: string; // cara
  faceLight: string;
  faceDark: string; // sombra alrededor de ojos / frente
  muzzle: string;
  chin: string;
  white: string; // pechera y patas
  whiteShade: string;
  nose: string;
  iris: string;
  innerEar: string;
};

export type Markings = {
  blaze: boolean; // lista blanca en la frente
  ruffWidth: number; // ancho relativo de la pechera blanca
  legs: "white" | "socks"; // "socks" = canela arriba, blancas abajo
  eyes: "round" | "almond";
  tailTip: boolean; // punta blanca en la cola
};

export type VoiceConfig = {
  // Descripción para casting o para elegir voz en un proveedor TTS.
  description: string;
  // Variable de entorno con el voice_id de ElevenLabs (u otro proveedor).
  elevenLabsVoiceEnv: string;
  stability: number;
  similarityBoost: number;
  style: number;
  // Caracteres por segundo usados SOLO para estimar tiempos cuando todavía
  // no existe el audio real.
  estimatedCharsPerSecond: number;
};

export type PhotoRigConfig = {
  // Punto de giro de la cabeza dentro de head.png (fracción 0..1).
  headPivot: [number, number];
  // Desplazamiento máximo de jaw.png al abrir la boca (px de la imagen).
  jawTravelPx: number;
};

export type CharacterConfig = {
  id: CharacterId;
  name: string;
  captionColor: string;
  captionTextOnColor: string;
  collarColor: string;
  tagLetter: string;
  palette: FurPalette;
  markings: Markings;
  palettesAreProvisional: boolean;
  voice: VoiceConfig;
  // Posición en el estudio (coordenadas del mundo 1080×1920, base de las patas).
  studioAnchor: { x: number; y: number };
  // Lado hacia el que levanta la pata para tapar al otro.
  nearSide: "left" | "right";
  photo: PhotoRigConfig;
};

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  dollar: {
    id: "dollar",
    name: "Dollar",
    captionColor: "#3FA9FF",
    captionTextOnColor: "#071B33",
    collarColor: "#1E7BE6",
    tagLetter: "D",
    palette: {
      coat: "#2B2526",
      coatDark: "#141011",
      coatLight: "#4E3E34",
      mane: "#1C1617",
      maneLight: "#3E3330",
      face: "#B9875C",
      faceLight: "#D8AC80",
      faceDark: "#8A5F40",
      muzzle: "#BF9068",
      chin: "#E2CDB6",
      white: "#F3EEE8",
      whiteShade: "#CBBFB4",
      nose: "#161314",
      iris: "#3A2416",
      innerEar: "#7A5A44",
    },
    markings: { blaze: false, ruffWidth: 0.72, legs: "socks", eyes: "almond", tailTip: false },
    palettesAreProvisional: false,
    voice: {
      description:
        "Hombre, paisa natural de Medellín, tono medio-grave, seguro, humor seco e irónico. Ritmo pausado.",
      elevenLabsVoiceEnv: "ELEVENLABS_VOICE_DOLLAR",
      stability: 0.45,
      similarityBoost: 0.8,
      style: 0.35,
      estimatedCharsPerSecond: 17.5,
    },
    studioAnchor: { x: 300, y: 1530 },
    nearSide: "right",
    photo: { headPivot: [0.5, 0.85], jawTravelPx: 26 },
  },
  euro: {
    id: "euro",
    name: "Euro",
    captionColor: "#FFD23F",
    captionTextOnColor: "#2E2300",
    collarColor: "#F5C211",
    tagLetter: "E",
    palette: {
      coat: "#3A332B",
      coatDark: "#1F1C19",
      coatLight: "#6A5845",
      mane: "#2E2924",
      maneLight: "#5C4C3A",
      face: "#C07E45",
      faceLight: "#E4B07A",
      faceDark: "#93603A",
      muzzle: "#C58A52",
      chin: "#EDE2D4",
      white: "#F4F6F7",
      whiteShade: "#CDD3D8",
      nose: "#1A1817",
      iris: "#2A1C12",
      innerEar: "#9C7650",
    },
    markings: { blaze: false, ruffWidth: 1.06, legs: "white", eyes: "round", tailTip: false },
    palettesAreProvisional: false,
    voice: {
      description:
        "Hombre joven, paisa de Medellín, más expresivo y rápido, bromista, gesticula con la voz. Risitas breves.",
      elevenLabsVoiceEnv: "ELEVENLABS_VOICE_EURO",
      stability: 0.35,
      similarityBoost: 0.8,
      style: 0.55,
      estimatedCharsPerSecond: 19,
    },
    studioAnchor: { x: 780, y: 1530 },
    nearSide: "left",
    photo: { headPivot: [0.5, 0.85], jawTravelPx: 26 },
  },
};

// Color de subtítulo cuando hablan los dos a la vez.
export const BOTH_CAPTION_COLOR = "#FFFFFF";
