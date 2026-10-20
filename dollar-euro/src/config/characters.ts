import type { CharacterId } from "../episodes/types";

/**
 * Identidad de los personajes.
 *
 * ⚠️ PALETAS PROVISIONALES: todavía no tenemos las fotografías reales de
 * Dollar y Euro. Los colores de pelaje que aparecen aquí son genéricos de
 * pastor de Shetland (sable y blanco) y NO representan a los perros reales.
 * Cuando lleguen las fotos:
 *   1. Ajustar `palette` de cada perro (colores, manchas, blaze).
 *   2. O bien colocar recortes en public/characters/<perro>/ y el sistema
 *      cambiará automáticamente al modo foto (ver README).
 *
 * Lo único que identifica a cada perro mientras tanto es el COLLAR
 * (azul = Dollar, amarillo = Euro), que coincide con su color de subtítulos.
 * Nunca intercambiar estos valores entre personajes.
 */
export type FurPalette = {
  coat: string; // pelaje principal (sable)
  coatDark: string; // sombras / puntas
  coatLight: string; // brillos
  white: string; // collar de pelo, blaze, patas
  whiteShade: string;
  nose: string;
  iris: string;
  innerEar: string;
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
      coat: "#C8873D",
      coatDark: "#7E4A1E",
      coatLight: "#E9B672",
      white: "#FAF5EC",
      whiteShade: "#D9CFC0",
      nose: "#1B1412",
      iris: "#4A2A12",
      innerEar: "#E7B9A4",
    },
    palettesAreProvisional: true,
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
      coat: "#B9783A",
      coatDark: "#6F3F18",
      coatLight: "#DFA866",
      white: "#FBF6EE",
      whiteShade: "#DCD2C3",
      nose: "#1B1412",
      iris: "#3E230F",
      innerEar: "#EBBBA6",
    },
    palettesAreProvisional: true,
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
