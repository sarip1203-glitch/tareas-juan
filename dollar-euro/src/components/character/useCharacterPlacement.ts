import { CHARACTERS } from "../../config/characters";
import type { CharacterId } from "../../episodes/types";
import type { CharacterFrame } from "./pose";

// Tamaño estándar de los perros en el estudio (px de ancho, rig de 600 u).
export const STUDIO_DOG_WIDTH = 470;

// Centro aproximado de la cabeza en coordenadas del mundo.
export const headWorldPosition = (id: CharacterId, cf: CharacterFrame, width = STUDIO_DOG_WIDTH) => {
  const a = CHARACTERS[id].studioAnchor;
  const s = width / 600;
  return {
    x: a.x + cf.body.x + cf.pose.headX * s,
    y: a.y + cf.body.y - (800 - 234) * s * cf.body.scale + cf.pose.headY * s,
  };
};
