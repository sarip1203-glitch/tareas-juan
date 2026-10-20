import React from "react";
import { VIDEO } from "../config/video";
import type { StudioFraming } from "../episodes/types";

// Cámara virtual: un punto del mundo (cx, cy) se lleva a la posición de
// pantalla (540, focusY) con un zoom. El mundo mide 1080×1920.

export type CameraState = { cx: number; cy: number; zoom: number; focusY: number; rot?: number };

export const FRAMINGS: Record<StudioFraming, CameraState> = {
  wide: { cx: 540, cy: 960, zoom: 1, focusY: 960 },
  twoShot: { cx: 540, cy: 1150, zoom: 1.17, focusY: 960 },
  closeDollar: { cx: 300, cy: 1090, zoom: 1.85, focusY: 900 },
  closeEuro: { cx: 780, cy: 1090, zoom: 1.85, focusY: 900 },
  reactionDollar: { cx: 320, cy: 1110, zoom: 1.55, focusY: 930, rot: -1.2 },
  reactionEuro: { cx: 760, cy: 1110, zoom: 1.55, focusY: 930, rot: 1.2 },
  tipBoard: { cx: 540, cy: 900, zoom: 1, focusY: 960 },
};

export const worldToScreen = (cam: CameraState, x: number, y: number) => ({
  x: (x - cam.cx) * cam.zoom + VIDEO.width / 2,
  y: (y - cam.cy) * cam.zoom + cam.focusY,
});

export const Camera: React.FC<{ cam: CameraState; children: React.ReactNode }> = ({ cam, children }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: VIDEO.width,
      height: VIDEO.height,
      transformOrigin: "0 0",
      transform: `translate(${VIDEO.width / 2}px, ${cam.focusY}px) rotate(${cam.rot ?? 0}deg) scale(${cam.zoom}) translate(${-cam.cx}px, ${-cam.cy}px)`,
    }}
  >
    {children}
  </div>
);
