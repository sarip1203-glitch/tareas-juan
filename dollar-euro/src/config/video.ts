// Formato vertical para TikTok, Reels y Shorts.
export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

// Zonas seguras (px). Las interfaces de TikTok/Reels/Shorts tapan la parte
// superior (≈ 200 px), la inferior (≈ 420 px: descripción, música) y la
// columna derecha (≈ 150 px: likes, comentarios, compartir).
export const SAFE_ZONE = {
  top: 210,
  bottom: 430,
  left: 70,
  right: 150,
} as const;

// Línea base inferior de los subtítulos (distancia al borde inferior).
export const CAPTION_BOTTOM = SAFE_ZONE.bottom + 20;

export const msToFrames = (ms: number, fps: number = VIDEO.fps) =>
  Math.round((ms / 1000) * fps);

export const framesToMs = (frames: number, fps: number = VIDEO.fps) =>
  (frames / fps) * 1000;
